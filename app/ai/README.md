# SnapLearn — AI Services

**Vision and speech: the AI systems that power SnapLearn**

---

## Overview

The SnapLearn AI layer provides the intelligence behind every capture and pronunciation attempt. It is called by the FastAPI backend — the frontend never communicates with AI services directly.

### Core Responsibilities

1. **Vision** — Identify objects from photos, translate to English + Vietnamese + Chinese, categorize, and assess difficulty
2. **Speech** — Play vocabulary pronunciation (TTS) and judge child's pronunciation attempt (ASR-as-judge)

### Provider Strategy

All AI calls go through **OpenAI** (primary) or **OpenRouter** (fallback). No other AI providers are used.

| Service | Provider | Model | Purpose |
|---|---|---|---|
| **Vision (primary)** | OpenAI | GPT-4o | Photo → structured JSON (word, translation, category) |
| **Vision (fallback)** | OpenRouter | google/gemini-flash-2.5 or anthropic/claude-sonnet | Fallback if OpenAI is down |
| **ASR** | OpenAI | Whisper (whisper-1) | Pronunciation judging (EN, VI, ZH) |
| **TTS** | OpenAI | tts-1 / tts-1-hd | Word pronunciation playback (EN, VI, ZH) |

> **OpenRouter** provides access to 100+ models via a single API key and OpenAI-compatible format. Fallback switching is trivial — just change the model name.

---

## Vision Pipeline

### Routing Logic

```
Photo arrives →
  1. Perceptual hash → check if child already captured this exact object → DUPLICATE
  2. Send to OpenAI GPT-4o → process response → LIVE RESULT (~$0.02, 2-4s)
  3. If OpenAI fails → send to OpenRouter (Gemini Flash 2.5) → FALLBACK (~$0.005, 1-3s)
  4. If all fail → return friendly error
```

### Vision Prompt Design

The vision prompt returns structured JSON with:

- Object identification in 3 languages (EN, VI, ZH) with phonetics/pinyin
- **Natural language description in Vietnamese** — a friendly, excited reaction describing what's in the photo (conversational UX for the child)
- Category assignment (animals, food, nature, household, school, vehicles, etc.)
- Difficulty ratings per language (1-5 scale)
- Fun fact in Vietnamese
- Example sentences in all 3 languages
- Confidence score (0.0-1.0)

#### Example Response

```json
{
  "status": "success",
  "description_vi": "Ồ hay quá! Có một chú mèo lông vàng đang nằm cuộn tròn trên ghế sofa kìa!",
  "object_en": "cat",
  "phonetic_en": "/kaet/",
  "object_vi": "con meo",
  "object_zh": "猫",
  "pinyin": "mao",
  "category": "animals",
  "difficulty_en": 1,
  "difficulty_vi": 1,
  "difficulty_zh": 2,
  "fun_fact_vi": "Meo co the ngu toi 16 gio moi ngay!",
  "example_sentence_en": "The cat is sleeping on the sofa.",
  "example_sentence_vi": "Con meo dang ngu tren ghe sofa.",
  "example_sentence_zh": "猫在沙发上睡觉。",
  "confidence": 0.97
}
```

### Image Preprocessing

Before sending to any AI provider:

1. **Validate format** — JPEG, PNG, WebP only
2. **Strip EXIF data** — Privacy (may contain GPS, device info)
3. **Resize** — Max 1024px on longest side (maintain aspect ratio)
4. **Compress** — JPEG 80% quality, max 2MB
5. **Perceptual hash** — For duplicate detection (pHash via imagehash)

---

## Speech Pipeline

### Text-to-Speech (TTS)

TTS plays correct pronunciation via **OpenAI TTS API** (`tts-1`).

| Language | Voice | Speed | Rationale |
|---|---|---|---|
| English | `nova` | 0.85x | Slightly slower for children |
| Vietnamese | `nova` | 0.80x | Slower for clarity |
| Mandarin | `nova` | 0.75x | Slowest for tone clarity |

**Caching strategy:** TTS audio for any word+language combination never changes. Aggressively cached to local filesystem:

```
Request for TTS("cat", "en") →
  1. Redis lookup: tts:en:{hash} → local file path? → SERVE (~5ms)
  2. Cache miss → Call OpenAI TTS → Save to tts_cache/en/cat_abc123.mp3
  3. Set Redis key with 90-day TTL → Serve file
```

### Speech-to-Text (ASR) — Pronunciation Judge

Instead of a dedicated pronunciation scoring API, we use **ASR as a binary judge**: if OpenAI Whisper can transcribe the correct word from the child's speech, the pronunciation is good enough.

**Why this works:**
- **Simple:** Exact string match, no Levenshtein distance or pinyin libraries
- **Pedagogically sound:** For 6-10 year-olds, the bar is clear — Whisper understood you, or it didn't
- **Whisper handles variability:** The model already accounts for accent/pronunciation variations
- **All languages uniform:** No special tone-scoring API needed for Chinese

