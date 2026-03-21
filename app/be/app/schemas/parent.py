"""Parent dashboard schemas."""

from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class ChildProfileSchema(BaseModel):
    id: UUID
    name: str
    avatar_id: str
    level: int
    total_xp: int
    current_streak: int


class OverviewStats(BaseModel):
    words_total: int
    streak: int
    level: int
    xp: int


class WeekTrend(BaseModel):
    week_label: str
    count: int


class LanguageBreakdown(BaseModel):
    language: str
    word_count: int


class PronunciationMastery(BaseModel):
    level_0: int = 0
    level_1: int = 0
    level_2: int = 0
    level_3: int = 0
    level_4: int = 0
    level_5: int = 0
    evolved: int = 0


class StreakInfo(BaseModel):
    current: int
    longest: int
    last_capture_date: str | None = None


class MissionStats(BaseModel):
    active: int
    completed_today: int
    total_completed: int


class DashboardResponse(BaseModel):
    overview: OverviewStats
    words_this_week: int
    words_trend: list[WeekTrend]
    language_breakdown: list[LanguageBreakdown]
    category_diversity: dict[str, int]  # category -> count
    pronunciation_mastery: PronunciationMastery
    streak_info: StreakInfo
    mission_stats: MissionStats


class ActivityEvent(BaseModel):
    id: UUID
    event_type: str
    event_data: dict | None = None
    created_at: datetime


class ActivityFeedResponse(BaseModel):
    events: list[ActivityEvent]
    total: int
    limit: int
    offset: int


class ControlsUpdate(BaseModel):
    daily_time_limit_minutes: int | None = None
    target_language: str | None = None
    secondary_language: str | None = None
    photo_storage_enabled: bool | None = None
    leaderboard_visibility: str | None = None
