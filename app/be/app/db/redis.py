"""Redis async connection pool."""

from __future__ import annotations

import redis.asyncio as aioredis

_redis_pool: aioredis.Redis | None = None


async def init_redis_pool(redis_url: str) -> None:
    """Create the shared Redis connection pool.

    Called once at application startup.
    """
    global _redis_pool
    _redis_pool = aioredis.from_url(
        redis_url,
        decode_responses=True,
    )


def get_redis_pool() -> aioredis.Redis:
    """Return the shared Redis pool (must be initialised first)."""
    assert _redis_pool is not None, "Redis pool not initialised — call init_redis_pool() first."
    return _redis_pool


async def close_redis_pool() -> None:
    """Close the Redis pool.

    Called at application shutdown.
    """
    global _redis_pool
    if _redis_pool is not None:
        await _redis_pool.aclose()
        _redis_pool = None
