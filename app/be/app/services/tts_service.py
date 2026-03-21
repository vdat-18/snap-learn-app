"""TTS service — pre-generation, cache management, and URL resolution.

Wraps the existing speech_service.synthesize_speech() for TTS caching,
and provides URL helpers for the API layer.

TTS is now powered by ElevenLabs (eleven_v3). The synthesize_speech()
function manages the ElevenLabs client internally — no OpenAI client needed.
"""

from __future__ import annotations

import logging
import shutil
from pathlib import Path
from uuid import UUID

from app.schemas.capture import TTSUrls

logger = logging.getLogger(__name__)


async def ensure_cached(
    word_en: str,
    word_vi: str,
    word_zh: str,
    cache_dir: str,
    description_vi: str | None = None,
) -> None:
    """Pre-generate TTS for all 3 languages (non-blocking).

    Called as a background task after capture. Generates TTS for both
    words and descriptions. Errors are logged but do not propagate.
    """
    try:
        from app.services.speech_service import synthesize_speech
        from baml_client.types import Language

        cache_path = Path(cache_dir)

        # Pre-generate word TTS
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

        # Pre-generate description TTS (Vietnamese only)
        if description_vi:
            try:
                await synthesize_speech(description_vi, Language.Vi, cache_path)
            except Exception:
                logger.warning("TTS pre-gen failed for description '%s' (%s)", description_vi[:30], "vi", exc_info=True)
    except Exception:
        logger.warning("TTS ensure_cached failed", exc_info=True)


def clear_cache(cache_dir: str, language: str | None = None) -> int:
    """Remove cached TTS files.

    Args:
        cache_dir: Root TTS cache directory path.
        language: If provided ("en", "vi", "zh"), only clear that language's
                  sub-directory.  Otherwise clear everything.

    Returns:
        Number of files deleted.
    """
    cache_root = Path(cache_dir)
    if not cache_root.exists():
        logger.info("TTS cache directory does not exist: %s", cache_root)
        return 0

    deleted = 0
    if language:
        lang_dir = cache_root / language
        if lang_dir.exists():
            files = list(lang_dir.glob("*.mp3"))
            deleted = len(files)
            shutil.rmtree(lang_dir)
            logger.info("Cleared %d cached TTS files for '%s'", deleted, language)
    else:
        for lang_dir in cache_root.iterdir():
            if lang_dir.is_dir():
                deleted += len(list(lang_dir.glob("*.mp3")))
        # Remove and recreate root so the directory still exists
        shutil.rmtree(cache_root)
        cache_root.mkdir(parents=True, exist_ok=True)
        logger.info("Cleared %d cached TTS files (all languages)", deleted)

    return deleted


async def warm_cache(
    words: list[tuple[str, str, str]],
    cache_dir: str,
    descriptions: list[tuple[str | None, str | None, str | None]] | None = None,
) -> tuple[int, int]:
    """Re-generate TTS for a list of vocab words (all 3 languages).

    Args:
        words: List of (word_en, word_vi, word_zh) tuples.
        cache_dir: Root TTS cache directory path.
        descriptions: Optional list of (desc_en, desc_vi, desc_zh) tuples.

    Returns:
        Tuple of (success_count, failure_count).
    """
    from app.services.speech_service import synthesize_speech
    from baml_client.types import Language

    cache_path = Path(cache_dir)
    success = 0
    failed = 0

    for word_en, word_vi, word_zh in words:
        for text, lang in [
            (word_en, Language.En),
            (word_vi, Language.Vi),
            (word_zh, Language.Zh),
        ]:
            if not text:
                continue
            try:
                await synthesize_speech(text, lang, cache_path)
                success += 1
            except Exception:
                failed += 1
                logger.warning(
                    "TTS warm_cache failed for '%s' (%s)",
                    text, lang.value, exc_info=True,
                )

    # Also warm description TTS if provided
    if descriptions:
        for desc_en, desc_vi, desc_zh in descriptions:
            for text, lang in [
                (desc_en, Language.En),
                (desc_vi, Language.Vi),
                (desc_zh, Language.Zh),
            ]:
                if not text:
                    continue
                try:
                    await synthesize_speech(text, lang, cache_path)
                    success += 1
                except Exception:
                    failed += 1
                    logger.warning(
                        "TTS warm_cache failed for description '%s' (%s)",
                        text[:30], lang.value, exc_info=True,
                    )

    logger.info(
        "TTS cache warming complete: %d generated, %d failed",
        success, failed,
    )
    return success, failed


async def clear_and_warm(
    words: list[tuple[str, str, str]],
    cache_dir: str,
    language: str | None = None,
) -> dict:
    """Clear cache then immediately re-generate all vocab TTS.

    This is the main entry point for safe cache refresh — no cold-start gap.

    Args:
        words: List of (word_en, word_vi, word_zh) tuples to regenerate.
        cache_dir: Root TTS cache directory path.
        language: Optional — only clear + warm one language.

    Returns:
        Dict with deleted, generated, and failed counts.
    """
    deleted = clear_cache(cache_dir, language)
    generated, failed = await warm_cache(words, cache_dir)
    return {
        "deleted": deleted,
        "generated": generated,
        "failed": failed,
    }


def get_urls(vocab_id: UUID) -> TTSUrls:
    """Build TTS endpoint URLs for a vocab card."""
    base = f"/api/tts/{vocab_id}"
    return TTSUrls(
        en=f"{base}/en",
        vi=f"{base}/vi",
        zh=f"{base}/zh",
    )


def get_description_urls(vocab_id: UUID) -> TTSUrls:
    """Build TTS endpoint URLs for description audio of a vocab card."""
    base = f"/api/tts/description/{vocab_id}"
    return TTSUrls(
        en=f"{base}/en",
        vi=f"{base}/vi",
        zh=f"{base}/zh",
    )
