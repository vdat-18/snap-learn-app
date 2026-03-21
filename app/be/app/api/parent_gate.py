"""Parent gate API routes — math challenge verification."""

from __future__ import annotations

import random
import uuid
from typing import Annotated

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.config import Settings, get_settings
from app.dependencies import get_current_parent
from app.utils.errors import ParentGateFailed
from app.utils.security import create_access_token

router = APIRouter(prefix="/parent-gate", tags=["parent-gate"])

# In-memory challenge store (production would use Redis)
_challenges: dict[str, int] = {}


class ChallengeResponse(BaseModel):
    challenge_id: str
    question: str


class VerifyRequest(BaseModel):
    challenge_id: str
    answer: int


class VerifyResponse(BaseModel):
    verified: bool
    parent_token: str | None = None


@router.post("/challenge", response_model=ChallengeResponse)
async def create_challenge(
    parent_id: Annotated[uuid.UUID, Depends(get_current_parent)],
) -> ChallengeResponse:
    """Generate a math challenge for the parent gate."""
    a = random.randint(12, 99)
    b = random.randint(12, 99)
    op = random.choice(["+", "-", "*"])

    if op == "+":
        answer = a + b
        question = f"{a} + {b} = ?"
    elif op == "-":
        # Ensure positive result
        if a < b:
            a, b = b, a
        answer = a - b
        question = f"{a} - {b} = ?"
    else:
        # Smaller numbers for multiplication
        a = random.randint(6, 15)
        b = random.randint(6, 15)
        answer = a * b
        question = f"{a} × {b} = ?"

    challenge_id = str(uuid.uuid4())
    _challenges[challenge_id] = answer

    return ChallengeResponse(challenge_id=challenge_id, question=question)


@router.post("/verify", response_model=VerifyResponse)
async def verify_challenge(
    body: VerifyRequest,
    parent_id: Annotated[uuid.UUID, Depends(get_current_parent)],
    settings: Annotated[Settings, Depends(get_settings)],
) -> VerifyResponse:
    """Verify the math challenge answer."""
    expected = _challenges.pop(body.challenge_id, None)
    if expected is None:
        raise ParentGateFailed()

    if body.answer != expected:
        raise ParentGateFailed()

    # Issue a short-lived parent token (5 minutes)
    parent_token = create_access_token(
        parent_id, settings.JWT_SECRET_KEY, expire_minutes=5
    )

    return VerifyResponse(verified=True, parent_token=parent_token)
