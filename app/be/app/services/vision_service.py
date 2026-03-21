"""
SnapLearn Vision Service — BAML Integration
============================================
Wraps BAML-generated async client for object recognition.
Provides fallback chain: GPT-4o → Gemini Flash → Claude Sonnet.
"""

from __future__ import annotations

import base64
import logging
from typing import Union

from baml_client import b
from baml_client.types import (
    BlockedResult,
    FilterLevel,
    SafetyCheckResult,
    VisionResult,
)
from baml_py import Image

logger = logging.getLogger(__name__)


async def identify_object(
    image_bytes: bytes,
    filter_level: FilterLevel = FilterLevel.standard,
    *,
    run_safety_preflight: bool = True,
) -> Union[VisionResult, BlockedResult]:
    """
    Full capture pipeline:
    1. (Optional) Pre-flight safety check via fast model
    2. Object identification via vision model with fallback chain
    3. Post-flight word safety check

    Args:
        image_bytes: JPEG image bytes (max 1024px, already resized)
        filter_level: Parent-configured content filter level
        run_safety_preflight: Whether to run the fast safety gate first

    Returns:
        VisionResult on success, BlockedResult if content is unsafe
    """
    # Encode image for BAML
    b64 = base64.b64encode(image_bytes).decode("utf-8")
    image = Image.from_base64("image/jpeg", b64)

    # ── Step 1: Pre-flight safety check (fast model) ──────────
    if run_safety_preflight:
        try:
            safety: SafetyCheckResult = await b.CheckImageSafety(
                photo=image,
                filter_level=filter_level,
            )
            if safety.status.value == "blocked":
                logger.info("Pre-flight safety blocked: %s", safety.reason)
                return BlockedResult(
                    status="blocked",
                    reason=safety.reason,
                )
        except Exception:
            # Safety check failure should NOT block the pipeline
            logger.warning("Pre-flight safety check failed, proceeding", exc_info=True)

    # ── Step 2: Vision identification (fallback chain) ────────
    result = await b.IdentifyObjectFiltered(
        photo=image,
        filter_level=filter_level,
    )

    # Handle union return: could be VisionResult or BlockedResult
    if isinstance(result, BlockedResult):
        logger.info("Vision blocked: %s", result.reason)
        return result

    # ── Step 3: Confidence gate ───────────────────────────────
    if result.confidence < 0.7:
        logger.info("Low confidence %.2f for '%s'", result.confidence, result.object_en)
        return BlockedResult(
            status="blocked",
            reason="low_confidence",
        )

    # ── Step 4: Post-flight word safety ───────────────────────
    try:
        word_safety: SafetyCheckResult = await b.CheckWordSafety(
            word_en=result.object_en,
            word_vi=result.object_vi,
            word_zh=result.object_zh,
            category=result.category,
            filter_level=filter_level,
        )
        if word_safety.status.value == "blocked":
            logger.info("Word safety blocked: %s", word_safety.reason)
            return BlockedResult(
                status="blocked",
                reason=word_safety.reason,
            )
    except Exception:
        logger.warning("Word safety check failed, allowing result", exc_info=True)

    return result
