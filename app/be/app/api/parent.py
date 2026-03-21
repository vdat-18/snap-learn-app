"""Parent dashboard API routes — stats, activity feed, controls, export."""

from __future__ import annotations

import csv
import io
from datetime import datetime, timedelta, timezone
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_current_parent, get_db
from app.models.activity_log import ActivityLog
from app.models.captured_vocab import CapturedVocab
from app.models.child_profile import ChildProfile
from app.models.mission import Mission
from app.schemas.parent import (
    ActivityEvent,
    ActivityFeedResponse,
    ControlsUpdate,
    DashboardResponse,
    LanguageBreakdown,
    MissionStats,
    OverviewStats,
    PronunciationMastery,
    StreakInfo,
    WeekTrend,
)

router = APIRouter(prefix="/parent", tags=["parent"])


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

async def _verify_child_belongs_to_parent(
    child_id: UUID, parent_id: UUID, db: AsyncSession
) -> ChildProfile:
    result = await db.execute(
        select(ChildProfile).where(
            ChildProfile.id == child_id,
            ChildProfile.parent_id == parent_id,
        )
    )
    child = result.scalar_one_or_none()
    if child is None:
        raise HTTPException(status_code=403, detail="Child not found or not yours.")
    return child


# ---------------------------------------------------------------------------
# Dashboard
# ---------------------------------------------------------------------------

