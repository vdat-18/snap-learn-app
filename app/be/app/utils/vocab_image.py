"""Vocab image lookup — fuzzy-match a word against vocab.json to find its image."""

from __future__ import annotations

import json
from difflib import get_close_matches
from functools import lru_cache
from pathlib import Path

# vocab.json lives at <project>/app/be/data/vocab.json
_VOCAB_JSON = Path(__file__).resolve().parent.parent.parent / "data" / "vocab.json"


@lru_cache(maxsize=1)
def _load_vocab_words() -> dict[str, str]:
    """Return {word_en_lower: word_en_original} from vocab.json (cached)."""
    with _VOCAB_JSON.open(encoding="utf-8") as f:
        entries: list[dict] = json.load(f)
    return {entry["word_en"].lower(): entry["word_en"] for entry in entries}


def lookup_vocab_image(word: str, *, cutoff: float = 0.6) -> str | None:
    """Fuzzy-match *word* against vocab.json keys and return a static image URL.

    Returns ``/static_images/<matched_word>.png`` on match, or ``None``.

    Parameters
    ----------
    word:
        The word to look up (case-insensitive).
    cutoff:
        Minimum similarity ratio for fuzzy matching (0-1).  Default 0.6.
    """
    vocab = _load_vocab_words()
    normalised = word.strip().lower()

    # 1. Try exact match first
    if normalised in vocab:
        return f"/static_images/{vocab[normalised]}.png"

    # 2. Fuzzy match — pick the best candidate
    matches = get_close_matches(normalised, vocab.keys(), n=1, cutoff=cutoff)
    if matches:
        matched_key = matches[0]
        return f"/static_images/{vocab[matched_key]}.png"

    return None
