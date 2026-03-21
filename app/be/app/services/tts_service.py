"""TTS service — pre-generation and URL resolution.

Wraps the existing speech_service.synthesize_speech() for TTS caching,
and provides URL helpers for the API layer.

TTS is now powered by ElevenLabs (eleven_v3). The synthesize_speech()
function manages the ElevenLabs client internally — no OpenAI client needed.
"""

from __future__ import annotations

import logging
from pathlib import Path
from uuid import UUID

from app.schemas.capture import TTSUrls

logger = logging.getLogger(__name__)


async def ensure_cached(
    word_en: str,
    word_vi: str,
    word_zh: str,
    cache_dir: str,
) -> None:
    """Pre-generate TTS for all 3 languages (non-blocking).

    Called as a background task after capture. Errors are logged but
    do not propagate.
    """
    try:
        from app.services.speech_service import synthesize_speech
        from baml_client.types import Language

        cache_path = Path(cache_dir)

        for text, lang in [
            (word_en, Language.En),
            (word_vi, Language.Vi),
            (word_zh, Language.Zh),
        ]:
            if text:
                try:
                    await synthesize_speech(text, lang, cache_path)
                except Exception:
                    logger.warning("TTS pre-gen failed for '%s' (%s)", text, lang.value, exc_info=True)
    except Exception:
        logger.warning("TTS ensure_cached failed", exc_info=True)


def get_urls(vocab_id: UUID) -> TTSUrls:
    """Build TTS endpoint URLs for a vocab card."""
    base = f"/api/tts/{vocab_id}"
    return TTSUrls(
        en=f"{base}/en",
        vi=f"{base}/vi",
        zh=f"{base}/zh",
    )
