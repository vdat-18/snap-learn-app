"""Speech & TTS API routes — POST /pronounce, GET /tts/{vocab_id}/{language}."""

from __future__ import annotations

import base64
import hashlib
from pathlib import Path
from typing import Annotated
from uuid import UUID

import openai
import redis.asyncio as aioredis
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import Settings, get_settings
from app.dependencies import get_current_child, get_db, get_redis
from app.models.captured_vocab import CapturedVocab
from app.models.child_profile import ChildProfile
from app.schemas.speech import PronounceRequest, PronounceResponse
from app.services import game_service
from app.services.speech_service import synthesize_speech
from app.utils.errors import AudioInvalid

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

    # Call BAML speech service
    from baml_client.types import Language as BamlLanguage

    lang_map = {"en": BamlLanguage.en, "vi": BamlLanguage.vi}
    baml_lang = lang_map[body.language]

    from app.services.speech_service import judge_pronunciation

    openai_client = openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    pronunciation_result = await judge_pronunciation(
        target_word=target_word,
        audio_bytes=audio_bytes,
        language=baml_lang,
        attempt_number=1,
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

    # Determine match type
    match_type = "exact" if pronunciation_result.is_match else "no_match"

    return PronounceResponse(
        stars=pronunciation_result.stars,
        match_type=match_type,
        transcript=pronunciation_result.transcribed_text,
        feedback_vi=pronunciation_result.feedback_vi,
        mastery=mastery,
        evolved=evolved,
        xp_earned=xp_earned,
        total_xp=child.total_xp,
    )


@router.get("/tts/{vocab_id}/{language}")
async def get_tts(
    vocab_id: UUID,
    language: str,
    child_id: Annotated[UUID, Depends(get_current_child)],
    db: Annotated[AsyncSession, Depends(get_db)],
    settings: Annotated[Settings, Depends(get_settings)],
) -> Response:
    """Serve TTS audio (MP3) from cache, generating on miss."""

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

    # Check cache first
    cache_root = Path(settings.TTS_CACHE_DIR)
    lang_dir = cache_root / language
    text_hash = hashlib.sha256(text.encode()).hexdigest()[:16]
    cache_file = lang_dir / f"{text_hash}.mp3"

    if cache_file.exists():
        audio_bytes = cache_file.read_bytes()
    else:
        # Generate on demand
        from baml_client.types import Language as BamlLanguage

        lang_enum_map = {
            "en": BamlLanguage.en,
            "vi": BamlLanguage.vi,
            "zh": BamlLanguage.zh,
        }
        audio_bytes = await synthesize_speech(
            text=text,
            language=lang_enum_map[language],
            cache_dir=cache_root,
        )

    return Response(
        content=audio_bytes,
        media_type="audio/mpeg",
        headers={"Content-Disposition": f'inline; filename="{vocab_id}_{language}.mp3"'},
    )
