"""Speech & TTS API routes — POST /pronounce, GET /tts/{vocab_id}/{language}."""

from __future__ import annotations

import base64
import hashlib
import logging
from pathlib import Path
from typing import Annotated
from uuid import UUID

import openai
import redis.asyncio as aioredis
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from fastapi.responses import Response, StreamingResponse
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import Settings, get_settings
from app.dependencies import get_current_child, get_current_parent, get_db, get_redis
from app.models.captured_vocab import CapturedVocab
from app.models.child_profile import ChildProfile
from app.schemas.speech import PronounceRequest, PronounceResponse
from app.services import game_service
from app.services.speech_service import synthesize_speech, synthesize_speech_stream
from app.services.tts_service import clear_cache
from app.utils.errors import AudioInvalid
from app.utils.vocab_image import lookup_vocab_image

logger = logging.getLogger(__name__)

router = APIRouter(tags=["speech"])


@router.post("/pronounce", response_model=PronounceResponse)
async def pronounce(
    body: PronounceRequest,
    child_id: Annotated[UUID, Depends(get_current_child)],
    db: Annotated[AsyncSession, Depends(get_db)],
    redis: Annotated[aioredis.Redis, Depends(get_redis)],
    settings: Annotated[Settings, Depends(get_settings)],
) -> PronounceResponse:
    """Submit audio for pronunciation checking."""

    # Load vocab (must belong to this child)
    result = await db.execute(
        select(CapturedVocab).where(
            CapturedVocab.id == body.vocab_id,
            CapturedVocab.child_id == child_id,
        )
    )
    vocab = result.scalar_one_or_none()
    if vocab is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vocab card not found.",
        )

    # Decode audio
    try:
        audio_bytes = base64.b64decode(body.audio_base64)
    except Exception:
        raise AudioInvalid("Invalid base64 audio encoding.")

    # Determine target word for the language
    target_word = vocab.word_en if body.language == "en" else vocab.word_vi

    from baml_client.types import Language as BamlLanguage

    lang_map = {"en": BamlLanguage.En, "vi": BamlLanguage.Vi}
    baml_lang = lang_map[body.language]

    from app.services.speech_service import judge_pronunciation

    openai_client = openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    pronunciation_result = await judge_pronunciation(
        target_word=target_word,
        audio_bytes=audio_bytes,
        language=baml_lang,
        attempt_number=body.attempt_number,
        openai_client=openai_client,
    )

    # Load child for game service
    child_result = await db.execute(
        select(ChildProfile).where(ChildProfile.id == child_id)
    )
    child = child_result.scalar_one()

    # Update game state
    mastery, evolved, xp_earned = await game_service.on_pronunciation(
        child=child,
        vocab=vocab,
        language=body.language,
        stars=pronunciation_result.stars,
        db=db,
        redis=redis,
    )

    # Determine match type from star rating
    _MATCH_TYPE = {3: "exact", 2: "close", 1: "no_match"}
    match_type = _MATCH_TYPE[pronunciation_result.stars]

    image_url = lookup_vocab_image(target_word) if match_type == "exact" else None

    return PronounceResponse(
        stars=pronunciation_result.stars,
        match_type=match_type,
        transcript=pronunciation_result.transcribed_text,
        feedback_vi=pronunciation_result.feedback_vi,
        mastery=mastery,
        evolved=evolved,
        xp_earned=xp_earned,
        total_xp=child.total_xp,
        image_url=image_url,
    )


