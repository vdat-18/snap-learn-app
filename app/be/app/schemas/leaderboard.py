"""Leaderboard schemas."""

from __future__ import annotations

from uuid import UUID

from pydantic import BaseModel


class RankEntry(BaseModel):
    rank: int
    child_id: UUID
    name: str
    avatar_id: str
    points: int


class LeaderboardResponse(BaseModel):
    scope: str  # global, class, friends
    period: str  # e.g. "2026-03"
    entries: list[RankEntry]
    my_rank: int | None = None
    my_score: int = 0
    reset_date: str | None = None
