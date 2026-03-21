"""Root API router — aggregates all sub-routers."""

from __future__ import annotations

from fastapi import APIRouter

from app.api.auth import router as auth_router
from app.api.capture import router as capture_router
from app.api.children import router as children_router
from app.api.collection import router as collection_router
from app.api.leaderboard import router as leaderboard_router
from app.api.mascot_audio import router as mascot_audio_router
from app.api.missions import router as missions_router
from app.api.parent import router as parent_router
from app.api.parent_gate import router as parent_gate_router
from app.api.profile import router as profile_router
from app.api.speech import router as speech_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(children_router)
api_router.include_router(capture_router)
api_router.include_router(speech_router)
api_router.include_router(mascot_audio_router)
api_router.include_router(collection_router)
api_router.include_router(missions_router)
api_router.include_router(leaderboard_router)
api_router.include_router(profile_router)
api_router.include_router(parent_gate_router)
api_router.include_router(parent_router)
