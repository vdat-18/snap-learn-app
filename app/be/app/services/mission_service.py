"""Mission service — daily/weekly mission generation and progress tracking."""

from __future__ import annotations

import random
from datetime import datetime, timedelta, timezone
from uuid import UUID

import structlog
from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.activity_log import ActivityLog
from app.models.captured_vocab import CapturedVocab
from app.models.mission import Mission
from app.schemas.capture import MissionUpdateResponse
from app.utils.constants import CATEGORY_TOTALS

logger = structlog.get_logger(__name__)

# Vietnam timezone offset
_VN_OFFSET = timezone(timedelta(hours=7))


# ---------------------------------------------------------------------------
# Daily mission generation
# ---------------------------------------------------------------------------

async def generate_daily_missions(
    child_id: UUID,
    *,
    db: AsyncSession,
) -> list[Mission]:
    """Generate 2-3 daily missions for a child based on collection gaps.

    Called on first access of the day.
    """
    # Check if dailies already exist for today
    today_start = datetime.now(_VN_OFFSET).replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = today_start + timedelta(days=1)

    existing = await db.execute(
        select(func.count()).where(
            Mission.child_id == child_id,
            Mission.type == "daily",
            Mission.created_at >= today_start,
        )
    )
    if (existing.scalar() or 0) > 0:
        # Already generated today
        result = await db.execute(
            select(Mission).where(
                Mission.child_id == child_id,
                Mission.type == "daily",
                Mission.status.in_(["active", "completed"]),
                Mission.expires_at >= datetime.now(timezone.utc),
            )
        )
        return list(result.scalars().all())

    # Find weak categories
    weak_cats = await _get_weak_categories(child_id, db=db)

    missions: list[Mission] = []
    num_missions = random.randint(2, 3)

    templates = [
        {
            "description_vi": "Chụp {n} vật thể mới",
            "target_count": random.choice([2, 3]),
            "reward_xp": 50,
            "match_criteria": {"type": "any_capture"},
        },
    ]

    if weak_cats:
        cat = random.choice(weak_cats)
        templates.append({
            "description_vi": f"Chụp 1 vật thể thuộc nhóm {cat}",
            "target_count": 1,
            "reward_xp": 75,
            "match_criteria": {"type": "category", "category": cat},
        })

    templates.append({
        "description_vi": "Luyện phát âm 3 từ",
        "target_count": 3,
        "reward_xp": 40,
        "match_criteria": {"type": "pronunciation"},
    })

    random.shuffle(templates)
    for template in templates[:num_missions]:
        mission = Mission(
            child_id=child_id,
            type="daily",
            description_vi=template["description_vi"],
            target_count=template["target_count"],
            reward_xp=template["reward_xp"],
            match_criteria=template["match_criteria"],
            expires_at=today_end,
        )
        db.add(mission)
        missions.append(mission)

    await db.flush()
    return missions


# ---------------------------------------------------------------------------
# Weekly mission generation
# ---------------------------------------------------------------------------

