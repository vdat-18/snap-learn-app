"""ParentAccount model — parent email/password auth."""

from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import Index, String
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.child_profile import ChildProfile


class ParentAccount(Base):
    __tablename__ = "parent_account"

    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    settings: Mapped[dict | None] = mapped_column(JSONB, default=dict, server_default="{}")

    # Relationships
    children: Mapped[list["ChildProfile"]] = relationship(
        "ChildProfile",
        back_populates="parent",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    __table_args__ = (
        Index("idx_parent_email", "email"),
    )
