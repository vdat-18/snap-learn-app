"""Mascot Audio API routes — serve pre-generated mascot voice audio.

GET  /api/tts/mascot/manifest           — JSON manifest of available audio
GET  /api/tts/mascot/{key}/{language}    — Serve a specific mascot audio file

Both endpoints are unauthenticated — mascot audio is the same for all users.
"""

from __future__ import annotations

import logging
import re
from pathlib import Path

import yaml
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response

from app.config import Settings, get_settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/mascot", tags=["mascot-audio"])

VALID_LANGUAGES = {"en", "vi", "zh"}
# Match keys like "app_shell__0", "login__10", "random_motivational__5"
KEY_PATTERN = re.compile(r"^[a-z_]+__\d+$")


def _mascot_cache_dir(settings: Settings) -> Path:
    """Return the mascot audio cache directory."""
    mascot_path = Path(settings.TTS_CACHE_DIR) / "mascot"
    return mascot_path


def _voice_instructions_path() -> Path:
    """Return the path to voice_instructions.yml (project root)."""
    # Navigate from app/be/app/api/ up to the actual project root
    # __file__ = /Users/.../snap-learn-app/app/be/app/api/mascot_audio.py
    # We need to go up 4 levels to reach /Users/.../snap-learn-app/
    path = Path(__file__).resolve().parent.parent.parent / "voice_instructions.yml"
    print(f"Looking for voice_instructions.yml at: {path}")
    return path


def _load_voice_instructions() -> dict:
    """Load and parse voice_instructions.yml for manifest generation."""
    path = _voice_instructions_path()
    if not path.exists():
        logger.warning("voice_instructions.yml not found at %s", path)
        return {}
    with open(path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f) or {}


@router.get("/manifest")
async def get_manifest(
    settings: Settings = Depends(get_settings),
) -> dict:
    """Return a JSON manifest of all available mascot audio files.

    The manifest includes:
    - categories: grouped entries with keys and URLs per language
    - textToKey: reverse mapping from sentence text to key (for FE lookup)
    """
    cache_dir = _mascot_cache_dir(settings)
    voice_data = _load_voice_instructions()

    categories: dict[str, list[dict]] = {}
    text_to_key: dict[str, str] = {}

    for category, entries in voice_data.items():
        category_items: list[dict] = []

        for entry in entries:
            key = entry.get("key", "")
            if not key:
                continue

            # Check which language audio files actually exist
            urls: dict[str, str] = {}
            for lang in VALID_LANGUAGES:
                audio_path = cache_dir / lang / f"{key}.mp3"
                if audio_path.exists():
                    urls[lang] = f"/api/mascot/{key}/{lang}"

            item = {
                "key": key,
                "vi": entry.get("vi", ""),
                "en": entry.get("en", ""),
                "zh": entry.get("zh", ""),
                "urls": urls,
                "template": entry.get("template", False),
            }
            category_items.append(item)

            # Build reverse text→key mapping (all 3 languages)
            if not entry.get("template", False):
                for lang in ("vi", "en", "zh"):
                    text = entry.get(lang, "")
                    if text:
                        text_to_key[text] = key

        if category_items:
            categories[category] = category_items

    return {
        "categories": categories,
        "textToKey": text_to_key,
    }


@router.get("/{key}/{language}")
async def get_mascot_audio(
    key: str,
    language: str,
    settings: Settings = Depends(get_settings),
) -> Response:
    """Serve a pre-generated mascot audio file (MP3).

    Args:
        key: Instruction key (e.g., "app_shell__0", "login__2")
        language: Language code ("en", "vi", or "zh")
    """
    # Validate language
    if language not in VALID_LANGUAGES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Language must be one of: {', '.join(sorted(VALID_LANGUAGES))}.",
        )

    # Validate key format (prevent path traversal)
    if not KEY_PATTERN.match(key):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid key format. Expected format: category__index (e.g., app_shell__0).",
        )

    # Look up the audio file
    cache_dir = _mascot_cache_dir(settings)
    audio_path = cache_dir / language / f"{key}.mp3"

    if not audio_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Mascot audio not found for key '{key}' in language '{language}'.",
        )

    audio_bytes = audio_path.read_bytes()

    return Response(
        content=audio_bytes,
        media_type="audio/mpeg",
        headers={
            "Content-Disposition": f'inline; filename="mascot_{key}_{language}.mp3"',
            "Cache-Control": "public, max-age=86400",
        },
    )
