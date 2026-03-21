"""Mission schemas."""

from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class MissionResponse(BaseModel):
    id: UUID
    type: str  # daily, weekly, category_challenge
    description_vi: str
    target_count: int
    current_count: int
    reward_xp: int
    status: str  # active, completed, claimed, expired
    expires_at: datetime | None = None


class MissionClaimResponse(BaseModel):
    mission_id: UUID
    xp_earned: int
    total_xp: int
    level: int
    level_up: bool = False
    badge_earned: str | None = None


class MissionUpdate(BaseModel):
    """Inline mission progress update (used within capture response)."""
    mission_id: UUID
    description_vi: str
    current_count: int
    target_count: int
    completed: bool


class MissionsListResponse(BaseModel):
    daily: list[MissionResponse] = []
    weekly: list[MissionResponse] = []
    category_challenges: list[MissionResponse] = []
