"""Auth schemas — registration, login, token refresh."""

from __future__ import annotations

from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


class ChildSummary(BaseModel):
    id: UUID
    name: str
    avatar_id: str
    level: int
    total_xp: int


class TokenResponse(BaseModel):
    parent_id: UUID
    email: str
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    children: list[ChildSummary] = []
