"""Collection browsing routes — GET /collection, /collection/{category}, /vocab/{id}."""

from __future__ import annotations

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_current_child, get_db
from app.models.captured_vocab import CapturedVocab
from app.schemas.collection import (
    CategoryDetailResponse,
    CategorySummary,
    CollectionResponse,
    VocabCard,
    VocabDetailResponse,
)
from app.utils.constants import CATEGORY_ICONS, CATEGORY_TOTALS

router = APIRouter(tags=["collection"])


@router.get("/collection", response_model=CollectionResponse)
async def get_collection(
    child_id: Annotated[UUID, Depends(get_current_child)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> CollectionResponse:
    """Get the child's vocab collection overview with per-category progress."""

    # Count total words
    total_result = await db.execute(
        select(func.count()).where(CapturedVocab.child_id == child_id)
    )
    total_words = total_result.scalar() or 0

    # Count per category
    cat_result = await db.execute(
        select(CapturedVocab.category, func.count())
        .where(CapturedVocab.child_id == child_id)
        .group_by(CapturedVocab.category)
    )
    captured_counts = {row[0]: row[1] for row in cat_result.all()}

    # Build category summaries
    categories: list[CategorySummary] = []
    for cat_name, cat_total in CATEGORY_TOTALS.items():
        captured = captured_counts.get(cat_name, 0)
        categories.append(
            CategorySummary(
                name=cat_name,
                icon=CATEGORY_ICONS.get(cat_name, "❓"),
                captured=captured,
                total=cat_total,
                progress=round(captured / cat_total, 2) if cat_total > 0 else 0.0,
            )
        )

    return CollectionResponse(total_words=total_words, categories=categories)


@router.get("/collection/{category}", response_model=CategoryDetailResponse)
async def get_category(
    category: str,
    child_id: Annotated[UUID, Depends(get_current_child)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> CategoryDetailResponse:
    """Get all captured vocab cards in a specific category."""

    if category not in CATEGORY_TOTALS:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category '{category}' not found.",
        )

    result = await db.execute(
        select(CapturedVocab)
        .where(
            CapturedVocab.child_id == child_id,
            CapturedVocab.category == category,
        )
        .order_by(CapturedVocab.created_at.desc())
    )
    vocabs = result.scalars().all()

    captured_words = [
        VocabCard(
            id=v.id,
            word_en=v.word_en,
            word_vi=v.word_vi,
            word_zh=v.word_zh,
            pinyin=v.pinyin,
            phonetic_en=v.phonetic_en,
            category=v.category,
            rarity_tier=v.rarity_tier,
            mastery_en=v.mastery_en,
            mastery_vi=v.mastery_vi,
            mastery_zh=v.mastery_zh,
            evolved=v.evolved,
            photo_url=v.photo_url,
            captured_at=v.created_at,
        )
        for v in vocabs
    ]

    total = CATEGORY_TOTALS.get(category, 0)
    undiscovered = max(0, total - len(captured_words))

    return CategoryDetailResponse(
        category=category,
        captured_words=captured_words,
        undiscovered_count=undiscovered,
    )


@router.get("/vocab/{vocab_id}", response_model=VocabDetailResponse)
async def get_vocab_detail(
    vocab_id: UUID,
    child_id: Annotated[UUID, Depends(get_current_child)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> VocabDetailResponse:
    """Get full detail for a single vocab card."""

    result = await db.execute(
        select(CapturedVocab).where(
            CapturedVocab.id == vocab_id,
            CapturedVocab.child_id == child_id,
        )
    )
    vocab = result.scalar_one_or_none()
    if vocab is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vocab card not found.",
        )

    return VocabDetailResponse(
        id=vocab.id,
        word_en=vocab.word_en,
        word_vi=vocab.word_vi,
        word_zh=vocab.word_zh,
        pinyin=vocab.pinyin,
        phonetic_en=vocab.phonetic_en,
        category=vocab.category,
        rarity_tier=vocab.rarity_tier,
        fun_fact_vi=vocab.fun_fact_vi,
        example_sentence_en=vocab.example_sentence_en,
        example_sentence_vi=vocab.example_sentence_vi,
        example_sentence_zh=vocab.example_sentence_zh,
        mastery_en=vocab.mastery_en,
        mastery_vi=vocab.mastery_vi,
        mastery_zh=vocab.mastery_zh,
        evolved=vocab.evolved,
        photo_url=vocab.photo_url,
        confidence=vocab.confidence,
        captured_at=vocab.created_at,
        last_practiced_at=None,
    )
