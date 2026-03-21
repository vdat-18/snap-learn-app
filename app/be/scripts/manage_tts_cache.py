"""TTS Cache Management — clear and re-warm the TTS cache.

Usage:
    # Clear all cache + regenerate from DB
    uv run python -m scripts.manage_tts_cache --warm

    # Clear only (no regeneration — first requests will be slow)
    uv run python -m scripts.manage_tts_cache --clear-only

    # Clear + warm a single language
    uv run python -m scripts.manage_tts_cache --warm --language en

    # Dry-run: show what would be cleared without doing it
    uv run python -m scripts.manage_tts_cache --dry-run
"""

from __future__ import annotations

import argparse
import asyncio
import sys
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.config import get_settings
from app.models.captured_vocab import CapturedVocab
from app.services.tts_service import clear_and_warm, clear_cache


async def _load_all_words(
    factory: async_sessionmaker[AsyncSession],
) -> list[tuple[str, str, str]]:
    """Fetch distinct (word_en, word_vi, word_zh) tuples from the DB."""
    async with factory() as db:
        result = await db.execute(
            select(
                CapturedVocab.word_en,
                CapturedVocab.word_vi,
                CapturedVocab.word_zh,
            ).distinct()
        )
        return [(row.word_en, row.word_vi, row.word_zh) for row in result.all()]


async def main(args: argparse.Namespace) -> None:
    settings = get_settings()
    cache_dir = settings.TTS_CACHE_DIR

    # --- Dry run: just report ---
    if args.dry_run:
        cache_root = Path(cache_dir)
        if not cache_root.exists():
            print("Cache directory does not exist yet.")
            return
        total = 0
        for lang_dir in cache_root.iterdir():
            if lang_dir.is_dir():
                count = len(list(lang_dir.glob("*.mp3")))
                print(f"  {lang_dir.name}: {count} files")
                total += count
        print(f"  Total: {total} cached MP3 files")
        return

    # --- Clear-only mode ---
    if args.clear_only:
        deleted = clear_cache(cache_dir, language=args.language)
        print(f"Cleared {deleted} cached TTS files.")
        print("⚠️  Cache is empty — first TTS requests will be slower.")
        return

    # --- Clear + Warm mode (default with --warm) ---
    engine = create_async_engine(settings.ASYNC_DATABASE_URL)
    factory = async_sessionmaker(
        bind=engine, class_=AsyncSession, expire_on_commit=False,
    )

    print("Loading vocab words from database...")
    words = await _load_all_words(factory)
    print(f"Found {len(words)} unique word sets to regenerate.")

    if not words:
        print("No words found — clearing cache only.")
        deleted = clear_cache(cache_dir, language=args.language)
        print(f"Cleared {deleted} files.")
        await engine.dispose()
        return

    print("Clearing cache and regenerating TTS (this may take a while)...")
    result = await clear_and_warm(
        words=words,
        cache_dir=cache_dir,
        language=args.language,
    )
    print(f"Done!")
    print(f"  Deleted:   {result['deleted']} old files")
    print(f"  Generated: {result['generated']} new files")
    print(f"  Failed:    {result['failed']} files")

    await engine.dispose()


def cli() -> None:
    parser = argparse.ArgumentParser(
        description="Manage the SnapLearn TTS cache (ElevenLabs).",
    )
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument(
        "--warm",
        action="store_true",
        help="Clear cache and regenerate TTS for all vocab in the database.",
    )
    group.add_argument(
        "--clear-only",
        action="store_true",
        help="Clear the cache without regenerating (first requests will be slow).",
    )
    group.add_argument(
        "--dry-run",
        action="store_true",
        help="Show cache statistics without making changes.",
    )
    parser.add_argument(
        "--language",
        choices=["en", "vi", "zh"],
        default=None,
        help="Target a single language instead of all three.",
    )

    args = parser.parse_args()
    asyncio.run(main(args))


if __name__ == "__main__":
    cli()
