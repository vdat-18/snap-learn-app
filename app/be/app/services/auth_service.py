"""Auth service — registration, login, token refresh.

Functional module pattern (no classes). Dependencies are passed as parameters.
"""

from __future__ import annotations

from uuid import UUID

import redis.asyncio as aioredis
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import Settings
from app.models.child_profile import ChildProfile
from app.models.parent_account import ParentAccount
from app.schemas.auth import ChildSummary, TokenResponse
from app.utils.errors import AuthCredentialsInvalid, AuthEmailExists, AuthInvalid
from app.utils.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    hash_token,
    verify_password,
)


async def register(
    email: str,
    password: str,
    *,
    db: AsyncSession,
    redis: aioredis.Redis,
    settings: Settings,
) -> TokenResponse:
    """Register a new parent account and return tokens."""
    # Check for existing email
    existing = await db.execute(
        select(ParentAccount).where(ParentAccount.email == email.lower())
    )
    if existing.scalar_one_or_none() is not None:
        raise AuthEmailExists()

    # Create parent
    parent = ParentAccount(
        email=email.lower(),
        password_hash=hash_password(password),
    )
    db.add(parent)
    await db.flush()  # get the id

    # Generate tokens
    access = create_access_token(
        parent.id, settings.JWT_SECRET_KEY, settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    refresh = create_refresh_token(
        parent.id, settings.JWT_SECRET_KEY, settings.REFRESH_TOKEN_EXPIRE_DAYS
    )

    # Store refresh token hash in Redis
    await _store_refresh_token(redis, parent.id, refresh, settings.REFRESH_TOKEN_EXPIRE_DAYS)

    return TokenResponse(
        parent_id=parent.id,
        email=parent.email,
        access_token=access,
        refresh_token=refresh,
        children=[],
    )


async def login(
    email: str,
    password: str,
    *,
    db: AsyncSession,
    redis: aioredis.Redis,
    settings: Settings,
) -> TokenResponse:
    """Authenticate a parent and return tokens + children."""
    result = await db.execute(
        select(ParentAccount).where(ParentAccount.email == email.lower())
    )
    parent = result.scalar_one_or_none()
    if parent is None or not verify_password(password, parent.password_hash):
        raise AuthCredentialsInvalid()

    # Generate tokens
    access = create_access_token(
        parent.id, settings.JWT_SECRET_KEY, settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    refresh = create_refresh_token(
        parent.id, settings.JWT_SECRET_KEY, settings.REFRESH_TOKEN_EXPIRE_DAYS
    )
    await _store_refresh_token(redis, parent.id, refresh, settings.REFRESH_TOKEN_EXPIRE_DAYS)

    # Fetch children
    children_result = await db.execute(
        select(ChildProfile).where(ChildProfile.parent_id == parent.id)
    )
    children = [
        ChildSummary(
            id=c.id,
            name=c.name,
            avatar_id=c.avatar_id,
            level=c.level,
            total_xp=c.total_xp,
        )
        for c in children_result.scalars().all()
    ]

    return TokenResponse(
        parent_id=parent.id,
        email=parent.email,
        access_token=access,
        refresh_token=refresh,
        children=children,
    )


async def refresh_token(
    refresh_token_str: str,
    *,
    redis: aioredis.Redis,
    settings: Settings,
) -> TokenResponse:
    """Exchange a valid refresh token for a new token pair."""
    try:
        payload = decode_token(refresh_token_str, settings.JWT_SECRET_KEY)
    except Exception:
        raise AuthInvalid()

    if payload.get("type") != "refresh":
        raise AuthInvalid()

    parent_id = UUID(payload["sub"])
    token_hash = hash_token(refresh_token_str)

    # Verify stored hash matches
    stored = await redis.get(f"refresh:{parent_id}")
    if stored != token_hash:
        raise AuthInvalid()

    # Generate new token pair
    new_access = create_access_token(
        parent_id, settings.JWT_SECRET_KEY, settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    new_refresh = create_refresh_token(
        parent_id, settings.JWT_SECRET_KEY, settings.REFRESH_TOKEN_EXPIRE_DAYS
    )

    # Invalidate old, store new
    await _store_refresh_token(redis, parent_id, new_refresh, settings.REFRESH_TOKEN_EXPIRE_DAYS)

    return TokenResponse(
        parent_id=parent_id,
        email="",  # Not fetched here — caller can hydrate if needed
        access_token=new_access,
        refresh_token=new_refresh,
    )


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

async def _store_refresh_token(
    redis: aioredis.Redis,
    parent_id: UUID,
    token: str,
    expire_days: int,
) -> None:
    """Store the SHA-256 hash of the refresh token in Redis."""
    key = f"refresh:{parent_id}"
    await redis.set(key, hash_token(token), ex=expire_days * 86400)
