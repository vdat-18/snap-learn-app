"""
SnapLearn Speech Service
========================
ASR uses OpenAI gpt-4o-transcribe via the OpenAI SDK directly.
TTS uses ElevenLabs eleven_v3 as primary, with OpenAI TTS as automatic fallback.
Pronunciation matching and feedback are deterministic (no LLM call).
"""

from __future__ import annotations

import hashlib
import io
import logging
import os
import random
from pathlib import Path
from collections.abc import AsyncIterator
from typing import Optional

import openai
from baml_client import b
from baml_client.types import Language, PronunciationResult
from elevenlabs import AsyncElevenLabs

from app.utils.audio import openai_transcription_filename

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

# ── OpenAI TTS Fallback Configuration ────────────────────────
OPENAI_TTS_MODEL = "tts-1"
# OpenAI voices: alloy, echo, fable, onyx, nova, shimmer
# "nova" is clear and natural; works well across all supported languages
OPENAI_TTS_VOICE = "nova"
# Map ElevenLabs speed (0.7–0.9) to OpenAI speed range (0.25–4.0)
OPENAI_TTS_SPEED: dict[Language, float] = {
    Language.En: 0.9,
    Language.Vi: 0.85,
    Language.Zh: 0.8,
}

# ── ElevenLabs async client (module-level singleton) ─────────
_elevenlabs_client: AsyncElevenLabs | None = None

# ── OpenAI TTS async client (module-level singleton) ─────────
_openai_tts_client: openai.AsyncOpenAI | None = None


def _get_elevenlabs_client() -> AsyncElevenLabs:
    """Lazily initialise and return the ElevenLabs async client."""
    global _elevenlabs_client
    if _elevenlabs_client is None:
        api_key = os.environ.get("ELEVENLABS_API_KEY", "")
        if not api_key:
            raise RuntimeError(
                "ELEVENLABS_API_KEY environment variable is not set"
            )
        _elevenlabs_client = AsyncElevenLabs(api_key=api_key)
    return _elevenlabs_client


def _get_openai_tts_client() -> openai.AsyncOpenAI:
    """Lazily initialise and return the OpenAI async client for TTS fallback."""
    global _openai_tts_client
    if _openai_tts_client is None:
        api_key = os.environ.get("OPENAI_API_KEY", "")
        if not api_key:
            raise RuntimeError(
                "OPENAI_API_KEY environment variable is required for TTS fallback"
            )
        _openai_tts_client = openai.AsyncOpenAI(api_key=api_key)
    return _openai_tts_client


async def _synthesize_openai_tts(text: str, language: Language) -> bytes:
    """
    Generate TTS audio via OpenAI TTS (fallback provider).

    Args:
        text: Text to synthesize
        language: Target language (affects playback speed)

    Returns:
        MP3 audio bytes
    """
    client = _get_openai_tts_client()
    speed = OPENAI_TTS_SPEED.get(language, 0.9)

    response = await client.audio.speech.create(
        model=OPENAI_TTS_MODEL,
        voice=OPENAI_TTS_VOICE,  # type: ignore[arg-type]
        input=text,
        response_format="mp3",
        speed=speed,
    )
    audio_bytes = response.content
    logger.info(
        "OpenAI TTS fallback generated %d bytes for language=%s",
        len(audio_bytes),
        language.value,
    )
    return audio_bytes


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

    # BytesIO + filename from magic bytes — correct container for Safari MP4 vs Chrome WebM
    upload = io.BytesIO(audio_bytes)
    upload.name = openai_transcription_filename(audio_bytes)

    response = await openai_client.audio.transcriptions.create(
        model="gpt-4o-transcribe",
        file=upload,
        language=lang_code if lang_code != "zh" else "zh",
        response_format="text",
    )
    return response.strip()


# ── Similarity Scoring ────────────────────────────────────────

SIMILARITY_3_STAR = 0.80  # >= 80% → 3 stars (great match)
SIMILARITY_2_STAR = 0.50  # >= 50% → 2 stars (close attempt)


def _levenshtein(s1: str, s2: str) -> int:
    """Iterative Levenshtein distance (O(n*m) time, O(m) space)."""
    if len(s1) < len(s2):
        return _levenshtein(s2, s1)
    if not s2:
        return len(s1)

    prev = list(range(len(s2) + 1))
    for i, c1 in enumerate(s1):
        curr = [i + 1]
        for j, c2 in enumerate(s2):
            curr.append(min(
                prev[j + 1] + 1,       # deletion
                curr[j] + 1,            # insertion
                prev[j] + (c1 != c2),   # substitution
            ))
        prev = curr
    return prev[-1]


def _similarity_ratio(a: str, b: str) -> float:
    """Normalized similarity: 1.0 = identical, 0.0 = completely different."""
    if a == b:
        return 1.0
    max_len = max(len(a), len(b))
    if max_len == 0:
        return 1.0
    return 1.0 - _levenshtein(a, b) / max_len


