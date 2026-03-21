"""Dedup service — detect duplicate captures via perceptual hashing."""

from __future__ import annotations

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.captured_vocab import CapturedVocab


async def find_duplicate(
    child_id: UUID,
    photo_hash: str,
    *,
    db: AsyncSession,
) -> CapturedVocab | None:
    """Check if a child already has a capture with the same perceptual hash.

    Returns the existing CapturedVocab row if a duplicate is found, else None.
    """
    result = await db.execute(
        select(CapturedVocab).where(
            CapturedVocab.child_id == child_id,
            CapturedVocab.photo_hash == photo_hash,
        )
    )
    return result.scalar_one_or_none()


async def find_word_duplicate(
    child_id: UUID,
    word_en: str,
    word_vi: str,
    *,
    db: AsyncSession,
) -> CapturedVocab | None:
    """Check if a child already has a vocab with the same (word_en, word_vi).

    Returns the existing CapturedVocab row if a duplicate is found, else None.
    """
    result = await db.execute(
        select(CapturedVocab).where(
            CapturedVocab.child_id == child_id,
            CapturedVocab.word_en == word_en,
            CapturedVocab.word_vi == word_vi,
        )
    )
    return result.scalar_one_or_none()