**Star Rating:**
- **3 stars** — Whisper transcript exactly matches expected word
- **1 star** — Transcript does not match
- After 3 attempts, the system moves on encouragingly

**Matching Logic:** Simple exact string comparison (case-insensitive, trimmed). Contains-match also accepted (e.g., Whisper returns "the cat" when target is "cat").

### Audio Preprocessing

| Parameter | Value |
|---|---|
| Max duration | 5 seconds |
| Min duration | 0.3 seconds |
| Max file size | 1MB |
| Target sample rate | 48000 Hz |
| Format | WebM/Opus (from MediaRecorder) or WAV |

Steps: validate format → check duration → normalize volume → trim silence → return for ASR.

---

## Duplicate Detection

### Perceptual Hashing

Detects when children photograph the same object:

- **pHash** with Hamming distance threshold of 8
- Compares against all photo hashes for the same child
- Duplicates still earn 25% XP (encourages pronunciation practice)

### Word-Level Dedup

Even with different photos, if AI identifies the same word → treated as duplicate.

---

## Cost Optimization

### Cost Per Capture

| Scenario | AI Cost | Speech Cost | Total |
|---|---|---|---|
| OpenAI GPT-4o (live) | ~$0.02 | $0 | ~$0.02 |
| OpenRouter fallback (Gemini Flash 2.5) | ~$0.005 | $0 | ~$0.005 |
| Pronunciation attempt | $0 | ~$0.006 (Whisper) | ~$0.006 |
| TTS (first time) | $0 | ~$0.015 (OpenAI TTS) | ~$0.015 |
| TTS (cached) | $0 | $0 | ~$0 |

### Monthly Projection (100 Beta Users)

| Cost Item | Month 1 | Month 3 |
|---|---|---|
| Vision (GPT-4o) | ~$600 | ~$600 |
| ASR (Whisper) | ~$27 | ~$27 |
| TTS (OpenAI) | ~$45 | ~$15 |
| **Total** | **~$672** | **~$642** |

### Cost Reduction Roadmap

| Optimization | When | Impact |
|---|---|---|
| TTS audio caching (local filesystem) | Launch | -90% TTS cost after warm-up |
| Switch to cheaper model via OpenRouter | Month 3+ | -60% per-call cost |
| On-device image classifier | v2 (future) | -80% vision calls |

---

## Latency Targets

| Operation | Target | Typical |
|---|---|---|
| OpenAI GPT-4o (vision) | <4s | 2-4s |
| OpenRouter fallback | <3s | 1-3s |
| OpenAI Whisper (ASR) | <3s | 1-3s |
| OpenAI TTS (generation) | <1s | 300-600ms |
| TTS (cached, local file) | <10ms | 1-5ms |
| **Full capture (AI call)** | **<4.5s** | **~3s** |
| **Pronunciation check** | **<3.5s** | **~2s** |

---

## Testing Strategy

### Unit Tests

- Pronunciation: exact match, contains match, no match

### Integration Tests

- Vision pipeline E2E: real photos → correct JSON structure
- Pronunciation E2E: audio recordings → star ratings

### Test Fixtures

```
tests/fixtures/
├── images/
│   ├── cat.jpg          # Common animal
│   ├── telescope.jpg    # Rare object
│   ├── blurry.jpg       # Low confidence trigger
│   └── multiple.jpg     # Multiple objects
│
├── audio/
│   ├── cat_correct.webm # Correct pronunciation
│   ├── cat_wrong.webm   # Wrong word
│   └── meo_correct.webm # Vietnamese pronunciation
```

---

## Sprint Roadmap

| Sprint | Weeks | AI Deliverables |
|---|---|---|
| **1** | 1-2 | Vision prompt design + testing, OpenAI GPT-4o integration, OpenRouter fallback, capture endpoint returning structured JSON |
| **2** | 3-4 | Whisper integration (EN/VI/ZH), ASR-as-judge exact match, OpenAI TTS integration, local TTS caching |
| **3** | 5-6 | Perceptual hash dedup, category diversity modifier |
| **4** | 7-8 | Mission-aware capture context |
| **5** | 9-10 | Parent dashboard, parent gate integration |
| **6** | 11-12 | ASR threshold tuning on children's voices, cost optimization, OpenRouter model evaluation |

---

## Environment Variables

```bash
OPENAI_API_KEY=sk-...              # Primary AI provider
OPENROUTER_API_KEY=sk-or-...       # Fallback AI provider
OPENROUTER_VISION_MODEL=google/gemini-flash-2.5  # Fallback vision model
```

---

## Related Docs

- [AI Pipeline Plan](../../_docs/ai.md)
- [Architecture Plan](../../_docs/architecture.md)
- [Backend Plan](../../_docs/backend.md)
- [Product Vision](../../_docs/product_vision.md)
