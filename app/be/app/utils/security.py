"""Security utilities — password hashing, JWT encode/decode."""

from __future__ import annotations

import hashlib
from datetime import datetime, timedelta, timezone
from uuid import UUID

from jose import jwt
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ---------------------------------------------------------------------------
# Password hashing
# ---------------------------------------------------------------------------

def hash_password(password: str) -> str:
    """Hash a plain-text password using bcrypt."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its bcrypt hash."""
    return pwd_context.verify(plain_password, hashed_password)


# ---------------------------------------------------------------------------
# JWT
# ---------------------------------------------------------------------------

def create_access_token(
    parent_id: UUID,
    secret_key: str,
    expire_minutes: int = 30,
) -> str:
    """Create a short-lived access JWT."""
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(parent_id),
        "type": "access",
        "iat": now,
        "exp": now + timedelta(minutes=expire_minutes),
    }
    return jwt.encode(payload, secret_key, algorithm="HS256")


def create_refresh_token(
    parent_id: UUID,
    secret_key: str,
    expire_days: int = 7,
) -> str:
    """Create a longer-lived refresh JWT."""
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(parent_id),
        "type": "refresh",
        "iat": now,
        "exp": now + timedelta(days=expire_days),
    }
    return jwt.encode(payload, secret_key, algorithm="HS256")


def decode_token(token: str, secret_key: str) -> dict:
    """Decode and verify a JWT. Raises on invalid/expired tokens."""
    return jwt.decode(token, secret_key, algorithms=["HS256"])


# ---------------------------------------------------------------------------
# Token hashing (for Redis storage)
# ---------------------------------------------------------------------------

def hash_token(token: str) -> str:
    """SHA-256 hash of a token (for safe Redis storage)."""
    return hashlib.sha256(token.encode()).hexdigest()
