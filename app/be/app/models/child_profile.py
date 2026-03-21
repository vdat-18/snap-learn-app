"""ChildProfile model — child account under a parent."""

from __future__ import annotations

import uuid
from datetime import date, datetime
from typing import TYPE_CHECKING

from sqlalchemy import Date, ForeignKey, Integer, String, Boolean
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.parent_account import ParentAccount


class ChildProfile(Base):
    __tablename__ = "child_profile"

    parent_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("parent_account.id", ondelete="CASCADE"),
        nullable=False,
    )

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    avatar_id: Mapped[str] = mapped_column(String(50), default="default", server_default="'default'")
    target_language: Mapped[str] = mapped_column(String(5), default="en", server_default="'en'")
    secondary_language: Mapped[str | None] = mapped_column(String(5), nullable=True)

    # Game state (server-authoritative)
    total_xp: Mapped[int] = mapped_column(Integer, default=0, server_default="0")
    level: Mapped[int] = mapped_column(Integer, default=1, server_default="1")
    current_streak: Mapped[int] = mapped_column(Integer, default=0, server_default="0")
    longest_streak: Mapped[int] = mapped_column(Integer, default=0, server_default="0")
    streak_date: Mapped[date | None] = mapped_column(Date, nullable=True)

    # Parental controls
    daily_time_limit_minutes: Mapped[int] = mapped_column(
        Integer, default=30, server_default="30"
    )
    photo_storage_enabled: Mapped[bool] = mapped_column(
        Boolean, default=False, server_default="false"
    )
    leaderboard_visibility: Mapped[str] = mapped_column(
        String(20), default="global", server_default="'global'"
    )

    # Extra settings (JSONB for future flexibility)
    settings: Mapped[dict | None] = mapped_column(JSONB, default=dict, server_default="{}")

    # Relationships
    parent: Mapped["ParentAccount"] = relationship(
        "ParentAccount", back_populates="children"
    )