def _score_pronunciation(target: str, transcribed: str) -> tuple[float, bool]:
    """Return (best_similarity, is_exact_contain) between target and transcription.

    Handles multi-word ASR output by checking:
    1. Exact substring containment → 1.0
    2. Best per-word Levenshtein similarity against the target
    """
    t = target.strip().lower()
    tr = transcribed.strip().lower()

    if t in tr:
        return 1.0, True

    best = max(
        (_similarity_ratio(t, word) for word in tr.split()),
        default=0.0,
    )
    return best, False


def _stars_from_similarity(sim: float) -> int:
    if sim >= SIMILARITY_3_STAR:
        return 3
    if sim >= SIMILARITY_2_STAR:
        return 2
    return 1


# ── Feedback Templates ────────────────────────────────────────

_FEEDBACK_3_STAR = [
    "Tuyệt vời! 🎉",
    "Giỏi lắm! Phát âm chuẩn luôn! 👏",
    "Xuất sắc! Con đọc đúng rồi! ⭐",
    "Hay quá! Đúng rồi nè! 🌟",
    "Chính xác! Con giỏi quá! 🎊",
]

_FEEDBACK_2_STAR = [
    "Gần đúng rồi! Thử chậm hơn nha! 😊",
    "Tốt lắm! Sắp chuẩn rồi, thử lại nha! 💪",
    "Nghe gần giống rồi! Cố thêm chút nữa! 🌟",
    "Được lắm! Thử phát âm rõ hơn nha! 💫",
]

_FEEDBACK_1_STAR_RETRY = [
    "Chưa đúng lắm, thử lần nữa nha! 💪",
    "Cố lên! Mình thử lại nhé! 🌟",
    "Từ này hơi khó, thử lại nha! 😊",
    "Không sao! Thử phát âm chậm hơn nha! 💫",
]

_FEEDBACK_LAST_ATTEMPT = [
    "Giỏi lắm vì đã cố gắng! Mình học từ tiếp theo nha! 🌈",
    "Con cố gắng tốt lắm! Tiếp tục nha! 💖",
    "Không sao đâu! Mình sẽ giỏi hơn! 🌻",
]


def _pick_feedback(stars: int, attempt_number: int) -> str:
    if stars == 3:
        return random.choice(_FEEDBACK_3_STAR)
    if attempt_number >= 3:
        return random.choice(_FEEDBACK_LAST_ATTEMPT)
    if stars == 2:
        return random.choice(_FEEDBACK_2_STAR)
    return random.choice(_FEEDBACK_1_STAR_RETRY)


# ── Pronunciation Judging (deterministic) ─────────────────────


async def judge_pronunciation(
    target_word: str,
    audio_bytes: bytes,
    language: Language,
    attempt_number: int,
    openai_client: openai.AsyncOpenAI,
) -> PronunciationResult:
    """
    Pronunciation judging pipeline:
    1. Transcribe audio via gpt-4o-transcribe
    2. Levenshtein similarity scoring + template-based Vietnamese feedback

    Returns:
        PronunciationResult with stars, match status, and feedback
    """
    transcribed = await transcribe_audio(audio_bytes, language, openai_client)

    similarity, exact_contain = _score_pronunciation(target_word, transcribed)
    stars = _stars_from_similarity(similarity)
    is_match = stars == 3
    feedback_vi = _pick_feedback(stars, attempt_number)

    logger.info(
        "pronunciation scored: '%s' vs '%s' → sim=%.2f stars=%d",
        transcribed, target_word, similarity, stars,
    )

    return PronunciationResult(
        transcribed_text=transcribed,
        target_word=target_word,
        is_match=is_match,
        stars=stars,
        feedback_vi=feedback_vi,
    )


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


def _tts_cache_path(
    text: str, language: Language, cache_dir: Optional[Path] = None,
) -> Path:
    """Return the cache file path for a given text/language pair, creating dirs."""
    cache_root = cache_dir or TTS_CACHE_DIR
    lang_dir = cache_root / language.value.lower()
    lang_dir.mkdir(parents=True, exist_ok=True)
    text_hash = hashlib.sha256(text.encode()).hexdigest()[:16]
    return lang_dir / f"{text_hash}.mp3"


def _tts_voice_and_speed(language: Language) -> tuple[str, float]:
    """Resolve voice ID and speed; raises if voice ID is missing."""
    speed = TTS_SPEED.get(language, 0.85)
    voice_id = ELEVENLABS_VOICE_ID or os.environ.get("ELEVENLABS_VOICE_ID", "")
    if not voice_id:
        raise RuntimeError(
            "ELEVENLABS_VOICE_ID environment variable is required for TTS"
        )
    return voice_id, speed


