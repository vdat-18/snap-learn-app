"""Rate limiting service — Redis INCR with daily TTL, per-child counters."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from uuid import UUID

import redis.asyncio as aioredis
import structlog

from app.config import Settings
from app.utils.errors import CaptureRateLimited, PronunciationRateLimited, TimeLimitReached

logger = structlog.get_logger(__name__)

# Vietnam timezone offset for daily boundaries
_VN_OFFSET = timezone(timedelta(hours=7))


def _today_key() -> str:
    """Return today's date in VN timezone as a key component."""
    return datetime.now(_VN_OFFSET).strftime("%Y-%m-%d")


def _seconds_until_midnight_vn() -> int:
    """Seconds remaining until midnight in VN timezone."""
    now = datetime.now(_VN_OFFSET)
    midnight = (now + timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
    return int((midnight - now).total_seconds())


# ---------------------------------------------------------------------------
# Capture rate limit
# ---------------------------------------------------------------------------

async def check_capture_rate_limit(
    child_id: UUID,
    *,
    redis: aioredis.Redis,
    settings: Settings,
    is_premium: bool = False,
) -> None:
    """Check if the child has exceeded their daily capture limit.

    Raises CaptureRateLimited if the limit is exceeded.
    """
    limit = settings.CAPTURES_PER_DAY_PREMIUM if is_premium else settings.CAPTURES_PER_DAY_FREE
    key = f"ratelimit:capture:{child_id}:{_today_key()}"

    current = await redis.get(key)
    if current is not None and int(current) >= limit:
        raise CaptureRateLimited(remaining_seconds=_seconds_until_midnight_vn())

    # Increment
    pipe = redis.pipeline()
    pipe.incr(key)
    pipe.expire(key, _seconds_until_midnight_vn())
    await pipe.execute()


# ---------------------------------------------------------------------------
# Pronunciation rate limit
# ---------------------------------------------------------------------------

async def check_pronunciation_rate_limit(
    child_id: UUID,
    *,
    redis: aioredis.Redis,
    settings: Settings,
    is_premium: bool = False,
) -> None:
    """Check if the child has exceeded their daily pronunciation limit.

    Raises PronunciationRateLimited if the limit is exceeded.
    """
    limit = (
        settings.PRONUNCIATIONS_PER_DAY_PREMIUM
        if is_premium
        else settings.PRONUNCIATIONS_PER_DAY_FREE
    )
    key = f"ratelimit:pronunciation:{child_id}:{_today_key()}"

    current = await redis.get(key)
    if current is not None and int(current) >= limit:
        raise PronunciationRateLimited()

    pipe = redis.pipeline()
    pipe.incr(key)
    pipe.expire(key, _seconds_until_midnight_vn())
    await pipe.execute()


# ---------------------------------------------------------------------------
# Daily time limit
# ---------------------------------------------------------------------------

async def check_daily_time_limit(
    child_id: UUID,
    daily_time_limit_minutes: int,
    *,
    redis: aioredis.Redis,
) -> None:
    """Check if the child has exceeded their daily screen time limit.

    Raises TimeLimitReached if the limit is exceeded.
    """
    key = f"ratelimit:time:{child_id}:{_today_key()}"

    current_minutes = await redis.get(key)
    if current_minutes is not None and int(current_minutes) >= daily_time_limit_minutes:
        raise TimeLimitReached()
