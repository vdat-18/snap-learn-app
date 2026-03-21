"""LeaderboardSnapshot model — monthly leaderboard snapshots from Redis to Postgres."""

import uuid

from sqlalchemy import ForeignKey, Index, Integer, String, desc
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class LeaderboardSnapshot(Base):
    __tablename__ = "leaderboard_snapshot"

    child_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("child_profile.id", ondelete="CASCADE"),
        nullable=False,
    )

    scope: Mapped[str] = mapped_column(String(20), nullable=False)  # global, class, friends
    period: Mapped[str] = mapped_column(String(10), nullable=False)  # e.g. "2026-03"
    total_points: Mapped[int] = mapped_column(Integer, default=0)
    final_rank: Mapped[int | None] = mapped_column(Integer, nullable=True)
    category_points: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    __table_args__ = (
        Index("idx_leaderboard_scope", "scope", "period", desc("total_points")),
    )
