"""Custom error classes for the SnapLearn backend.

All errors extend AppError, which is caught by the global exception handler
in main.py and serialised into a consistent JSON error response.
"""

from __future__ import annotations

from app.utils.constants import ERROR_CODES


class AppError(Exception):
    """Base exception with error code, bilingual messages, and HTTP status."""

    def __init__(
        self,
        code: str,
        *,
        status_code: int = 400,
        message_vi: str | None = None,
        message_en: str | None = None,
        details: dict | None = None,
    ) -> None:
        defaults = ERROR_CODES.get(code, {})
        self.code = code
        self.status_code = status_code
        self.message_vi = message_vi or defaults.get("message_vi", "Có lỗi rồi!")
        self.message_en = message_en or defaults.get("message_en", "An error occurred.")
        self.details = details
        super().__init__(self.message_en)


# ---------------------------------------------------------------------------
# Auth errors
# ---------------------------------------------------------------------------

class AuthEmailExists(AppError):
    def __init__(self) -> None:
        super().__init__("AUTH_EMAIL_EXISTS", status_code=409)


class AuthCredentialsInvalid(AppError):
    def __init__(self) -> None:
        super().__init__("AUTH_CREDENTIALS_INVALID", status_code=401)


class AuthInvalid(AppError):
    def __init__(self) -> None:
        super().__init__("AUTH_INVALID", status_code=401)


# ---------------------------------------------------------------------------
# Capture errors
# ---------------------------------------------------------------------------

class CaptureRateLimited(AppError):
    def __init__(self, remaining_seconds: int | None = None) -> None:
        details = {"remaining_seconds": remaining_seconds} if remaining_seconds else None
        super().__init__("CAPTURE_RATE_LIMITED", status_code=429, details=details)


class CaptureLowConfidence(AppError):
    def __init__(self) -> None:
        super().__init__("CAPTURE_LOW_CONFIDENCE", status_code=200)


# ---------------------------------------------------------------------------
# Pronunciation errors
# ---------------------------------------------------------------------------

class PronunciationRateLimited(AppError):
    def __init__(self) -> None:
        super().__init__("PRONUNCIATION_RATE_LIMITED", status_code=429)


# ---------------------------------------------------------------------------
# Time limit
# ---------------------------------------------------------------------------

class TimeLimitReached(AppError):
    def __init__(self) -> None:
        super().__init__("TIME_LIMIT_REACHED", status_code=403)


# ---------------------------------------------------------------------------
# Image / Audio validation
# ---------------------------------------------------------------------------

class ImageInvalid(AppError):
    def __init__(self, detail: str | None = None) -> None:
        super().__init__(
            "IMAGE_INVALID",
            status_code=400,
            details={"detail": detail} if detail else None,
        )


class AudioInvalid(AppError):
    def __init__(self, detail: str | None = None) -> None:
        super().__init__(
            "AUDIO_INVALID",
            status_code=400,
            details={"detail": detail} if detail else None,
        )


# ---------------------------------------------------------------------------
# AI service
# ---------------------------------------------------------------------------

class AIServiceError(AppError):
    def __init__(self, detail: str | None = None) -> None:
        super().__init__(
            "AI_SERVICE_ERROR",
            status_code=503,
            details={"detail": detail} if detail else None,
        )


# ---------------------------------------------------------------------------
# Parent gate
# ---------------------------------------------------------------------------

class ParentGateFailed(AppError):
    def __init__(self) -> None:
        super().__init__("PARENT_GATE_FAILED", status_code=403)
