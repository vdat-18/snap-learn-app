"""Image utilities — validation, compression, perceptual hashing."""

from __future__ import annotations

import io
from typing import NamedTuple

import imagehash
from PIL import Image

MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB
ALLOWED_FORMATS = {"JPEG", "PNG"}
MAX_DIMENSION = 1024


class ImageInfo(NamedTuple):
    image: Image.Image
    format: str
    width: int
    height: int


def validate_image(image_bytes: bytes) -> ImageInfo:
    """Validate image format and size.

    Raises ValueError if the image is too large or not JPEG/PNG.
    """
    if len(image_bytes) > MAX_IMAGE_SIZE_BYTES:
        raise ValueError(
            f"Image too large ({len(image_bytes)} bytes). "
            f"Maximum is {MAX_IMAGE_SIZE_BYTES} bytes."
        )

    try:
        img = Image.open(io.BytesIO(image_bytes))
        img.verify()
        # Re-open after verify (verify closes the file)
        img = Image.open(io.BytesIO(image_bytes))
    except Exception as exc:
        raise ValueError(f"Cannot open image: {exc}") from exc

    fmt = img.format or ""
    if fmt.upper() not in ALLOWED_FORMATS:
        raise ValueError(
            f"Unsupported format '{fmt}'. Use JPEG or PNG."
        )

    return ImageInfo(image=img, format=fmt, width=img.width, height=img.height)


def compress_image(img: Image.Image, max_dimension: int = MAX_DIMENSION) -> bytes:
    """Resize image so the longest side is at most max_dimension and compress as JPEG."""
    width, height = img.size
    if max(width, height) > max_dimension:
        ratio = max_dimension / max(width, height)
        new_size = (int(width * ratio), int(height * ratio))
        img = img.resize(new_size, Image.Resampling.LANCZOS)

    # Convert to RGB if necessary (PNG may have alpha)
    if img.mode in ("RGBA", "P"):
        img = img.convert("RGB")

    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=85, optimize=True)
    return buf.getvalue()


def compute_phash(image_bytes: bytes) -> str:
    """Compute a perceptual hash (pHash) of the image."""
    img = Image.open(io.BytesIO(image_bytes))
    return str(imagehash.phash(img))
