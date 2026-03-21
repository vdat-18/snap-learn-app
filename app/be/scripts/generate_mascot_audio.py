"""Generate pre-defined mascot voice audio using ElevenLabs TTS.

Reads voice_instructions.yml, generates MP3 audio for all non-template
sentences in all 3 languages (EN/VI/ZH), and stores them in
tts_cache/mascot/{language}/{key}.mp3.

Usage:
    # Generate all missing mascot audio
    uv run python -m scripts.generate_mascot_audio

    # Force regenerate everything (overwrite existing)
    uv run python -m scripts.generate_mascot_audio --force

    # Generate only one language
    uv run python -m scripts.generate_mascot_audio --language vi

    # Dry-run: show what would be generated
    uv run python -m scripts.generate_mascot_audio --dry-run
"""

from __future__ import annotations

import argparse
import asyncio
import logging
import sys
import time
from pathlib import Path

import yaml

# Add project root to path so imports work
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from app.services.speech_service import synthesize_speech  # noqa: E402
from baml_client.types import Language  # noqa: E402

logger = logging.getLogger(__name__)

# ── Constants ────────────────────────────────────────────────────
VOICE_INSTRUCTIONS_PATH = PROJECT_ROOT.parent / "voice_instructions.yml"
MASCOT_CACHE_DIR = Path("tts_cache") / "mascot"
LANG_MAP = {"vi": Language.Vi, "en": Language.En, "zh": Language.Zh}
LANG_CODES = ["vi", "en", "zh"]
MAX_RETRIES = 3
RETRY_BASE_DELAY = 2.0  # seconds


def load_voice_instructions(path: Path) -> dict:
    """Load and parse voice_instructions.yml."""
    if not path.exists():
        raise FileNotFoundError(f"Voice instructions file not found: {path}")
    with open(path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)


def collect_sentences(
    data: dict,
    language_filter: str | None = None,
) -> list[dict]:
    """Extract non-template sentences from voice instructions data.

    Returns a list of dicts with: key, category, vi, en, zh.
    """
    sentences = []
    for category, entries in data.items():
        for entry in entries:
            # Skip template sentences (they need runtime variable interpolation)
            if entry.get("template", False):
                continue
            sentences.append(
                {
                    "key": entry["key"],
                    "category": category,
                    "vi": entry["vi"],
                    "en": entry["en"],
                    "zh": entry["zh"],
                }
            )
    return sentences


def get_output_path(key: str, lang: str) -> Path:
    """Return the cache file path for a mascot audio file."""
    return MASCOT_CACHE_DIR / lang / f"{key}.mp3"


async def generate_single(
    text: str,
    lang_code: str,
    output_path: Path,
    force: bool = False,
) -> str:
    """Generate a single TTS audio file with retry logic.

    Returns: "generated", "skipped", or "failed".
    """
    # Skip if exists and not forcing
    if output_path.exists() and not force:
        return "skipped"

    # Ensure parent directory exists
    output_path.parent.mkdir(parents=True, exist_ok=True)

    language = LANG_MAP[lang_code]

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            audio_bytes = await synthesize_speech(
                text=text,
                language=language,
                # Don't use the default vocab cache — write directly to mascot path
                cache_dir=output_path.parent.parent,
            )

            # synthesize_speech writes to its own cache path (hash-based).
            # We need to write to our key-based path as well.
            output_path.write_bytes(audio_bytes)
            return "generated"

        except Exception as e:
            if attempt < MAX_RETRIES:
                delay = RETRY_BASE_DELAY * (2 ** (attempt - 1))
                logger.warning(
                    "Attempt %d/%d failed for '%s' (%s): %s — retrying in %.1fs",
                    attempt,
                    MAX_RETRIES,
                    text[:40],
                    lang_code,
                    str(e),
                    delay,
                )
                await asyncio.sleep(delay)
            else:
                logger.error(
                    "All %d attempts failed for '%s' (%s): %s",
                    MAX_RETRIES,
                    text[:40],
                    lang_code,
                    str(e),
                )
                return "failed"

    return "failed"  # Should not reach here


async def main(args: argparse.Namespace) -> None:
    """Main generation entrypoint."""
    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(message)s",
        datefmt="%H:%M:%S",
    )

    # Load voice instructions
    yaml_path = args.yaml_path or VOICE_INSTRUCTIONS_PATH
    print(f"Loading voice instructions from: {yaml_path}")
    data = load_voice_instructions(Path(yaml_path))

    # Collect non-template sentences
    sentences = collect_sentences(data)
    print(f"Found {len(sentences)} non-template sentences across {len(data)} categories")

    # Determine which languages to process
    langs = [args.language] if args.language else LANG_CODES
    total_jobs = len(sentences) * len(langs)
    print(f"Languages: {', '.join(langs)} — {total_jobs} total audio files to process")

    if args.dry_run:
        print("\n--- DRY RUN ---")
        would_generate = 0
        would_skip = 0
        for sentence in sentences:
            for lang in langs:
                output = get_output_path(sentence["key"], lang)
                if output.exists() and not args.force:
                    would_skip += 1
                else:
                    would_generate += 1
                    print(f"  GENERATE: {output} — \"{sentence[lang][:50]}...\"")
        print(f"\nWould generate: {would_generate}, Would skip: {would_skip}")
        return

    # Generate audio files
    start_time = time.time()
    stats = {"generated": 0, "skipped": 0, "failed": 0}

    for i, sentence in enumerate(sentences, 1):
        for lang in langs:
            text = sentence[lang]
            key = sentence["key"]
            output = get_output_path(key, lang)

            result = await generate_single(
                text=text,
                lang_code=lang,
                output_path=output,
                force=args.force,
            )
            stats[result] += 1

            status_icon = {"generated": "✓", "skipped": "⊘", "failed": "✗"}[result]
            progress = f"[{i}/{len(sentences)}]"
            print(f"  {status_icon} {progress} {key}/{lang}: {result}")

    elapsed = time.time() - start_time

    # Summary
    print(f"\n{'='*50}")
    print(f"Mascot Audio Generation Complete ({elapsed:.1f}s)")
    print(f"{'='*50}")
    print(f"  Generated: {stats['generated']}")
    print(f"  Skipped:   {stats['skipped']}")
    print(f"  Failed:    {stats['failed']}")
    print(f"  Total:     {sum(stats.values())}")
    print(f"  Output:    {MASCOT_CACHE_DIR.resolve()}")

    if stats["failed"] > 0:
        print(f"\n⚠️  {stats['failed']} files failed — check logs above for details.")
        sys.exit(1)


def cli() -> None:
    parser = argparse.ArgumentParser(
        description="Generate mascot voice audio from voice_instructions.yml using ElevenLabs TTS.",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Overwrite existing audio files (default: skip if exists).",
    )
    parser.add_argument(
        "--language",
        choices=["en", "vi", "zh"],
        default=None,
        help="Generate for a single language only (default: all three).",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show what would be generated without making API calls.",
    )
    parser.add_argument(
        "--yaml-path",
        type=str,
        default=None,
        help="Path to voice_instructions.yml (default: project root).",
    )

    args = parser.parse_args()
    asyncio.run(main(args))


if __name__ == "__main__":
    cli()
