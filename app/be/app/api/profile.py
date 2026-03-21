"""Profile route — GET /profile."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_current_child, get_db
from app.models.activity_log import ActivityLog
from app.models.badge import Badge
from app.models.captured_vocab import CapturedVocab
from app.models.child_profile import ChildProfile
from app.models.mission import Mission
from app.schemas.profile import BadgeResponse, ProfileResponse, ProfileStats
from app.utils.constants import get_level_name

router = APIRouter(tags=["profile"])


@router.get("/profile", response_model=ProfileResponse)
async def get_profile(
    child_id: Annotated[UUID, Depends(get_current_child)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> ProfileResponse:
    """Get the child's profile with badges and stats."""

    # Load child
    result = await db.execute(
        select(ChildProfile).where(ChildProfile.id == child_id)
    )
    child = result.scalar_one_or_none()
    if child is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Child not found.")

    # Badges
    badge_result = await db.execute(
        select(Badge).where(Badge.child_id == child_id).order_by(Badge.created_at.desc())
    )
    badges = [
        BadgeResponse(
            badge_type=b.badge_type,
            badge_name_vi=b.badge_name_vi,
            description_vi=b.description_vi,
            earned_at=b.created_at,
        )
        for b in badge_result.scalars().all()
    ]

    # Stats: total words
    total_words_result = await db.execute(
        select(func.count()).where(CapturedVocab.child_id == child_id)
    )
    total_words = total_words_result.scalar() or 0

    # Stats: total categories
    total_cats_result = await db.execute(
        select(func.count(func.distinct(CapturedVocab.category)))
        .where(CapturedVocab.child_id == child_id)
    )
    total_categories = total_cats_result.scalar() or 0

    # Stats: words this week
    week_start = datetime.now(timezone.utc) - timedelta(days=7)
    words_week_result = await db.execute(
        select(func.count()).where(
            CapturedVocab.child_id == child_id,
            CapturedVocab.created_at >= week_start,
        )
    )
    words_this_week = words_week_result.scalar() or 0

    # Stats: pronunciation count
    pron_result = await db.execute(
        select(func.count()).where(
            ActivityLog.child_id == child_id,
            ActivityLog.event_type == "pronunciation",
        )
    )
    pronunciations_total = pron_result.scalar() or 0

    # Stats: missions completed
    missions_result = await db.execute(
        select(func.count()).where(
            Mission.child_id == child_id,
            Mission.status == "claimed",
        )
    )
    missions_completed = missions_result.scalar() or 0

    # Recent captures for the Home screen
    recent_captures_result = await db.execute(
        select(CapturedVocab)
        .where(CapturedVocab.child_id == child_id)
        .order_by(CapturedVocab.created_at.desc())
        .limit(4)
    )
    recent_captures = [
        {
            "id": cv.id,
            "word_en": cv.word_en,
            "photo_url": cv.photo_url
        }
        for cv in recent_captures_result.scalars().all()
    ]

    return ProfileResponse(
        id=child.id,
        name=child.name,
        avatar_id=child.avatar_id,
        target_language=child.target_language,
        secondary_language=child.secondary_language,
        total_xp=child.total_xp,
        level=child.level,
        level_name=get_level_name(child.level),
        current_streak=child.current_streak,
        longest_streak=child.longest_streak,
        badges=badges,
        stats=ProfileStats(
            total_words=total_words,
            total_categories=total_categories,
            words_this_week=words_this_week,
            pronunciations_total=pronunciations_total,
            missions_completed=missions_completed,
        ),
        recent_captures=recent_captures,
    )
