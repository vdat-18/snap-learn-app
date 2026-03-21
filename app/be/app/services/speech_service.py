"""
SnapLearn Speech Service — BAML Integration
============================================
Wraps BAML-generated async client for pronunciation feedback.
ASR uses OpenAI gpt-4o-transcribe via the OpenAI SDK directly.
TTS uses ElevenLabs eleven_v3 via the elevenlabs SDK.
BAML handles the feedback generation and pronunciation hints.
"""

from __future__ import annotations

import hashlib
import logging
import os
from pathlib import Path
from typing import Optional

import openai
from baml_client import b
from baml_client.types import Language, PronunciationResult
from elevenlabs import AsyncElevenLabs

logger = logging.getLogger(__name__)

# ── ElevenLabs TTS Configuration ─────────────────────────────
ELEVENLABS_MODEL = "eleven_v3"
ELEVENLABS_VOICE_ID = os.environ.get("ELEVENLABS_VOICE_ID", "")
TTS_SPEED = {
    Language.En: 0.85,
    Language.Vi: 0.80,
    Language.Zh: 0.75,
}
TTS_OUTPUT_FORMAT = "mp3_44100_128"
TTS_CACHE_DIR = Path("tts_cache")
TTS_CACHE_TTL_DAYS = 90

# ── ElevenLabs async client (module-level singleton) ─────────
_elevenlabs_client: AsyncElevenLabs | None = None


def _get_elevenlabs_client() -> AsyncElevenLabs:
    """Lazily initialise and return the ElevenLabs async client."""
    global _elevenlabs_client
    if _elevenlabs_client is None:
        api_key = os.environ.get("ELEVENLABS_API_KEY", "")
        if not api_key:
            raise RuntimeError(
                "ELEVENLABS_API_KEY environment variable is required for TTS"
            )
        _elevenlabs_client = AsyncElevenLabs(api_key=api_key)
    return _elevenlabs_client


# ── ASR (OpenAI gpt-4o-transcribe) ──────────────────────────


async def transcribe_audio(
    audio_bytes: bytes,
    language: Language,
    openai_client: openai.AsyncOpenAI,
) -> str:
    """
    Transcribe child's pronunciation attempt via gpt-4o-transcribe.

    Args:
        audio_bytes: Audio blob (WebM/WAV, 0.3-5s, max 1MB)
        language: Expected language for better accuracy
        openai_client: Async OpenAI client instance

    Returns:
        Transcribed text string
    """
    lang_code = language.value  # "en", "vi", "zh"

    response = await openai_client.audio.transcriptions.create(
        model="gpt-4o-transcribe",
        file=("audio.webm", audio_bytes, "audio/webm"),
        language=lang_code if lang_code != "zh" else "zh",
        response_format="text",
    )
    return response.strip()


# ── Pronunciation Judging (BAML) ──────────────────────────────


async def judge_pronunciation(
    target_word: str,
    audio_bytes: bytes,
    language: Language,
    attempt_number: int,
    openai_client: openai.AsyncOpenAI,
) -> PronunciationResult:
    """
    Full pronunciation judging pipeline:
    1. Transcribe audio via gpt-4o-transcribe
    2. Generate feedback via BAML (includes match logic + Vietnamese encouragement)

    Args:
        target_word: The word the child should have said
        audio_bytes: Recorded audio from the child
        language: Target language
        attempt_number: Which attempt (1-3)
        openai_client: Async OpenAI client

    Returns:
        PronunciationResult with stars, match status, and feedback
    """
    # Step 1: Transcribe
    transcribed = await transcribe_audio(audio_bytes, language, openai_client)
    logger.info("ASR transcribed: '%s' (target: '%s')", transcribed, target_word)

    # Step 2: Generate feedback via BAML
    result: PronunciationResult = await b.GeneratePronunciationFeedback(
        target_word=target_word,
        transcribed_text=transcribed,
        language=language,
        attempt_number=attempt_number,
    )

    return result


# ── Pronunciation Hints (BAML) ────────────────────────────────


async def get_pronunciation_hint(word: str, language: Language) -> str:
    """
    Get a short Vietnamese pronunciation hint for a word.

    Args:
        word: The word to generate a hint for
        language: Language of the word

    Returns:
        Short hint string in Vietnamese
    """
    return await b.GeneratePronunciationHint(word=word, language=language)


# ── TTS (ElevenLabs with filesystem caching) ─────────────────


async def synthesize_speech(
    text: str,
    language: Language,
    cache_dir: Optional[Path] = None,
) -> bytes:
    """
    Generate TTS audio via ElevenLabs with local filesystem caching.

    Args:
        text: Text to synthesize
        language: Target language (affects speed)
        cache_dir: Override cache directory (default: tts_cache/)

    Returns:
        MP3 audio bytes
    """
    cache_root = cache_dir or TTS_CACHE_DIR
    lang_dir = cache_root / language.value
    lang_dir.mkdir(parents=True, exist_ok=True)

    # Cache key: hash of text
    text_hash = hashlib.sha256(text.encode()).hexdigest()[:16]
    cache_file = lang_dir / f"{text_hash}.mp3"

    # Cache hit
    if cache_file.exists():
        logger.debug("TTS cache hit: %s", cache_file)
        return cache_file.read_bytes()

    # Cache miss: generate via ElevenLabs
    speed = TTS_SPEED.get(language, 0.85)
    voice_id = ELEVENLABS_VOICE_ID or os.environ.get("ELEVENLABS_VOICE_ID", "")
    if not voice_id:
        raise RuntimeError(
            "ELEVENLABS_VOICE_ID environment variable is required for TTS"
        )

    client = _get_elevenlabs_client()
    audio_iterator = client.text_to_speech.convert(
        text=text,
        voice_id=voice_id,
        model_id=ELEVENLABS_MODEL,
        output_format=TTS_OUTPUT_FORMAT,
        voice_settings={
            "speed": speed,
        },
    )

    # Collect audio bytes from the async iterator
    audio_chunks: list[bytes] = []
    async for chunk in audio_iterator:
        audio_chunks.append(chunk)
    audio_bytes = b"".join(audio_chunks)

    cache_file.write_bytes(audio_bytes)
    logger.info("TTS generated and cached: %s (%d bytes)", cache_file, len(audio_bytes))

    return audio_bytes
