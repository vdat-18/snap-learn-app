"""Reset leaderboard — monthly snapshot to Postgres + Redis cleanup.

Usage:
    uv run python -m scripts.reset_leaderboard
"""

from __future__ import annotations

import asyncio

import redis.asyncio as aioredis
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.config import get_settings
from app.services.leaderboard_service import monthly_reset


async def main() -> None:
    settings = get_settings()

    engine = create_async_engine(settings.ASYNC_DATABASE_URL)
    factory = async_sessionmaker(
        bind=engine, class_=AsyncSession, expire_on_commit=False
    )
    redis = aioredis.from_url(settings.REDIS_URL, decode_responses=True)

    async with factory() as db:
        for scope in ("global", "class"):
            await monthly_reset(scope, redis=redis, db=db)
            print(f"Snapshot completed for scope: {scope}")

        await db.commit()

    await redis.aclose()
    await engine.dispose()
    print("Leaderboard reset complete.")


if __name__ == "__main__":
    asyncio.run(main())
