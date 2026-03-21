"""Speech & pronunciation schemas."""

from __future__ import annotations

from uuid import UUID

from pydantic import BaseModel, Field


class PronounceRequest(BaseModel):
    vocab_id: UUID
    language: str = Field(..., pattern="^(en|vi)$")
    audio_base64: str = Field(..., description="Base64-encoded WebM or WAV audio")


class PronounceResponse(BaseModel):
    stars: int  # 1 or 3
    match_type: str  # "exact", "contains", "no_match"
    transcript: str
    feedback_vi: str
    mastery: int  # updated mastery level for this language
    evolved: bool  # whether the card just evolved
    xp_earned: int
    total_xp: int
    image_url: str | None = None  # vocab image URL (set on exact match)