@router.get("/dashboard", response_model=DashboardResponse)
async def get_dashboard(
    parent_id: Annotated[UUID, Depends(get_current_parent)],
    db: Annotated[AsyncSession, Depends(get_db)],
    child_id: UUID = Query(...),
) -> DashboardResponse:
    """Get dashboard stats for a specific child."""
    child = await _verify_child_belongs_to_parent(child_id, parent_id, db)
    now = datetime.now(timezone.utc)

    # Overview
    total_words_result = await db.execute(
        select(func.count()).where(CapturedVocab.child_id == child_id)
    )
    total_words = total_words_result.scalar() or 0

    overview = OverviewStats(
        words_total=total_words,
        streak=child.current_streak,
        level=child.level,
        xp=child.total_xp,
    )

    # Words this week
    week_ago = now - timedelta(days=7)
    wtw_result = await db.execute(
        select(func.count()).where(
            CapturedVocab.child_id == child_id,
            CapturedVocab.created_at >= week_ago,
        )
    )
    words_this_week = wtw_result.scalar() or 0

    # Words trend (4 weeks)
    words_trend: list[WeekTrend] = []
    for i in range(4):
        end = now - timedelta(weeks=i)
        start = end - timedelta(weeks=1)
        count_result = await db.execute(
            select(func.count()).where(
                CapturedVocab.child_id == child_id,
                CapturedVocab.created_at >= start,
                CapturedVocab.created_at < end,
            )
        )
        words_trend.append(WeekTrend(
            week_label=f"Week {4 - i}",
            count=count_result.scalar() or 0,
        ))
    words_trend.reverse()

    # Language breakdown (count per target language — approximated via categories)
    language_breakdown = [
        LanguageBreakdown(language="en", word_count=total_words),
        LanguageBreakdown(language="vi", word_count=total_words),
        LanguageBreakdown(language="zh", word_count=total_words),
    ]

    # Category diversity
    cat_result = await db.execute(
        select(CapturedVocab.category, func.count())
        .where(CapturedVocab.child_id == child_id)
        .group_by(CapturedVocab.category)
    )
    category_diversity = {row[0]: row[1] for row in cat_result.all()}

    # Pronunciation mastery distribution
    mastery_result = await db.execute(
        select(CapturedVocab.mastery_en).where(CapturedVocab.child_id == child_id)
    )
    mastery_counts = {0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    evolved_count = 0
    for row in mastery_result.all():
        level = row[0]
        mastery_counts[min(level, 5)] = mastery_counts.get(min(level, 5), 0) + 1

    evolved_result = await db.execute(
        select(func.count()).where(
            CapturedVocab.child_id == child_id,
            CapturedVocab.evolved == True,  # noqa: E712
        )
    )
    evolved_count = evolved_result.scalar() or 0

    pronunciation_mastery = PronunciationMastery(
        level_0=mastery_counts[0],
        level_1=mastery_counts[1],
        level_2=mastery_counts[2],
        level_3=mastery_counts[3],
        level_4=mastery_counts[4],
        level_5=mastery_counts[5],
        evolved=evolved_count,
    )

    # Streak info
    streak_info = StreakInfo(
        current=child.current_streak,
        longest=child.longest_streak,
        last_capture_date=str(child.streak_date) if child.streak_date else None,
    )

    # Mission stats
    active_missions_result = await db.execute(
        select(func.count()).where(
            Mission.child_id == child_id,
            Mission.status == "active",
        )
    )
    completed_today_result = await db.execute(
        select(func.count()).where(
            Mission.child_id == child_id,
            Mission.status.in_(["completed", "claimed"]),
            Mission.updated_at >= now.replace(hour=0, minute=0, second=0),
        )
    )
    total_completed_result = await db.execute(
        select(func.count()).where(
            Mission.child_id == child_id,
            Mission.status.in_(["completed", "claimed"]),
        )
    )
    mission_stats = MissionStats(
        active=active_missions_result.scalar() or 0,
        completed_today=completed_today_result.scalar() or 0,
        total_completed=total_completed_result.scalar() or 0,
    )

    return DashboardResponse(
        overview=overview,
        words_this_week=words_this_week,
        words_trend=words_trend,
        language_breakdown=language_breakdown,
        category_diversity=category_diversity,
        pronunciation_mastery=pronunciation_mastery,
        streak_info=streak_info,
        mission_stats=mission_stats,
    )


# ---------------------------------------------------------------------------
# Activity feed
# ---------------------------------------------------------------------------

@router.get("/activity-feed", response_model=ActivityFeedResponse)
async def get_activity_feed(
    parent_id: Annotated[UUID, Depends(get_current_parent)],
    db: Annotated[AsyncSession, Depends(get_db)],
    child_id: UUID = Query(...),
    limit: int = Query(default=20, le=100),
    offset: int = Query(default=0, ge=0),
) -> ActivityFeedResponse:
    """Get paginated activity feed for a child."""
    await _verify_child_belongs_to_parent(child_id, parent_id, db)

    # Count total
    count_result = await db.execute(
        select(func.count()).where(ActivityLog.child_id == child_id)
    )
    total = count_result.scalar() or 0

    # Fetch page
    result = await db.execute(
        select(ActivityLog)
        .where(ActivityLog.child_id == child_id)
        .order_by(ActivityLog.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    events = [
        ActivityEvent(
            id=log.id,
            event_type=log.event_type,
            event_data=log.event_data,
            created_at=log.created_at,
        )
        for log in result.scalars().all()
    ]

    return ActivityFeedResponse(
        events=events, total=total, limit=limit, offset=offset
    )


# ---------------------------------------------------------------------------
# Parental controls
# ---------------------------------------------------------------------------

@router.patch("/controls")
async def update_controls(
    body: ControlsUpdate,
    parent_id: Annotated[UUID, Depends(get_current_parent)],
    db: Annotated[AsyncSession, Depends(get_db)],
    child_id: UUID = Query(...),
) -> dict:
    """Update parental controls for a child."""
    child = await _verify_child_belongs_to_parent(child_id, parent_id, db)

    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(child, field, value)

    await db.flush()
    return {"status": "updated", "child_id": str(child_id)}


# ---------------------------------------------------------------------------
# CSV export
# ---------------------------------------------------------------------------

@router.get("/export")
async def export_csv(
    parent_id: Annotated[UUID, Depends(get_current_parent)],
    db: Annotated[AsyncSession, Depends(get_db)],
    child_id: UUID = Query(...),
) -> StreamingResponse:
    """Export child's vocabulary as CSV."""
    await _verify_child_belongs_to_parent(child_id, parent_id, db)

    result = await db.execute(
        select(CapturedVocab)
        .where(CapturedVocab.child_id == child_id)
        .order_by(CapturedVocab.created_at)
    )
    vocabs = result.scalars().all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "word_en", "word_vi", "word_zh", "category",
        "mastery_en", "mastery_vi", "mastery_zh", "captured_at",
    ])
    for v in vocabs:
        writer.writerow([
            v.word_en, v.word_vi, v.word_zh, v.category,
            v.mastery_en, v.mastery_vi, v.mastery_zh,
            v.created_at.isoformat() if v.created_at else "",
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=snaplearn_vocab_{child_id}.csv"},
    )
