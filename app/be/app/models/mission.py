"""Mission model — daily/weekly missions for children."""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import ForeignKey, Index, Integer, String
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID, TIMESTAMP
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class Mission(Base):
    __tablename__ = "mission"

    child_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("child_profile.id", ondelete="CASCADE"),
        nullable=False,
    )

    # Mission definition
    type: Mapped[str] = mapped_column(String(20), nullable=False)  # daily, weekly, category_challenge
    description_vi: Mapped[str] = mapped_column(String(300), nullable=False)
    target_count: Mapped[int] = mapped_column(Integer, nullable=False)
    current_count: Mapped[int] = mapped_column(Integer, default=0, server_default="0")
    reward_xp: Mapped[int] = mapped_column(Integer, nullable=False)

    # Status tracking
    status: Mapped[str] = mapped_column(
        String(20), default="active", server_default="'active'"
    )  # active, completed, claimed, expired
    match_criteria: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    # Timing
    expires_at: Mapped[datetime | None] = mapped_column(
        TIMESTAMP(timezone=True), nullable=True
    )

    __table_args__ = (
        Index("idx_mission_child_status", "child_id", "status", "expires_at"),
    )
