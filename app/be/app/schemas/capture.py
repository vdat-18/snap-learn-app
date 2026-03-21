"""Capture schemas — photo capture request/response."""

from __future__ import annotations

from uuid import UUID

from pydantic import BaseModel, Field


class CaptureRequest(BaseModel):
    image_base64: str = Field(..., description="Base64-encoded JPEG or PNG image")


class VocabCardResponse(BaseModel):
    id: UUID
    word_en: str
    word_vi: str
    word_zh: str
    pinyin: str | None = None
    phonetic_en: str | None = None
    category: str
    rarity_tier: str
    fun_fact_vi: str | None = None
    example_sentence_en: str | None = None
    example_sentence_vi: str | None = None
    example_sentence_zh: str | None = None
    confidence: float
    photo_url: str | None = None


class MissionUpdateResponse(BaseModel):
    """Inline mission progress update returned with capture."""
    mission_id: UUID
    description_vi: str
    current_count: int
    target_count: int
    completed: bool


class TTSUrls(BaseModel):
    en: str | None = None
    vi: str | None = None
    zh: str | None = None


class CaptureResponse(BaseModel):
    status: str  # "new_capture", "duplicate", "low_confidence"
    vocab_card: VocabCardResponse | None = None
    xp_earned: int = 0
    total_xp: int = 0
    level: int = 1
    level_up: bool = False
    mission_updates: list[MissionUpdateResponse] = []
    tts_urls: TTSUrls | None = None
    message_vi: str | None = None
