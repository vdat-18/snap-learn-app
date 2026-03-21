"""Leaderboard service — Redis sorted sets with Postgres snapshots."""

from __future__ import annotations

from datetime import datetime, timezone
from uuid import UUID

import redis.asyncio as aioredis
import structlog
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.child_profile import ChildProfile
from app.models.leaderboard_entry import LeaderboardSnapshot
from app.schemas.leaderboard import LeaderboardResponse, RankEntry

logger = structlog.get_logger(__name__)


def _current_period() -> str:
    """Return the current period string, e.g. '2026-03'."""
    now = datetime.now(timezone.utc)
    return f"{now.year}-{now.month:02d}"


def _leaderboard_key(scope: str, period: str | None = None) -> str:
    """Build the Redis sorted set key."""
    p = period or _current_period()
    return f"leaderboard:{scope}:{p}"


# ---------------------------------------------------------------------------
# Add points
# ---------------------------------------------------------------------------

async def add_points(
    child_id: UUID,
    points: int,
    *,
    redis: aioredis.Redis,
    scope: str = "global",
) -> None:
    """Add XP points to the leaderboard.

    Uses Redis ZINCRBY for O(log N) updates.
    """
    key = _leaderboard_key(scope)
    await redis.zincrby(key, points, str(child_id))

    # Set TTL of 45 days if not already set (monthly leaderboard)
    ttl = await redis.ttl(key)
    if ttl == -1:
        await redis.expire(key, 45 * 86400)

    logger.debug("leaderboard_points", child_id=str(child_id), points=points, scope=scope)


# ---------------------------------------------------------------------------
# Get rankings
# ---------------------------------------------------------------------------

async def get_rankings(
    scope: str,
    child_id: UUID,
    *,
    redis: aioredis.Redis,
    db: AsyncSession,
    limit: int = 50,
) -> LeaderboardResponse:
    """Get the leaderboard for a given scope.

    Hydrates entries with name/avatar from ChildProfile.
    """
    period = _current_period()
    key = _leaderboard_key(scope, period)

    # Get top N with scores (descending)
    raw_entries = await redis.zrevrange(key, 0, limit - 1, withscores=True)

    # Hydrate with child info
    entries: list[RankEntry] = []
    child_ids = [UUID(cid) for cid, _ in raw_entries]

    if child_ids:
        result = await db.execute(
            select(ChildProfile).where(ChildProfile.id.in_(child_ids))
        )
        profiles = {p.id: p for p in result.scalars().all()}

        for rank, (cid_str, score) in enumerate(raw_entries, start=1):
            cid = UUID(cid_str)
            profile = profiles.get(cid)
            entries.append(RankEntry(
                rank=rank,
                child_id=cid,
                name=profile.name if profile else "Unknown",
                avatar_id=profile.avatar_id if profile else "default",
                points=int(score),
            ))

    # Get current child's rank
    my_rank_raw = await redis.zrevrank(key, str(child_id))
    my_score_raw = await redis.zscore(key, str(child_id))

    my_rank = (my_rank_raw + 1) if my_rank_raw is not None else None
    my_score = int(my_score_raw) if my_score_raw is not None else 0

    # Calculate reset date (1st of next month)
    now = datetime.now(timezone.utc)
    if now.month == 12:
        reset = datetime(now.year + 1, 1, 1, tzinfo=timezone.utc)
    else:
        reset = datetime(now.year, now.month + 1, 1, tzinfo=timezone.utc)

    return LeaderboardResponse(
        scope=scope,
        period=period,
        entries=entries,
        my_rank=my_rank,
        my_score=my_score,
        reset_date=reset.isoformat(),
    )


# ---------------------------------------------------------------------------
# Monthly reset (snapshot to Postgres)
# ---------------------------------------------------------------------------

async def monthly_reset(
    scope: str,
    *,
    redis: aioredis.Redis,
    db: AsyncSession,
) -> None:
    """Snapshot current leaderboard to Postgres and let Redis keys expire."""
    period = _current_period()
    key = _leaderboard_key(scope, period)

    all_entries = await redis.zrevrange(key, 0, -1, withscores=True)

    for rank, (cid_str, score) in enumerate(all_entries, start=1):
        snapshot = LeaderboardSnapshot(
            child_id=UUID(cid_str),
            scope=scope,
            period=period,
            total_points=int(score),
            final_rank=rank,
        )
        db.add(snapshot)

    await db.flush()
    logger.info("leaderboard_snapshot", scope=scope, period=period, entries=len(all_entries))
