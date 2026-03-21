"""Seed reference vocabulary categories and totals.

Used for collection progress tracking — how many words exist per category.
This script is run during Docker Postgres init via docker-compose.

Usage:
    uv run python -m scripts.seed_reference_vocab
"""

from __future__ import annotations

import asyncio

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.config import get_settings
from app.utils.constants import CATEGORY_TOTALS


async def main() -> None:
    """Seed reference vocabulary data.

    Currently this just prints the reference data. In production, this
    could populate a `reference_vocab` table for precise progress tracking.
    For now, the constants in `utils/constants.py` serve as the reference.
    """
    settings = get_settings()
    print("SnapLearn — Reference Vocabulary Categories")
    print("=" * 50)

    total = 0
    for category, count in sorted(CATEGORY_TOTALS.items()):
        icon = "📦"
        from app.utils.constants import CATEGORY_ICONS
        icon = CATEGORY_ICONS.get(category, icon)
        print(f"  {icon} {category:20s} {count:4d} words")
        total += count

    print("=" * 50)
    print(f"  Total: {total} reference words across {len(CATEGORY_TOTALS)} categories")
    print()
    print("Reference data is embedded in app/utils/constants.py")
    print("No database seeding required — progress is calculated dynamically.")


if __name__ == "__main__":
    asyncio.run(main())