async def generate_weekly_missions(
    child_id: UUID,
    *,
    db: AsyncSession,
) -> list[Mission]:
    """Generate 1-2 weekly missions. Called on first access of the week."""
    now = datetime.now(_VN_OFFSET)
    # Monday of this week
    monday = now - timedelta(days=now.weekday())
    week_start = monday.replace(hour=0, minute=0, second=0, microsecond=0)
    week_end = week_start + timedelta(days=7)

    existing = await db.execute(
        select(func.count()).where(
            Mission.child_id == child_id,
            Mission.type == "weekly",
            Mission.created_at >= week_start,
        )
    )
    if (existing.scalar() or 0) > 0:
        result = await db.execute(
            select(Mission).where(
                Mission.child_id == child_id,
                Mission.type == "weekly",
                Mission.status.in_(["active", "completed"]),
            )
        )
        return list(result.scalars().all())

    missions: list[Mission] = []
    num_missions = random.randint(1, 2)

    templates = [
        {
            "description_vi": "Chụp 10 vật thể trong tuần",
            "target_count": 10,
            "reward_xp": 200,
            "match_criteria": {"type": "any_capture"},
        },
        {
            "description_vi": "Chụp vật thể từ 3 nhóm khác nhau",
            "target_count": 3,
            "reward_xp": 250,
            "match_criteria": {"type": "unique_categories"},
        },
        {
            "description_vi": "Luyện phát âm 15 từ trong tuần",
            "target_count": 15,
            "reward_xp": 300,
            "match_criteria": {"type": "pronunciation"},
        },
    ]

    random.shuffle(templates)
    for template in templates[:num_missions]:
        mission = Mission(
            child_id=child_id,
            type="weekly",
            description_vi=template["description_vi"],
            target_count=template["target_count"],
            reward_xp=template["reward_xp"],
            match_criteria=template["match_criteria"],
            expires_at=week_end,
        )
        db.add(mission)
        missions.append(mission)

    await db.flush()
    return missions


# ---------------------------------------------------------------------------
# Mission progress on capture
# ---------------------------------------------------------------------------

async def on_capture(
    child_id: UUID,
    category: str,
    *,
    db: AsyncSession,
) -> list[MissionUpdateResponse]:
    """Check and update mission progress after a capture.

    Returns list of mission progress updates.
    """
    # Get active missions
    result = await db.execute(
        select(Mission).where(
            Mission.child_id == child_id,
            Mission.status == "active",
        )
    )
    active_missions = result.scalars().all()

    updates: list[MissionUpdateResponse] = []

    for mission in active_missions:
        if _matches_mission(mission, category):
            mission.current_count += 1
            completed = mission.current_count >= mission.target_count
            if completed:
                mission.status = "completed"

            updates.append(MissionUpdateResponse(
                mission_id=mission.id,
                description_vi=mission.description_vi,
                current_count=mission.current_count,
                target_count=mission.target_count,
                completed=completed,
            ))

    return updates


# ---------------------------------------------------------------------------
# Claim mission reward
# ---------------------------------------------------------------------------

async def claim_mission(
    mission_id: UUID,
    child_id: UUID,
    *,
    db: AsyncSession,
) -> Mission | None:
    """Claim a completed mission's reward.

    Returns the mission if successfully claimed, None if not claimable.
    """
    result = await db.execute(
        select(Mission).where(
            Mission.id == mission_id,
            Mission.child_id == child_id,
        )
    )
    mission = result.scalar_one_or_none()
    if mission is None or mission.status != "completed":
        return None

    mission.status = "claimed"

    db.add(ActivityLog(
        child_id=child_id,
        event_type="mission_complete",
        event_data={
            "mission_id": str(mission_id),
            "reward_xp": mission.reward_xp,
            "type": mission.type,
        },
    ))

    return mission


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

async def _get_weak_categories(
    child_id: UUID,
    *,
    db: AsyncSession,
) -> list[str]:
    """Return categories where the child has fewer captures."""
    result = await db.execute(
        select(CapturedVocab.category, func.count())
        .where(CapturedVocab.child_id == child_id)
        .group_by(CapturedVocab.category)
    )
    captured_counts = {row[0]: row[1] for row in result.all()}

    # Categories not yet captured or with low counts
    weak = []
    for cat, total in CATEGORY_TOTALS.items():
        count = captured_counts.get(cat, 0)
        if count < total * 0.3:  # Less than 30% captured
            weak.append(cat)

    return weak or list(CATEGORY_TOTALS.keys())[:3]


def _matches_mission(mission: Mission, category: str) -> bool:
    """Check if a capture matches a mission's criteria."""
    criteria = mission.match_criteria or {}
    match_type = criteria.get("type", "")

    if match_type == "any_capture":
        return True
    elif match_type == "category":
        return criteria.get("category") == category
    elif match_type == "unique_categories":
        # This needs special tracking, increment for any new category capture
        return True

    return False
