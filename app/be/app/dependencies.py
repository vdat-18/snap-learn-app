"""FastAPI dependency injection functions."""

from __future__ import annotations

from typing import Annotated, AsyncIterator
from uuid import UUID

from fastapi import Depends, Header, HTTPException, status
from jose import JWTError, jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import Settings, get_settings
from app.db.redis import get_redis_pool
from app.db.session import async_session_factory

import redis.asyncio as aioredis


# ---------------------------------------------------------------------------
# Database session
# ---------------------------------------------------------------------------

async def get_db() -> AsyncIterator[AsyncSession]:
    """Yield an async DB session, auto-committing on success."""
    factory = async_session_factory()
    async with factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


# ---------------------------------------------------------------------------
# Redis
# ---------------------------------------------------------------------------

async def get_redis() -> aioredis.Redis:
    """Return the shared Redis connection pool."""
    return get_redis_pool()


# ---------------------------------------------------------------------------
# Auth: current parent
# ---------------------------------------------------------------------------

async def get_current_parent(
    settings: Annotated[Settings, Depends(get_settings)],
    authorization: Annotated[str | None, Header()] = None,
) -> UUID:
    """Extract and validate the Bearer JWT, returning the parent_id (UUID).

    Raises HTTP 401 if the token is missing, expired, or invalid.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail={
            "code": "AUTH_INVALID",
            "message_vi": "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.",
            "message_en": "Session expired. Please log in again.",
        },
    )

    if not authorization or not authorization.startswith("Bearer "):
        raise credentials_exception

    token = authorization.removeprefix("Bearer ").strip()
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=["HS256"],
        )
        parent_id_str: str | None = payload.get("sub")
        token_type: str | None = payload.get("type")
        if parent_id_str is None or token_type != "access":
            raise credentials_exception
        return UUID(parent_id_str)
    except (JWTError, ValueError):
        raise credentials_exception


# ---------------------------------------------------------------------------
# Auth: current child (via X-Child-Id header)
# ---------------------------------------------------------------------------

async def get_current_child(
    parent_id: Annotated[UUID, Depends(get_current_parent)],
    db: Annotated[AsyncSession, Depends(get_db)],
    x_child_id: Annotated[str | None, Header()] = None,
) -> UUID:
    """Validate the X-Child-Id header belongs to the authenticated parent.

    Raises HTTP 400 if the header is missing, HTTP 403 if the child does not
    belong to this parent.
    """
    if not x_child_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "CHILD_ID_REQUIRED",
                "message_vi": "Chưa chọn hồ sơ bé.",
                "message_en": "X-Child-Id header is required.",
            },
        )

    try:
        child_id = UUID(x_child_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "CHILD_ID_INVALID",
                "message_vi": "Mã hồ sơ bé không hợp lệ.",
                "message_en": "Invalid child ID format.",
            },
        )

    # Check child belongs to parent
    from app.models.child_profile import ChildProfile

    result = await db.execute(
        select(ChildProfile).where(
            ChildProfile.id == child_id,
            ChildProfile.parent_id == parent_id,
        )
    )
    child = result.scalar_one_or_none()
    if child is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "code": "CHILD_NOT_YOURS",
                "message_vi": "Bạn không có quyền truy cập hồ sơ này.",
                "message_en": "You do not have access to this child profile.",
            },
        )

    return child_id
