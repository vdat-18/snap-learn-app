"""Leaderboard route — GET /leaderboard/{scope}."""

from __future__ import annotations

from typing import Annotated
from uuid import UUID

import redis.asyncio as aioredis
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_current_child, get_db, get_redis
from app.schemas.leaderboard import LeaderboardResponse
from app.services import leaderboard_service

router = APIRouter(prefix="/leaderboard", tags=["leaderboard"])

VALID_SCOPES = {"global", "class", "friends"}


@router.get("/{scope}", response_model=LeaderboardResponse)
async def get_leaderboard(
    scope: str,
    child_id: Annotated[UUID, Depends(get_current_child)],
    db: Annotated[AsyncSession, Depends(get_db)],
    redis: Annotated[aioredis.Redis, Depends(get_redis)],
    limit: int = Query(default=50, ge=1, le=100),
) -> LeaderboardResponse:
    """Get leaderboard rankings for a given scope (global/class/friends)."""

    if scope not in VALID_SCOPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid scope '{scope}'. Must be one of: {', '.join(VALID_SCOPES)}",
        )

    return await leaderboard_service.get_rankings(
        scope=scope,
        child_id=child_id,
        redis=redis,
        db=db,
        limit=limit,
    )