@router.get("/tts/{vocab_id}/{language}")
async def get_tts(
    vocab_id: UUID,
    language: str,
    child_id: Annotated[UUID, Depends(get_current_child)],
    db: Annotated[AsyncSession, Depends(get_db)],
    settings: Annotated[Settings, Depends(get_settings)],
) -> Response:
    """Serve TTS audio (MP3) — cached hits return immediately, misses stream."""

    if language not in ("en", "vi", "zh"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Language must be 'en', 'vi', or 'zh'.",
        )

    # Load vocab to get the word text
    result = await db.execute(
        select(CapturedVocab).where(
            CapturedVocab.id == vocab_id,
            CapturedVocab.child_id == child_id,
        )
    )
    vocab = result.scalar_one_or_none()
    if vocab is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vocab card not found.",
        )

    # Get the text for this language
    text_map = {"en": vocab.word_en, "vi": vocab.word_vi, "zh": vocab.word_zh}
    text = text_map[language]

    # Check cache first — serve cached files as a plain Response (fastest)
    cache_root = Path(settings.TTS_CACHE_DIR)
    lang_dir = cache_root / language
    text_hash = hashlib.sha256(text.encode()).hexdigest()[:16]
    cache_file = lang_dir / f"{text_hash}.mp3"

    response_headers = {
        "Content-Disposition": f'inline; filename="{vocab_id}_{language}.mp3"',
    }

    if cache_file.exists():
        audio_bytes = cache_file.read_bytes()
        return Response(
            content=audio_bytes,
            media_type="audio/mpeg",
            headers=response_headers,
        )

    # Cache miss — stream from ElevenLabs for lower time-to-first-byte
    from baml_client.types import Language as BamlLanguage

    lang_enum_map = {
        "en": BamlLanguage.En,
        "vi": BamlLanguage.Vi,
        "zh": BamlLanguage.Zh,
    }

    return StreamingResponse(
        synthesize_speech_stream(
            text=text,
            language=lang_enum_map[language],
            cache_dir=cache_root,
        ),
        media_type="audio/mpeg",
        headers=response_headers,
    )


@router.get("/tts/description/{vocab_id}/{language}")
async def get_description_tts(
    vocab_id: UUID,
    language: str,
    child_id: Annotated[UUID, Depends(get_current_child)],
    db: Annotated[AsyncSession, Depends(get_db)],
    settings: Annotated[Settings, Depends(get_settings)],
) -> Response:
    """Serve description TTS audio (MP3) — cached hits return immediately, misses stream."""

    if language not in ("en", "vi", "zh"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Language must be 'en', 'vi', or 'zh'.",
        )

    # Load vocab to get the description text
    result = await db.execute(
        select(CapturedVocab).where(
            CapturedVocab.id == vocab_id,
            CapturedVocab.child_id == child_id,
        )
    )
    vocab = result.scalar_one_or_none()
    if vocab is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vocab card not found.",
        )

    # Get description text for this language
    text_map = {
        "en": vocab.description_en,
        "vi": vocab.description_vi,
        "zh": vocab.description_zh,
    }
    text = text_map[language]

    if not text:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No description available for this language.",
        )

    # Check cache first
    cache_root = Path(settings.TTS_CACHE_DIR)
    lang_dir = cache_root / language
    text_hash = hashlib.sha256(text.encode()).hexdigest()[:16]
    cache_file = lang_dir / f"{text_hash}.mp3"

    response_headers = {
        "Content-Disposition": f'inline; filename="desc_{vocab_id}_{language}.mp3"',
    }

    if cache_file.exists():
        audio_bytes = cache_file.read_bytes()
        return Response(
            content=audio_bytes,
            media_type="audio/mpeg",
            headers=response_headers,
        )

    # Cache miss — stream from ElevenLabs
    from baml_client.types import Language as BamlLanguage

    lang_enum_map = {
        "en": BamlLanguage.En,
        "vi": BamlLanguage.Vi,
        "zh": BamlLanguage.Zh,
    }

    return StreamingResponse(
        synthesize_speech_stream(
            text=text,
            language=lang_enum_map[language],
            cache_dir=cache_root,
        ),
        media_type="audio/mpeg",
        headers=response_headers,
    )


# ── On-demand TTS: synthesize arbitrary text ─────────────────


class SynthesizeRequest(BaseModel):
    text: str
    language: str  # "en", "vi", or "zh"


