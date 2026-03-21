"""
SnapLearn Rarity Service — BAML Integration
============================================
Wraps BAML-generated async client for rarity classification.
Combines LLM-based classification with frequency data from Redis.
"""

from __future__ import annotations

import logging
from typing import Optional

from baml_client import b
from baml_client.types import ObjectCategory, RarityInput, RarityResult, RarityTier

logger = logging.getLogger(__name__)

# ── XP Table ───────────────────────────────────────────────────
RARITY_XP = {
    RarityTier.Common: 10,
    RarityTier.Uncommon: 25,
    RarityTier.Rare: 50,
    RarityTier.Epic: 100,
    RarityTier.Legendary: 250,
}

# ── Category Diversity Multipliers ─────────────────────────────
DIVERSITY_MULTIPLIER = {
    1: 1.5,  # First capture in category
    2: 1.0,  # 2nd-4th
    3: 1.0,
    4: 1.0,
    5: 0.8,  # 5th-14th (diminishing)
    15: 0.6,  # 15th+ (strong diminishing)
}


def get_diversity_multiplier(category_capture_count: int) -> float:
    """Get XP multiplier based on how many times this category was captured."""
    if category_capture_count <= 0:
        return 1.5
    elif category_capture_count <= 4:
        return 1.0 if category_capture_count > 1 else 1.5
    elif category_capture_count <= 14:
        return 0.8
    else:
        return 0.6


async def classify_rarity(
    object_en: str,
    category: ObjectCategory,
    difficulty_en: int,
    difficulty_vi: int,
    difficulty_zh: int,
    capture_pct: Optional[float] = None,
) -> RarityResult:
    """
    Classify object rarity using BAML function.

    Args:
        object_en: English name of the object
        category: Object category
        difficulty_en/vi/zh: Difficulty per language (1-5)
        capture_pct: % of users who captured this (from Redis), None if unknown

    Returns:
        RarityResult with tier, base XP, and reasoning
    """
    rarity_input = RarityInput(
        object_en=object_en,
        category=category,
        difficulty_en=difficulty_en,
        difficulty_vi=difficulty_vi,
        difficulty_zh=difficulty_zh,
        capture_pct=capture_pct,
    )

    result: RarityResult = await b.ClassifyRarity(input=rarity_input)
    logger.info(
        "Rarity for '%s': %s (%d XP) — %s",
        object_en,
        result.rarity.value,
        result.base_xp,
        result.reasoning,
    )
    return result


def calculate_final_xp(
    rarity: RarityTier,
    category_capture_count: int,
    is_duplicate: bool = False,
) -> int:
    """
    Calculate final XP including diversity and duplicate modifiers.

    Args:
        rarity: The rarity tier
        category_capture_count: How many captures in this category
        is_duplicate: Whether this is a duplicate capture

    Returns:
        Final XP amount (integer)
    """
    base_xp = RARITY_XP[rarity]

    if is_duplicate:
        # Duplicate: 25% of base XP
        return max(1, int(base_xp * 0.25))

    multiplier = get_diversity_multiplier(category_capture_count)
    return max(1, int(base_xp * multiplier))
