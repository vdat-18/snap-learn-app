"""Storage service — local filesystem photo storage."""

from __future__ import annotations

import uuid
from pathlib import Path

import structlog

logger = structlog.get_logger(__name__)


async def save_photo(
    image_bytes: bytes,
    child_id: uuid.UUID,
    upload_dir: str,
) -> str:
    """Save a photo to the local filesystem.

    Returns the relative path (for storage in DB and serving).
    """
    child_dir = Path(upload_dir) / "photos" / str(child_id)
    child_dir.mkdir(parents=True, exist_ok=True)

    filename = f"{uuid.uuid4()}.jpg"
    filepath = child_dir / filename
    filepath.write_bytes(image_bytes)

    relative_path = f"/uploads/photos/{child_id}/{filename}"
    logger.info("photo_saved", path=relative_path, size=len(image_bytes))
    return relative_path


def serve_file(relative_path: str, upload_dir: str) -> Path | None:
    """Resolve a relative path to an absolute filesystem path.

    Returns None if the file doesn't exist.
    """
    # relative_path starts with /uploads/...
    # strip the /uploads prefix to get the real subpath
    subpath = relative_path.lstrip("/").removeprefix("uploads/")
    absolute = Path(upload_dir) / subpath
    if absolute.is_file():
        return absolute
    return None
