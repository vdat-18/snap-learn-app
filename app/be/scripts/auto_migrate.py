"""Auto-migrate database — handles both fresh and existing databases.

Usage:
    uv run python -m scripts.auto_migrate
"""

from __future__ import annotations

import asyncio
import subprocess
import sys

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

from app.config import get_settings

INITIAL_REVISION = "001_initial"


def get_async_url(url: str) -> str:
    if url.startswith("postgresql://"):
        return url.replace("postgresql://", "postgresql+asyncpg://", 1)
    if url.startswith("postgresql+psycopg2://"):
        return url.replace("postgresql+psycopg2://", "postgresql+asyncpg://", 1)
    return url


async def check_alembic_version() -> str | None:
    settings = get_settings()
    url = get_async_url(settings.DATABASE_URL)
    engine = create_async_engine(url)
    async with engine.connect() as conn:
        result = await conn.execute(
            text("SELECT version_num FROM alembic_version LIMIT 1")
        )
        row = result.fetchone()
        await conn.close()
    await engine.dispose()
    return row[0] if row else None


async def table_exists(table_name: str) -> bool:
    settings = get_settings()
    url = get_async_url(settings.DATABASE_URL)
    engine = create_async_engine(url)
    async with engine.connect() as conn:
        result = await conn.execute(
            text(
                "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = :name)"
            ),
            {"name": table_name},
        )
        exists = result.scalar()
        await conn.close()
    await engine.dispose()
    return bool(exists)


async def stamp_initial_revision() -> None:
    settings = get_settings()
    url = get_async_url(settings.DATABASE_URL)
    engine = create_async_engine(url)
    async with engine.connect() as conn:
        await conn.execute(
            text(
                "CREATE TABLE IF NOT EXISTS alembic_version (version_num VARCHAR(32) NOT NULL PRIMARY KEY)"
            )
        )
        await conn.execute(
            text(
                "INSERT INTO alembic_version (version_num) VALUES (:rev) ON CONFLICT DO NOTHING"
            ),
            {"rev": INITIAL_REVISION},
        )
        await conn.commit()
    await engine.dispose()


def run_alembic_upgrade() -> int:
    import os

    be_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    result = subprocess.run(
        ["alembic", "upgrade", "head"],
        cwd=be_dir,
        capture_output=True,
        text=True,
    )
    if result.stdout:
        print(result.stdout, end="")
    if result.stderr:
        print(result.stderr, end="", file=sys.stderr)
    return result.returncode


async def main() -> None:
    print("Checking database migration status...")

    alembic_exists = await table_exists("alembic_version")
    parent_exists = await table_exists("parent_account")

    if alembic_exists:
        current = await check_alembic_version()
        if current:
            print(f"Alembic at revision: {current}")
        else:
            print("Alembic table empty, checking existing tables...")
            if parent_exists:
                print(f"Tables exist, stamping revision {INITIAL_REVISION}...")
                await stamp_initial_revision()

    elif parent_exists:
        print(
            f"Tables exist but alembic_version missing, stamping revision {INITIAL_REVISION}..."
        )
        await stamp_initial_revision()

    print("Running alembic upgrade head...")
    rc = run_alembic_upgrade()

    if rc == 0:
        print("Migration complete.")
    else:
        print(f"Migration failed with code {rc}", file=sys.stderr)
        sys.exit(rc)


if __name__ == "__main__":
    asyncio.run(main())