async def synthesize_speech(
    text: str,
    language: Language,
    cache_dir: Optional[Path] = None,
) -> bytes:
    """
    Generate TTS audio with local filesystem caching.

    Tries ElevenLabs first; automatically falls back to OpenAI TTS if
    ElevenLabs is unavailable or returns an error.  Buffers the full
    response before returning — use for background pre-generation where
    latency is not user-facing.

    Args:
        text: Text to synthesize
        language: Target language (affects speed)
        cache_dir: Override cache directory (default: tts_cache/)

    Returns:
        MP3 audio bytes
    """
    cache_file = _tts_cache_path(text, language, cache_dir)

    # Cache hit
    if cache_file.exists():
        logger.debug("TTS cache hit: %s", cache_file)
        return cache_file.read_bytes()

    # Cache miss: try ElevenLabs first
    audio_bytes: bytes | None = None
    try:
        voice_id, speed = _tts_voice_and_speed(language)
        client = _get_elevenlabs_client()
        audio_iterator = client.text_to_speech.convert(
            text=text,
            voice_id=voice_id,
            model_id=ELEVENLABS_MODEL,
            output_format=TTS_OUTPUT_FORMAT,
            voice_settings={"speed": speed},
        )
        audio_chunks: list[bytes] = []
        async for chunk in audio_iterator:
            audio_chunks.append(chunk)
        audio_bytes = b"".join(audio_chunks)
        logger.info(
            "ElevenLabs TTS generated: %s (%d bytes)", cache_file, len(audio_bytes),
        )
    except Exception as elevenlabs_error:
        logger.warning(
            "ElevenLabs TTS failed (%s), falling back to OpenAI TTS",
            elevenlabs_error,
        )
        try:
            audio_bytes = await _synthesize_openai_tts(text, language)
        except Exception as openai_error:
            logger.error("OpenAI TTS fallback also failed: %s", openai_error)
            raise RuntimeError(
                f"All TTS providers failed. ElevenLabs: {elevenlabs_error}; "
                f"OpenAI: {openai_error}"
            ) from openai_error

    cache_file.write_bytes(audio_bytes)
    logger.info("TTS cached: %s (%d bytes)", cache_file, len(audio_bytes))

    return audio_bytes


async def synthesize_speech_stream(
    text: str,
    language: Language,
    cache_dir: Optional[Path] = None,
) -> AsyncIterator[bytes]:
    """
    Stream TTS audio, yielding chunks as they arrive.

    Tries ElevenLabs streaming first.  If ElevenLabs fails *before* any
    audio chunk is yielded (connection error, auth failure, quota exceeded,
    etc.) the function transparently falls back to OpenAI TTS, buffering
    the result and yielding it as a single chunk.  If ElevenLabs has
    already started streaming and fails mid-way, the error is re-raised
    (partial streams cannot be recovered from).

    On cache hit the entire file is yielded in a single chunk.

    Args:
        text: Text to synthesize
        language: Target language (affects speed)
        cache_dir: Override cache directory (default: tts_cache/)

    Yields:
        MP3 audio byte chunks
    """
    cache_file = _tts_cache_path(text, language, cache_dir)

    # Cache hit — yield the whole file in one go (sub-ms read)
    if cache_file.exists():
        logger.debug("TTS stream cache hit: %s", cache_file)
        yield cache_file.read_bytes()
        return

    # Cache miss — try ElevenLabs streaming first
    elevenlabs_started = False  # True after the first chunk has been yielded
    elevenlabs_error: Exception | None = None
    cache_chunks: list[bytes] = []

    try:
        voice_id, speed = _tts_voice_and_speed(language)
        client = _get_elevenlabs_client()

        audio_stream = client.text_to_speech.stream(
            text=text,
            voice_id=voice_id,
            model_id=ELEVENLABS_MODEL,
            output_format=TTS_OUTPUT_FORMAT,
            voice_settings={"speed": speed},
        )

        async for chunk in audio_stream:
            elevenlabs_started = True
            cache_chunks.append(chunk)
            yield chunk

        # Persist to cache after the full stream has been sent
        audio_bytes = b"".join(cache_chunks)
        cache_file.write_bytes(audio_bytes)
        logger.info(
            "ElevenLabs TTS streamed and cached: %s (%d bytes)",
            cache_file,
            len(audio_bytes),
        )
        return

    except Exception as exc:
        if elevenlabs_started:
            # Already yielded partial data — cannot recover gracefully
            logger.error(
                "ElevenLabs TTS stream failed mid-way after %d chunks: %s",
                len(cache_chunks),
                exc,
            )
            raise
        elevenlabs_error = exc
        logger.warning(
            "ElevenLabs TTS stream failed before first chunk (%s), "
            "falling back to OpenAI TTS",
            exc,
        )

    # OpenAI TTS fallback — buffer and yield as single chunk
    try:
        audio_bytes = await _synthesize_openai_tts(text, language)
    except Exception as openai_error:
        logger.error("OpenAI TTS fallback also failed: %s", openai_error)
        raise RuntimeError(
            f"All TTS providers failed. ElevenLabs: {elevenlabs_error}; "
            f"OpenAI: {openai_error}"
        ) from openai_error

    cache_file.write_bytes(audio_bytes)
    logger.info(
        "OpenAI TTS fallback cached: %s (%d bytes)", cache_file, len(audio_bytes),
    )
    yield audio_bytes
