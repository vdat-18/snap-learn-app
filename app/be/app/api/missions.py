"""Missions routes — GET /missions, POST /missions/{id}/claim."""

from __future__ import annotations

from typing import Annotated
from uuid import UUID

import redis.asyncio as aioredis
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_current_child, get_db, get_redis
from app.models.child_profile import ChildProfile
from app.models.mission import Mission
from app.schemas.mission import MissionClaimResponse, MissionResponse, MissionsListResponse
from app.services import game_service, mission_service

router = APIRouter(prefix="/missions", tags=["missions"])


@router.get("", response_model=MissionsListResponse)
async def get_missions(
    child_id: Annotated[UUID, Depends(get_current_child)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> MissionsListResponse:
    """Get active missions grouped by type.

    Generates daily/weekly missions on first access if none exist.
    """
    # Ensure daily missions exist
    await mission_service.generate_daily_missions(child_id, db=db)
    await mission_service.generate_weekly_missions(child_id, db=db)

    # Query all active + completed (unclaimed) missions
    result = await db.execute(
        select(Mission).where(
            Mission.child_id == child_id,
            Mission.status.in_(["active", "completed"]),
        )
    )
    missions = result.scalars().all()

    # Group by type
    daily: list[MissionResponse] = []
    weekly: list[MissionResponse] = []
    category_challenges: list[MissionResponse] = []

    for m in missions:
        resp = MissionResponse(
            id=m.id,
            type=m.type,
            description_vi=m.description_vi,
            target_count=m.target_count,
            current_count=m.current_count,
            reward_xp=m.reward_xp,
            status=m.status,
            expires_at=m.expires_at,
        )
        if m.type == "daily":
            daily.append(resp)
        elif m.type == "weekly":
            weekly.append(resp)
        else:
            category_challenges.append(resp)

    return MissionsListResponse(
        daily=daily,
        weekly=weekly,
        category_challenges=category_challenges,
    )


@router.post("/{mission_id}/claim", response_model=MissionClaimResponse)
async def claim_mission(
    mission_id: UUID,
    child_id: Annotated[UUID, Depends(get_current_child)],
    db: Annotated[AsyncSession, Depends(get_db)],
    redis: Annotated[aioredis.Redis, Depends(get_redis)],
) -> MissionClaimResponse:
    """Claim a completed mission's XP reward."""

    claimed = await mission_service.claim_mission(mission_id, child_id, db=db)
    if claimed is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mission is not claimable. It must be in 'completed' status.",
        )

    # Award XP via game service
    child_result = await db.execute(
        select(ChildProfile).where(ChildProfile.id == child_id)
    )
    child = child_result.scalar_one()

    total_xp, level, leveled_up = await game_service.on_capture(
        child, claimed.reward_xp, db=db, redis=redis
    )

    return MissionClaimResponse(
        mission_id=claimed.id,
        xp_earned=claimed.reward_xp,
        total_xp=total_xp,
        level=level,
        level_up=leveled_up,
    )
