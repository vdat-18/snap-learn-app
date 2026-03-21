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
    ImageSafetyResult,
    SafetyCheckResult,
    VisionResult,
)
from baml_py import Image
from baml_py.errors import BamlValidationError

logger = logging.getLogger(__name__)

# Phrases that indicate an LLM refusal (provider-level content filter)
_REFUSAL_PHRASES = (
    "i'm sorry",
    "i cannot",
    "i can't",
    "i am not able",
    "i'm not able",
    "as an ai",
    "cannot assist",
    "can't assist",
    "unable to process",
    "not able to assist",
    "i apologize",
)


async def identify_object(
    image_bytes: bytes,
    filter_level: FilterLevel = FilterLevel.Standard,
    *,
    run_safety_preflight: bool = False,
    run_word_safety: bool = False,
) -> Union[VisionResult, BlockedResult]:
    """
    Full capture pipeline:
    1. (Optional) Pre-flight safety check via fast model
    2. Object identification via vision model with fallback chain
    3. Confidence gate
    4. (Optional) Post-flight word safety check

    Args:
        image_bytes: JPEG image bytes (max 1024px, already resized)
        filter_level: Parent-configured content filter level
        run_safety_preflight: Whether to run the fast safety gate first
        run_word_safety: Whether to run the post-flight word safety check

    Returns:
        VisionResult on success, BlockedResult if content is unsafe
    """
    # Encode image for BAML
    b64 = base64.b64encode(image_bytes).decode("utf-8")
    image = Image.from_base64("image/jpeg", b64)

    # ── Step 1: Pre-flight safety check (fast model) ──────────
    if run_safety_preflight:
        try:
            safety: ImageSafetyResult = await b.CheckImageSafety(
                photo=image,
                filter_level=filter_level,
            )
            if safety.status.value == "blocked":
                logger.info("Pre-flight safety blocked")
                return BlockedResult(
                    status="blocked",
                    reason="inappropriate_content",
                )
        except Exception:
            # Safety check failure should NOT block the pipeline
            logger.warning("Pre-flight safety check failed, proceeding", exc_info=True)

    # ── Step 2: Vision identification (fallback chain) ────────
    try:
        result = await b.IdentifyObjectFiltered(
            photo=image,
            filter_level=filter_level,
        )
    except BamlValidationError as e:
        # LLM refused to process the image (e.g. "I'm sorry, I can't assist
        # with that request.") — the raw text doesn't match VisionResult or
        # BlockedResult.  Treat provider-level refusals as blocked content.
        raw = e.raw_output
        raw_lower = raw.lower()
        if any(phrase in raw_lower for phrase in _REFUSAL_PHRASES):
            logger.warning(
                "LLM refused image, treating as blocked: %s",
                raw[:200],
            )
            return BlockedResult(
                status="blocked",
                reason="inappropriate_content",
            )
        # Not a recognisable refusal — re-raise so the caller can handle it
        raise

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
    if run_word_safety:
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
