"""Collection browsing schemas."""

from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class VocabCard(BaseModel):
    id: UUID
    word_en: str
    word_vi: str
    word_zh: str
    phonetic_en: str | None = None
    category: str
    rarity_tier: str
    mastery_en: int = 0
    mastery_vi: int = 0
    mastery_zh: int = 0
    evolved: bool = False
    photo_url: str | None = None
    captured_at: datetime


class CategorySummary(BaseModel):
    name: str
    display_name: str
    icon: str
    captured: int
    total: int
    progress: float  # 0.0 - 1.0


class CollectionResponse(BaseModel):
    total_words: int
    categories: list[CategorySummary]


class CategoryDetailResponse(BaseModel):
    category: str
    captured_words: list[VocabCard]
    undiscovered_count: int


class VocabDetailResponse(BaseModel):
    id: UUID
    word_en: str
    word_vi: str
    word_zh: str
    phonetic_en: str | None = None
    category: str
    rarity_tier: str
    mastery_en: int = 0
    mastery_vi: int = 0
    mastery_zh: int = 0
    evolved: bool = False
    photo_url: str | None = None
    confidence: float
    captured_at: datetime
    last_practiced_at: datetime | None = None
