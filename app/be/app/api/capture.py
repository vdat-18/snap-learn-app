"""Capture API route — POST /capture."""

from __future__ import annotations

from typing import Annotated
from uuid import UUID

import redis.asyncio as aioredis
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import Settings, get_settings
from app.dependencies import get_current_child, get_db, get_redis
from app.models.child_profile import ChildProfile
from app.schemas.capture import CaptureRequest, CaptureResponse
from app.services import capture_service

router = APIRouter(tags=["capture"])


@router.post("/capture", response_model=CaptureResponse)
async def capture(
    body: CaptureRequest,
    child_id: Annotated[UUID, Depends(get_current_child)],
    db: Annotated[AsyncSession, Depends(get_db)],
    redis: Annotated[aioredis.Redis, Depends(get_redis)],
    settings: Annotated[Settings, Depends(get_settings)],
) -> CaptureResponse:
    """Submit a photo for AI object recognition.

    The full pipeline: validate image → dedup → AI vision → rarity →
    save vocab → XP → mission check → TTS pre-gen.
    """
    # Load the full ChildProfile (needed by capture_service)
    result = await db.execute(
        select(ChildProfile).where(ChildProfile.id == child_id)
    )
    child = result.scalar_one()

    return await capture_service.process_capture(
        image_base64=body.image_base64,
        child=child,
        db=db,
        redis=redis,
        settings=settings,
    )
