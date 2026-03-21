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

    if not (is_webm or is_wav):
        raise ValueError("Unsupported audio format. Use WebM or WAV.")
