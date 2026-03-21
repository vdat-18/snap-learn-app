"""CapturedVocab model — vocabulary cards captured by children."""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class CapturedVocab(Base):
    __tablename__ = "captured_vocab"

    child_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("child_profile.id", ondelete="CASCADE"),
        nullable=False,
    )

    # Words in 3 languages
    word_en: Mapped[str] = mapped_column(String(200), nullable=False)
    word_vi: Mapped[str] = mapped_column(String(200), nullable=False)
    word_zh: Mapped[str] = mapped_column(String(200), nullable=False)
    phonetic_en: Mapped[str | None] = mapped_column(String(200), nullable=True)

    # Classification
    category: Mapped[str] = mapped_column(String(50), nullable=False)
    rarity_tier: Mapped[str] = mapped_column(String(20), default="common", server_default="'common'")
    confidence: Mapped[float] = mapped_column(Float, default=0.0)

    # Enrichment
    description_vi: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # Game state
    points_earned: Mapped[int] = mapped_column(Integer, default=0)
    mastery_en: Mapped[int] = mapped_column(Integer, default=0, server_default="0")
    mastery_vi: Mapped[int] = mapped_column(Integer, default=0, server_default="0")
    mastery_zh: Mapped[int] = mapped_column(Integer, default=0, server_default="0")
    evolved: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false")

    # Photo
    photo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    photo_hash: Mapped[str | None] = mapped_column(String(64), nullable=True)

    __table_args__ = (
        UniqueConstraint("child_id", "word_en", "word_vi", name="uq_child_word"),
        Index("idx_captured_vocab_child_word", "child_id", "word_en", "word_vi"),
        Index("idx_captured_vocab_child_cat", "child_id", "category"),
    )
