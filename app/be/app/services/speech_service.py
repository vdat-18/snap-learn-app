"""
SnapLearn Speech Service — BAML Integration
============================================
Wraps BAML-generated async client for pronunciation feedback.
Whisper STT and OpenAI TTS are called via the OpenAI SDK directly
(they are REST APIs, not LLM inference). BAML handles the feedback
generation and pronunciation hints.
"""

from __future__ import annotations

import hashlib
import logging
from pathlib import Path
from typing import Optional

import openai
from baml_client import b
from baml_client.types import Language, PronunciationResult

logger = logging.getLogger(__name__)

# ── TTS Configuration ──────────────────────────────────────────
TTS_MODEL = "tts-1"
TTS_VOICE = "nova"
TTS_SPEED = {
    Language.En: 0.85,
    Language.Vi: 0.80,
    Language.Zh: 0.75,
}
TTS_CACHE_DIR = Path("tts_cache")
TTS_CACHE_TTL_DAYS = 90


# ── Whisper STT (direct OpenAI SDK) ───────────────────────────

async def transcribe_audio(
    audio_bytes: bytes,
    language: Language,
    openai_client: openai.AsyncOpenAI,
) -> str:
    """
    Transcribe child's pronunciation attempt via Whisper.

    Args:
        audio_bytes: Audio blob (WebM/WAV, 0.3-5s, max 1MB)
        language: Expected language for better accuracy
        openai_client: Async OpenAI client instance

    Returns:
        Transcribed text string
    """
    lang_code = language.value  # "en", "vi", "zh"

    response = await openai_client.audio.transcriptions.create(
        model="whisper-1",
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
    1. Transcribe audio via Whisper
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
    logger.info("Whisper transcribed: '%s' (target: '%s')", transcribed, target_word)

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


# ── TTS (direct OpenAI SDK with caching) ──────────────────────

async def synthesize_speech(
    text: str,
    language: Language,
    openai_client: openai.AsyncOpenAI,
    cache_dir: Optional[Path] = None,
) -> bytes:
    """
    Generate TTS audio with local filesystem caching.

    Args:
        text: Text to synthesize
        language: Target language (affects speed)
        openai_client: Async OpenAI client
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

    # Cache miss: generate
    speed = TTS_SPEED.get(language, 0.85)

    response = await openai_client.audio.speech.create(
        model=TTS_MODEL,
        voice=TTS_VOICE,
        input=text,
        speed=speed,
        response_format="mp3",
    )

    audio_bytes = response.content
    cache_file.write_bytes(audio_bytes)
    logger.info("TTS generated and cached: %s (%d bytes)", cache_file, len(audio_bytes))

    return audio_bytes