@router.post("/tts/synthesize")
async def synthesize_tts(
    body: SynthesizeRequest,
    settings: Annotated[Settings, Depends(get_settings)],
) -> Response:
    """Synthesize TTS audio for arbitrary text via ElevenLabs.

    Accepts a text string and language, returns MP3 audio.
    Uses the shared TTS cache — if the text was previously synthesized,
    the cached result is returned instantly.

    No authentication required — used for description narration on capture.
    """
    if body.language not in ("en", "vi", "zh"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Language must be 'en', 'vi', or 'zh'.",
        )

    if not body.text or not body.text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Text must not be empty.",
        )

    # Limit text length to prevent abuse (descriptions are typically < 500 chars)
    if len(body.text) > 1000:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Text must be 1000 characters or less.",
        )

    cache_root = Path(settings.TTS_CACHE_DIR)
    text_hash = hashlib.sha256(body.text.encode()).hexdigest()[:16]
    lang_dir = cache_root / body.language
    cache_file = lang_dir / f"{text_hash}.mp3"

    response_headers = {
        "Content-Disposition": f'inline; filename="tts_{body.language}_{text_hash}.mp3"',
        "Cache-Control": "public, max-age=86400",
    }

    # Cache hit — return immediately
    if cache_file.exists():
        audio_bytes = cache_file.read_bytes()
        return Response(
            content=audio_bytes,
            media_type="audio/mpeg",
            headers=response_headers,
        )

    # Cache miss — stream from ElevenLabs
    from baml_client.types import Language as BamlLanguage

    lang_enum_map = {
        "en": BamlLanguage.En,
        "vi": BamlLanguage.Vi,
        "zh": BamlLanguage.Zh,
    }

    return StreamingResponse(
        synthesize_speech_stream(
            text=body.text,
            language=lang_enum_map[body.language],
            cache_dir=cache_root,
        ),
        media_type="audio/mpeg",
        headers=response_headers,
    )


# ── Admin: TTS Cache Management ──────────────────────────────


class TTSCacheRefreshRequest(BaseModel):
    language: str | None = None


class TTSCacheRefreshResponse(BaseModel):
    status: str
    deleted: int = 0
    generated: int = 0
    failed: int = 0
    message: str = ""


@router.post(
    "/tts/cache/refresh",
    response_model=TTSCacheRefreshResponse,
)
async def refresh_tts_cache(
    body: TTSCacheRefreshRequest,
    background_tasks: BackgroundTasks,
    parent_id: Annotated[UUID, Depends(get_current_parent)],
    db: Annotated[AsyncSession, Depends(get_db)],
    settings: Annotated[Settings, Depends(get_settings)],
) -> TTSCacheRefreshResponse:
    """Clear TTS cache and regenerate all vocab audio in the background.

    Requires parent authentication (admin action).
    The response returns immediately; regeneration happens in a background task.
    """
    if body.language and body.language not in ("en", "vi", "zh"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Language must be 'en', 'vi', or 'zh'.",
        )

    cache_dir = settings.TTS_CACHE_DIR

    # Load all distinct words and descriptions from the DB
    result = await db.execute(
        select(
            CapturedVocab.word_en,
            CapturedVocab.word_vi,
            CapturedVocab.word_zh,
            CapturedVocab.description_en,
            CapturedVocab.description_vi,
            CapturedVocab.description_zh,
        ).distinct()
    )
    rows = result.all()
    words = [(row.word_en, row.word_vi, row.word_zh) for row in rows]
    descriptions = [(row.description_en, row.description_vi, row.description_zh) for row in rows]

    if not words:
        deleted = clear_cache(cache_dir, language=body.language)
        return TTSCacheRefreshResponse(
            status="completed",
            deleted=deleted,
            message="Cache cleared. No vocab found to regenerate.",
        )

    # Clear synchronously so the user knows old files are gone
    deleted = clear_cache(cache_dir, language=body.language)

    # Warm in the background — don't block the HTTP response
    async def _warm() -> None:
        try:
            from app.services.tts_service import warm_cache
            success, failed = await warm_cache(words, cache_dir, descriptions=descriptions)
            logger.info(
                "Background TTS warm complete: %d ok, %d failed", success, failed,
            )
        except Exception:
            logger.exception("Background TTS warm failed")

    background_tasks.add_task(_warm)

    return TTSCacheRefreshResponse(
        status="warming",
        deleted=deleted,
        generated=0,
        failed=0,
        message=(
            f"Cache cleared ({deleted} files). "
            f"Regenerating {len(words)} word sets in the background."
        ),
    )
