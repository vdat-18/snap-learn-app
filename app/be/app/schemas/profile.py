"""Profile schemas — child profile, badges, stats."""

from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class RecentCapture(BaseModel):
    id: UUID
    word_en: str
    photo_url: str | None = None


class BadgeResponse(BaseModel):
    badge_type: str
    badge_name_vi: str
    description_vi: str | None = None
    earned_at: datetime


class ProfileStats(BaseModel):
    total_words: int
    total_categories: int
    words_this_week: int
    pronunciations_total: int
    missions_completed: int


class ProfileResponse(BaseModel):
    id: UUID
    name: str
    avatar_id: str
    target_language: str
    secondary_language: str | None = None
    total_xp: int
    level: int
    level_name: str
    current_streak: int
    longest_streak: int
    badges: list[BadgeResponse] = []
    stats: ProfileStats
    recent_captures: list[RecentCapture] = []
