"""Security utilities — password hashing, JWT encode/decode."""

from __future__ import annotations

import hashlib
from datetime import datetime, timedelta, timezone
from uuid import UUID

import bcrypt
from jose import jwt


# ---------------------------------------------------------------------------
# Password hashing
# ---------------------------------------------------------------------------

def _pre_hash(password: str) -> bytes:
    """SHA-256 pre-hash so bcrypt always receives ≤64 bytes.

    bcrypt has a hard 72-byte input limit. Pre-hashing with SHA-256 produces
    a fixed 64-char hex digest that is safe for any input length while still
    being a one-way transformation of the original secret.

    Returns bytes ready for bcrypt.
    """
    return hashlib.sha256(password.encode()).hexdigest().encode("utf-8")


def hash_password(password: str) -> str:
    """Hash a plain-text password using bcrypt (with SHA-256 pre-hash)."""
    return bcrypt.hashpw(_pre_hash(password), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its bcrypt hash."""
    return bcrypt.checkpw(
        _pre_hash(plain_password), hashed_password.encode("utf-8")
    )


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
