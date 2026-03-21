"""Vocab image lookup — semantic search against the ChromaDB vector store."""

from __future__ import annotations

import structlog
from urllib.parse import quote

logger = structlog.get_logger(__name__)


def lookup_vocab_image(word: str) -> str | None:
    """Search for *word* via the HybridSearch engine and return a static image URL.

    Returns ``/static_images/<matched_word>.png`` on match, or ``None``.

    Parameters
    ----------
    word:
        The word to look up (matched via embedding similarity).
    """
    from app.services.search_service import get_search_engine

    try:
        engine = get_search_engine()
        results = engine.search(word, n_results=1)

        if not results:
            logger.warning("vocab_image_no_results", word=word)
            return None

        matched_name = results[0].page_content
        safe_name = quote(matched_name)
        return f"/static_images/{safe_name}.png"

    except Exception:
        logger.exception("vocab_image_lookup_failed", word=word)
        return None
