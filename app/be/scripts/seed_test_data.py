"""Seed test data — generates parent, children, vocabulary, missions.

Usage:
    uv run python -m scripts.seed_test_data
"""

from __future__ import annotations

import asyncio
import random
import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.config import get_settings
from app.models.base import Base
from app.models.badge import Badge
from app.models.captured_vocab import CapturedVocab
from app.models.child_profile import ChildProfile
from app.models.mission import Mission
from app.models.parent_account import ParentAccount
from app.utils.security import hash_password


SAMPLE_WORDS = [
    {"en": "cat", "vi": "con mèo", "zh": "猫", "category": "animals"},
    {"en": "dog", "vi": "con chó", "zh": "狗", "category": "animals"},
    {
        "en": "apple",
        "vi": "quả táo",
        "zh": "苹果",
        "category": "food",
    },
    {
        "en": "book",
        "vi": "quyển sách",
        "zh": "书",
        "category": "school",
    },
    {
        "en": "car",
        "vi": "xe hơi",
        "zh": "汽车",
        "category": "vehicles",
    },
    {"en": "tree", "vi": "cái cây", "zh": "树", "category": "nature"},
    {
        "en": "shirt",
        "vi": "áo sơ mi",
        "zh": "衬衫",
        "category": "clothing",
    },
    {"en": "ball", "vi": "quả bóng", "zh": "球", "category": "sports"},
    {
        "en": "guitar",
        "vi": "đàn guitar",
        "zh": "吉他",
        "category": "instruments",
    },
    {
        "en": "phone",
        "vi": "điện thoại",
        "zh": "手机",
        "category": "technology",
    },
]


async def main() -> None:
    settings = get_settings()
    engine = create_async_engine(settings.ASYNC_DATABASE_URL)
    factory = async_sessionmaker(
        bind=engine, class_=AsyncSession, expire_on_commit=False
    )

    async with factory() as db:
        # Create parent
        parent = ParentAccount(
            email="test@snaplearn.app",
            password_hash=hash_password("password123"),
        )
        db.add(parent)
        await db.flush()
        print(f"Created parent: {parent.email} (id: {parent.id})")

        # Create children
        child1 = ChildProfile(
            parent_id=parent.id,
            name="Minh",
            avatar_id="bear",
            target_language="en",
            total_xp=350,
            level=5,
            current_streak=3,
            longest_streak=7,
        )
        child2 = ChildProfile(
            parent_id=parent.id,
            name="Lan",
            avatar_id="rabbit",
            target_language="zh",
            total_xp=100,
            level=1,
            current_streak=1,
            longest_streak=2,
        )
        db.add_all([child1, child2])
        await db.flush()
        print(
            f"Created children: {child1.name} ({child1.id}), {child2.name} ({child2.id})"
        )

        # Create captured vocab for child1
        for word in SAMPLE_WORDS:
            xp = random.choice([10, 25, 50])
            vocab = CapturedVocab(
                child_id=child1.id,
                word_en=word["en"],
                word_vi=word["vi"],
                word_zh=word["zh"],
                category=word["category"],
                rarity_tier=random.choice(["common", "uncommon", "rare"]),
                confidence=round(random.uniform(0.75, 0.99), 2),
                points_earned=xp,
                mastery_en=random.randint(0, 3),
                mastery_vi=random.randint(0, 2),
                mastery_zh=random.randint(0, 1),
            )
            db.add(vocab)

        # Create missions for child1
        now = datetime.now(timezone.utc)
        mission1 = Mission(
            child_id=child1.id,
            type="daily",
            description_vi="Chụp 2 vật thể mới",
            target_count=2,
            current_count=1,
            reward_xp=50,
            status="active",
            expires_at=now + timedelta(hours=12),
        )
        mission2 = Mission(
            child_id=child1.id,
            type="weekly",
            description_vi="Chụp 10 vật thể trong tuần",
            target_count=10,
            current_count=5,
            reward_xp=200,
            status="active",
            expires_at=now + timedelta(days=5),
        )
        db.add_all([mission1, mission2])

        # Create a badge
        badge = Badge(
            child_id=child1.id,
            badge_type="first_capture",
            badge_name_vi="Chụp đầu tiên",
            description_vi="Bạn đã chụp vật thể đầu tiên!",
        )
        db.add(badge)

        await db.commit()
        print("Seed data created successfully!")
        print(f"  Parent login: test@snaplearn.app / password123")
        print(f"  Child 1: {child1.name} (id: {child1.id})")
        print(f"  Child 2: {child2.name} (id: {child2.id})")


if __name__ == "__main__":
    asyncio.run(main())
