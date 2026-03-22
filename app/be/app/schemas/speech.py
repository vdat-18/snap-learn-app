"""Speech & pronunciation schemas."""

from __future__ import annotations

from uuid import UUID

from pydantic import BaseModel, Field


class PronounceRequest(BaseModel):
    vocab_id: UUID
    language: str = Field(..., pattern="^(en|vi)$")
    audio_base64: str = Field(
        ...,
        description="Base64-encoded audio (WebM, MP4/M4A, WAV, etc. — must match recorder output)",
    )
    attempt_number: int = Field(1, ge=1, le=3, description="Which attempt (1-3)")


class PronounceResponse(BaseModel):
    stars: int  # 3 = great, 2 = close, 1 = needs practice
    match_type: str  # "exact", "close", "no_match"
    transcript: str
    feedback_vi: str
    mastery: int  # updated mastery level for this language
    evolved: bool  # whether the card just evolved
    xp_earned: int
    total_xp: int
    image_url: str | None = None  # vocab image URL (set on exact match)
