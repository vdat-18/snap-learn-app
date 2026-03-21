"""Search service — singleton HybridSearch engine lifecycle.

Follows the same module-level singleton pattern as ``db.redis`` and
``db.session``: call ``init_search_engine()`` at startup,
``get_search_engine()`` from request handlers, and
``close_search_engine()`` at shutdown.
"""

from __future__ import annotations

from pathlib import Path

import structlog

from app.utils.hybrid_search import HybridSearch

logger = structlog.get_logger(__name__)

_engine: HybridSearch | None = None


def init_search_engine(
    openai_api_key: str,
    chromadb_dir: str,
    vocab_json_path: str,
) -> None:
    """Create the shared HybridSearch engine and ingest vocab if needed.

    Called once at application startup.
    """
    global _engine

    logger.info(
        "search_engine_init",
        chromadb_dir=chromadb_dir,
        vocab_json_path=vocab_json_path,
    )

    _engine = HybridSearch(
        collection_name="snaplearn",
        persist_directory=chromadb_dir,
        openai_api_key=openai_api_key,
    )

    # Fast checkpoint: skip ingestion entirely if we already did it before.
    # The marker file is written once after a successful ingest and lives
    # alongside the ChromaDB data so it is naturally cleared when the
    # persist directory is deleted.
    checkpoint = Path(chromadb_dir) / ".ingested"

    if checkpoint.exists():
        logger.info("search_engine_skip_ingest", reason="checkpoint_exists")
    elif _engine.count == 0:
        vocab_path = Path(vocab_json_path)
        if vocab_path.exists():
            n = _engine.ingest(vocab_path)
            checkpoint.write_text(str(n))
            logger.info("search_engine_ingested", document_count=n)
        else:
            logger.warning("search_engine_vocab_missing", path=vocab_json_path)
    else:
        # Collection already populated (e.g. checkpoint was deleted but data remains)
        checkpoint.write_text(str(_engine.count))
        logger.info("search_engine_already_populated", document_count=_engine.count)


def get_search_engine() -> HybridSearch:
    """Return the shared HybridSearch engine (must be initialised first)."""
    assert _engine is not None, (
        "Search engine not initialised — call init_search_engine() first."
    )
    return _engine


def close_search_engine() -> None:
    """Release the search engine reference.

    Called at application shutdown.
    """
    global _engine
    if _engine is not None:
        logger.info("search_engine_closed")
        _engine = None
