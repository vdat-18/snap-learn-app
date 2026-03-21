"""Badge model — badges earned by children."""

from __future__ import annotations

import uuid

from sqlalchemy import ForeignKey, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class Badge(Base):
    __tablename__ = "badge"

    child_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("child_profile.id", ondelete="CASCADE"),
        nullable=False,
    )
    badge_type: Mapped[str] = mapped_column(String(50), nullable=False)
    badge_name_vi: Mapped[str] = mapped_column(String(100), nullable=False)
    description_vi: Mapped[str | None] = mapped_column(String(300), nullable=True)

    __table_args__ = (
        UniqueConstraint("child_id", "badge_type", name="uq_child_badge_type"),
    )
