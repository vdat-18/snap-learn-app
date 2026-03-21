"""Capture service — orchestrates the full photo capture pipeline.

Pipeline: validate → hash → dedup → AI vision → rarity → save vocab →
          game XP → mission check → TTS pre-generation (async).
"""

from __future__ import annotations

import asyncio
import base64
from uuid import UUID

import redis.asyncio as aioredis
import structlog
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import Settings
from app.models.captured_vocab import CapturedVocab
from app.models.child_profile import ChildProfile
from app.schemas.capture import (
    CaptureResponse,
    MissionUpdateResponse,
    TTSUrls,
    VocabCardResponse,
)
from app.services import dedup_service, game_service, storage_service, tts_service
from app.services.rarity_service import calculate_final_xp, classify_rarity
from app.services.vision_service import identify_object
from app.utils.errors import AIServiceError, CaptureLowConfidence, ImageInvalid
from app.utils.image import compress_image, compute_phash, validate_image

logger = structlog.get_logger(__name__)


async def process_capture(
    image_base64: str,
    child: ChildProfile,
    *,
    db: AsyncSession,
    redis: aioredis.Redis,
    settings: Settings,
) -> CaptureResponse:
    """End-to-end capture pipeline."""

    # 1. Decode and validate image
    try:
        raw_bytes = base64.b64decode(image_base64)
    except Exception:
        raise ImageInvalid("Invalid base64 encoding.")

    try:
        info = validate_image(raw_bytes)
    except ValueError as e:
        raise ImageInvalid(str(e))

    # 2. Compress image
    compressed = compress_image(info.image)

    # 3. Compute perceptual hash
    photo_hash = compute_phash(compressed)

    # 4. Check for duplicates
    existing = await dedup_service.find_duplicate(child.id, photo_hash, db=db)
    if existing is not None:
        # Duplicate — award 25% XP
        xp_earned = max(1, int(existing.points_earned * 0.25))
        total_xp, level, leveled_up = await game_service.on_capture(
            child, xp_earned, db=db, redis=redis
        )
        return CaptureResponse(
            status="duplicate",
            vocab_card=_vocab_to_response(existing),
            xp_earned=xp_earned,
            total_xp=total_xp,
            level=level,
            level_up=leveled_up,
            message_vi="Bạn đã chụp cái này rồi! Nhận thêm ít XP nhé!",
        )

    # 5. AI Vision (BAML)
    try:
        from baml_client.types import BlockedResult

        vision_result = await identify_object(compressed)
    except Exception as e:
        logger.error("vision_error", error=str(e))
        raise AIServiceError(str(e))

    # Handle blocked / low confidence
    if hasattr(vision_result, "reason"):
        # It's a BlockedResult
        if getattr(vision_result, "reason", None) == "low_confidence":
            return CaptureResponse(
                status="low_confidence",
                message_vi="Không nhận ra được. Thử chụp lại rõ hơn nha!",
            )
        return CaptureResponse(
            status="low_confidence",
            message_vi="Ảnh không hợp lệ. Thử ảnh khác nhé!",
        )

    # 6. Rarity classification (BAML)
    try:
        rarity_result = await classify_rarity(
            object_en=vision_result.object_en,
            category=vision_result.category,
            difficulty_vi=getattr(vision_result, "difficulty_vi", 1),
        )
    except Exception as e:
        logger.warning("rarity_classification_failed", error=str(e))
        # Default to common if rarity fails
        from baml_client.types import RarityTier

        class _FakeRarity:
            rarity = RarityTier.Common
            base_xp = 10

        rarity_result = _FakeRarity()

    # 7. Category capture count (for diversity multiplier)
    cat_count_result = await db.execute(
        select(func.count()).where(
            CapturedVocab.child_id == child.id,
            CapturedVocab.category == vision_result.category.value
            if hasattr(vision_result.category, "value")
            else vision_result.category,
        )
    )
    category_count = cat_count_result.scalar() or 0

    # 8. Calculate XP
    xp_earned = calculate_final_xp(
        rarity=rarity_result.rarity,
        category_capture_count=category_count,
    )

    # 9. Save photo (optional)
    photo_url = None
    if child.photo_storage_enabled:
        photo_url = await storage_service.save_photo(
            compressed, child.id, settings.UPLOAD_DIR
        )

    # 10. Create vocab record
    cat_value = (
        vision_result.category.value
        if hasattr(vision_result.category, "value")
        else str(vision_result.category)
    )
    rarity_value = (
        rarity_result.rarity.value
        if hasattr(rarity_result.rarity, "value")
        else str(rarity_result.rarity)
    )
    print(f'Orignal rarity: {rarity_value}')

    existing_word = await dedup_service.find_word_duplicate(
        child.id, vision_result.object_en, vision_result.object_vi, db=db
    )
    if existing_word is not None:
        xp_earned = max(1, int(existing_word.points_earned * 0.25))
        total_xp, level, leveled_up = await game_service.on_capture(
            child, xp_earned, db=db, redis=redis
        )
        return CaptureResponse(
            status="duplicate",
            vocab_card=_vocab_to_response(existing_word),
            xp_earned=xp_earned,
            total_xp=total_xp,
            level=level,
            level_up=leveled_up,
            message_vi="Bạn đã có từ này rồi! Nhận thêm ít XP nhé!",
        )

    vocab = CapturedVocab(
        child_id=child.id,
        word_en=vision_result.object_en,
        word_vi=vision_result.object_vi,
        word_zh=vision_result.object_zh,
        phonetic_en=getattr(vision_result, "phonetic_en", None),
        category=cat_value,
        rarity_tier=rarity_value,
        confidence=vision_result.confidence,
        description_vi=getattr(vision_result, "description_vi", None),
        points_earned=xp_earned,
        photo_url=photo_url,
        photo_hash=photo_hash,
    )
    db.add(vocab)
    await db.flush()

    # 11. Update game state
    total_xp, level, leveled_up = await game_service.on_capture(
        child, xp_earned, db=db, redis=redis
    )

    # 12. Check mission progress
    mission_updates: list[MissionUpdateResponse] = []
    try:
        from app.services import mission_service

        updates = await mission_service.on_capture(child.id, cat_value, db=db)
        mission_updates = updates
    except Exception:
        logger.warning("mission_check_failed", exc_info=True)

    # 13. Pre-generate TTS (non-blocking)
    asyncio.create_task(
        tts_service.ensure_cached(
            word_en=vision_result.object_en,
            word_vi=vision_result.object_vi,
            word_zh=vision_result.object_zh,
            cache_dir=settings.TTS_CACHE_DIR,
            description_vi=getattr(vision_result, "description_vi", None),
        )
    )

    # 14. Build TTS URLs
    tts_urls = tts_service.get_urls(vocab.id)
    description_tts_urls = tts_service.get_description_urls(vocab.id)

    return CaptureResponse(
        status="new_capture",
        vocab_card=_vocab_to_response(vocab),
        xp_earned=xp_earned,
        total_xp=total_xp,
        level=level,
        level_up=leveled_up,
        mission_updates=mission_updates,
        tts_urls=tts_urls,
        description_tts_urls=description_tts_urls,
    )


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _vocab_to_response(vocab: CapturedVocab) -> VocabCardResponse:
    return VocabCardResponse(
        id=vocab.id,
        word_en=vocab.word_en,
        word_vi=vocab.word_vi,
        word_zh=vocab.word_zh,
        phonetic_en=vocab.phonetic_en,
        category=vocab.category,
        rarity_tier=vocab.rarity_tier,
        description_vi=vocab.description_vi,
        confidence=vocab.confidence,
        photo_url=vocab.photo_url,
    )
