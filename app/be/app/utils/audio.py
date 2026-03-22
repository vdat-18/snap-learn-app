"""Audio utilities — format validation, size checking."""

from __future__ import annotations

MAX_AUDIO_SIZE_FREE = 1 * 1024 * 1024  # 1 MB
MAX_AUDIO_SIZE_PREMIUM = 2 * 1024 * 1024  # 2 MB

# Minimum and maximum duration in seconds
MIN_DURATION_S = 0.3
MAX_DURATION_S = 5.0


def validate_audio(
    audio_bytes: bytes,
    *,
    is_premium: bool = False,
) -> None:
    """Validate audio data.

    Checks:
    - Size limit (1 MB free, 2 MB premium)
    - Format sniffing for WebM or WAV headers

    Raises ValueError if validation fails.
    """
    max_size = MAX_AUDIO_SIZE_PREMIUM if is_premium else MAX_AUDIO_SIZE_FREE
    if len(audio_bytes) > max_size:
        raise ValueError(
            f"Audio too large ({len(audio_bytes)} bytes). "
            f"Maximum is {max_size} bytes."
        )

    if len(audio_bytes) < 4:
        raise ValueError("Audio data too short to be valid.")

    # Sniff format by magic bytes
    header = audio_bytes[:12]
    is_webm = header[:4] == b"\x1a\x45\xdf\xa3"  # EBML header (WebM/MKV)
    is_wav = header[:4] == b"RIFF" and header[8:12] == b"WAVE"

    is_mp4 = len(header) >= 8 and header[4:8] == b"ftyp"
    if not (is_webm or is_wav or is_mp4):
        raise ValueError("Unsupported audio format. Use WebM, WAV, or MP4.")


def openai_transcription_filename(audio_bytes: bytes) -> str:
    """Pick a filename extension OpenAI STT accepts, from magic bytes (not Blob.type).

    Browsers often record MP4/AAC (Safari) or WebM/Opus (Chrome). The client may
    mislabel the container; the API uses the file extension / content.
    Supported: flac, mp3, mp4, mpeg, mpga, m4a, ogg, wav, webm.
    """
    if len(audio_bytes) < 12:
        return "audio.webm"

    if audio_bytes[:4] == b"\x1a\x45\xdf\xa3":
        return "audio.webm"
    if audio_bytes[:4] == b"RIFF" and audio_bytes[8:12] == b"WAVE":
        return "audio.wav"
    if len(audio_bytes) >= 8 and audio_bytes[4:8] == b"ftyp":
        return "audio.mp4"
    if audio_bytes[:4] == b"OggS":
        return "audio.ogg"
    if audio_bytes[:4] == b"fLaC":
        return "audio.flac"
    if audio_bytes[:3] == b"ID3" or (
        (audio_bytes[0] & 0xFF) == 0xFF and (audio_bytes[1] & 0xE0) == 0xE0
    ):
        return "audio.mp3"

    return "audio.webm"
