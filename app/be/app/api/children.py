"""Children API routes — CRUD for child profiles."""

from __future__ import annotations

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_current_parent, get_db
from app.models.child_profile import ChildProfile

router = APIRouter(prefix="/children", tags=["children"])


# ---------------------------------------------------------------------------
# Request schemas (local, simple)
# ---------------------------------------------------------------------------

class CreateChildRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    avatar_id: str = "default"
    target_language: str = Field(default="en", pattern="^(en|zh)$")


class UpdateChildRequest(BaseModel):
    name: str | None = None
    avatar_id: str | None = None
    target_language: str | None = None
    secondary_language: str | None = None


class ChildResponse(BaseModel):
    id: UUID
    parent_id: UUID
    name: str
    avatar_id: str
    target_language: str
    secondary_language: str | None
    total_xp: int
    level: int
    current_streak: int
    longest_streak: int
    daily_time_limit_minutes: int
    photo_storage_enabled: bool
    leaderboard_visibility: str

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@router.post("", response_model=ChildResponse, status_code=201)
async def create_child(
    body: CreateChildRequest,
    parent_id: Annotated[UUID, Depends(get_current_parent)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> ChildResponse:
    child = ChildProfile(
        parent_id=parent_id,
        name=body.name,
        avatar_id=body.avatar_id,
        target_language=body.target_language,
    )
    db.add(child)
    await db.flush()
    await db.refresh(child)
    return ChildResponse.model_validate(child)


@router.get("/{child_id}", response_model=ChildResponse)
async def get_child(
    child_id: UUID,
    parent_id: Annotated[UUID, Depends(get_current_parent)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> ChildResponse:
    result = await db.execute(
        select(ChildProfile).where(
            ChildProfile.id == child_id,
            ChildProfile.parent_id == parent_id,
        )
    )
    child = result.scalar_one_or_none()
    if child is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Child not found or not yours.")
    return ChildResponse.model_validate(child)


@router.patch("/{child_id}", response_model=ChildResponse)
async def update_child(
    child_id: UUID,
    body: UpdateChildRequest,
    parent_id: Annotated[UUID, Depends(get_current_parent)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> ChildResponse:
    result = await db.execute(
        select(ChildProfile).where(
            ChildProfile.id == child_id,
            ChildProfile.parent_id == parent_id,
        )
    )
    child = result.scalar_one_or_none()
    if child is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Child not found or not yours.")

    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(child, field, value)

    await db.flush()
    await db.refresh(child)
    return ChildResponse.model_validate(child)
