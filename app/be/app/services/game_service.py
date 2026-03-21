"""Game service — XP, levels, streaks, card evolution.

Functional module. All game-state mutations go through here so they
remain server-authoritative.
"""

from __future__ import annotations

from datetime import date, datetime, timezone
from uuid import UUID

import redis.asyncio as aioredis
import structlog
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.activity_log import ActivityLog
from app.models.captured_vocab import CapturedVocab
from app.models.child_profile import ChildProfile
from app.utils.constants import (
    EVOLUTION_BONUS_XP,
    EVOLUTION_MASTERY_THRESHOLD,
    LEVEL_THRESHOLDS,
    MAX_MASTERY,
    PRONUNCIATION_PERFECT_XP,
)

logger = structlog.get_logger(__name__)


# ---------------------------------------------------------------------------
# Level calculation
# ---------------------------------------------------------------------------

def calculate_level(total_xp: int) -> int:
    """Return the level for a given total XP."""
    level = 1
    for tier in LEVEL_THRESHOLDS:
        if total_xp >= tier["xp_required"]:
            level = tier["level"]
    return level


# ---------------------------------------------------------------------------
# On capture
# ---------------------------------------------------------------------------

async def on_capture(
    child: ChildProfile,
    xp_earned: int,
    *,
    db: AsyncSession,
    redis: aioredis.Redis,
) -> tuple[int, int, bool]:
    """Award XP for a capture and update game state.

    Returns (total_xp, new_level, leveled_up).
    """
    old_level = child.level
    child.total_xp += xp_earned
    child.level = calculate_level(child.total_xp)
    leveled_up = child.level > old_level

    # Streak logic
    today = date.today()
    if child.streak_date is None or child.streak_date < today:
        if child.streak_date is not None and (today - child.streak_date).days == 1:
            child.current_streak += 1
        else:
            child.current_streak = 1
        child.streak_date = today
        if child.current_streak > child.longest_streak:
            child.longest_streak = child.current_streak

    # Log activity
    db.add(ActivityLog(
        child_id=child.id,
        event_type="capture",
        event_data={"xp_earned": xp_earned, "total_xp": child.total_xp},
    ))

    if leveled_up:
        db.add(ActivityLog(
            child_id=child.id,
            event_type="level_up",
            event_data={"new_level": child.level, "old_level": old_level},
        ))

    # Update leaderboard
    from app.services import leaderboard_service
    await leaderboard_service.add_points(child.id, xp_earned, redis=redis)

    logger.info(
        "capture_xp",
        child_id=str(child.id),
        xp_earned=xp_earned,
        total_xp=child.total_xp,
        level=child.level,
        leveled_up=leveled_up,
    )

    return child.total_xp, child.level, leveled_up


# ---------------------------------------------------------------------------
# On pronunciation
# ---------------------------------------------------------------------------

async def on_pronunciation(
    child: ChildProfile,
    vocab: CapturedVocab,
    language: str,
    stars: int,
    *,
    db: AsyncSession,
    redis: aioredis.Redis,
) -> tuple[int, bool, int]:
    """Process game state after a pronunciation attempt.

    Returns (mastery, evolved, xp_earned).
    """
    xp_earned = 0
    evolved = False

    # 3 stars = 5 XP + mastery increment
    if stars == 3:
        xp_earned = PRONUNCIATION_PERFECT_XP

        mastery_field = f"mastery_{language}"
        current_mastery = getattr(vocab, mastery_field, 0)
        if current_mastery < MAX_MASTERY:
            setattr(vocab, mastery_field, current_mastery + 1)
            new_mastery = current_mastery + 1
        else:
            new_mastery = current_mastery

        # Check for evolution (mastery reaches threshold in any language)
        if not vocab.evolved and new_mastery >= EVOLUTION_MASTERY_THRESHOLD:
            vocab.evolved = True
            evolved = True
            xp_earned += EVOLUTION_BONUS_XP
            db.add(ActivityLog(
                child_id=child.id,
                event_type="evolution",
                event_data={
                    "vocab_id": str(vocab.id),
                    "word_en": vocab.word_en,
                },
            ))
            logger.info("card_evolved", vocab_id=str(vocab.id), word=vocab.word_en)
    else:
        mastery_field = f"mastery_{language}"
        new_mastery = getattr(vocab, mastery_field, 0)

    # Award XP
    if xp_earned > 0:
        child.total_xp += xp_earned
        old_level = child.level
        child.level = calculate_level(child.total_xp)

        if child.level > old_level:
            db.add(ActivityLog(
                child_id=child.id,
                event_type="level_up",
                event_data={"new_level": child.level, "old_level": old_level},
            ))

        from app.services import leaderboard_service
        await leaderboard_service.add_points(child.id, xp_earned, redis=redis)

    # Log pronunciation activity
    db.add(ActivityLog(
        child_id=child.id,
        event_type="pronunciation",
        event_data={
            "vocab_id": str(vocab.id),
            "language": language,
            "stars": stars,
            "xp_earned": xp_earned,
        },
    ))

    return new_mastery, evolved, xp_earned
