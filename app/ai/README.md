# SnapLearn — AI Services

**Vision, speech, safety, and rarity: the AI systems that power SnapLearn**

---

## Overview

The SnapLearn AI layer provides the intelligence behind every capture and pronunciation attempt. It is called by the FastAPI backend — the frontend never communicates with AI services directly.

### Core Responsibilities

1. **Vision** — Identify objects from photos, translate to English + Vietnamese + Chinese, categorize, and assess difficulty
2. **Speech** — Play vocabulary pronunciation (TTS) and judge child's pronunciation attempt (ASR-as-judge)
3. **Safety** — Filter inappropriate content at every layer to protect 6-10 year-old users
4. **Rarity** — Dynamic rarity calculation combining global capture frequency with AI-assessed linguistic difficulty
5. **Reference Cache** — Growing verified vocabulary database that reduces AI costs and latency over time

### Provider Strategy

All AI calls go through **OpenAI** (primary) or **OpenRouter** (fallback). No other AI providers are used.

| Service | Provider | Model | Purpose |
|---|---|---|---|
| **Vision (primary)** | OpenAI | GPT-4o | Photo → structured JSON (word, translation, category, rarity) |
| **Vision (fallback)** | OpenRouter | google/gemini-flash-1.5 or anthropic/claude-sonnet | Fallback if OpenAI is down |
| **ASR** | OpenAI | Whisper (whisper-1) | Pronunciation judging (EN, VI, ZH) |
| **TTS** | OpenAI | tts-1 / tts-1-hd | Word pronunciation playback (EN, VI, ZH) |

> **OpenRouter** provides access to 100+ models via a single API key and OpenAI-compatible format. Fallback switching is trivial — just change the model name.

---

## Vision Pipeline

### Routing Logic

```
Photo arrives →
  1. Perceptual hash → check if child already captured this exact object → DUPLICATE
  2. Lightweight label matching → check reference cache → CACHE HIT ($0, <50ms)
  3. Send to OpenAI GPT-4o → process response → LIVE RESULT (~$0.02, 2-4s)
  4. If OpenAI fails → send to OpenRouter (Gemini Flash) → FALLBACK (~$0.005, 1-3s)
  5. If all fail → return friendly error
```

### Vision Prompt Design

The vision prompt returns structured JSON with:

- Object identification in 3 languages (EN, VI, ZH) with phonetics/pinyin
- Category assignment (animals, food, nature, household, school, vehicles, etc.)
- Difficulty ratings per language (1-5 scale)
- Fun fact in Vietnamese
- Example sentences in all 3 languages
- Confidence score (0.0-1.0)
- Safety classification

#### Example Response

```json
{
  "status": "success",
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

**Pre-caching:** On deploy, TTS is pre-generated for all ~1000 reference vocab entries across 3 languages.

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

## Safety Pipeline

### Multi-Layer Architecture

Content must pass ALL 5 layers:

```
Photo input
    │
    ▼
┌─────────────────────────────┐
│ LAYER 1: AI Prompt Filter   │  GPT-4o system prompt refuses weapons,
│ (built into vision prompt)  │  alcohol, adult content, faces, etc.
└─────────────┬───────────────┘
              ▼
┌─────────────────────────────┐
│ LAYER 2: Confidence Gate    │  Reject responses with confidence < 0.7
│ (numerical threshold)       │
└─────────────┬───────────────┘
              ▼
┌─────────────────────────────┐
│ LAYER 3: Stop-List Filter   │  Server-side word blocklist in EN, VI, ZH
│ (~500 entries per language)  │  Catches words the AI might miss
└─────────────┬───────────────┘
              ▼
┌─────────────────────────────┐
│ LAYER 4: Category Filter    │  Block certain categories entirely
│ Standard: weapons, alcohol, │  Strict: + insects, medical, scary
│ tobacco, adult, violence    │
└─────────────┬───────────────┘
              ▼
┌─────────────────────────────┐
│ LAYER 5: Human Review Flag  │  Low-confidence (0.7-0.8) flagged
│ (async, non-blocking)       │  for review. Parent notified.
└─────────────┬───────────────┘
              ▼
         ✅ SAFE — Show vocab card
```

### Content Filter Levels

| Level | Blocks | Target |
|---|---|---|
| **Standard** (default) | Weapons, alcohol, tobacco, drugs, adult content, violence, hate symbols, gambling | Most families |
| **Strict** | All Standard + insects, spiders, snakes, medical imagery, skulls, scary content | Sensitive families, younger children (5-7) |

### Face Detection

The AI prompt refuses to identify people, plus a server-side check blocks words like "person", "child", "face", etc.

---

## Rarity Engine

### Calculation Algorithm

Rarity is **dynamic**, combining two signals:

1. **Global capture frequency** — How many users have captured this word? (Redis sorted set)
2. **Linguistic difficulty** — How hard is this word? (AI-assessed, 1-5 scale)

The final rarity is the **higher** of the two.

### Rarity Tiers

| Tier | Points | Frequency Threshold | Difficulty |
|---|---|---|---|
| Common | 10 | >50% of users | 1 |
| Uncommon | 25 | 20-50% of users | 2 |
| Rare | 50 | 5-20% of users | 3 |
| Epic | 100 | 1-5% of users | 4 |
| Legendary | 250 | <1% of users | 5 |

### Bootstrap Problem

With 0 users, every word would be "Legendary." Solution: seed Redis capture frequency from reference vocab difficulty ratings with synthetic data (simulated 100 users).

### Category Diversity Modifier

Encourages breadth over depth:

| Captures in Category | XP Modifier |
|---|---|
| 0 (first in category!) | 1.5x (bonus) |
| 1-4 | 1.0x (normal) |
| 5-14 | 0.8x (slight reduction) |
| 15+ | 0.6x (diminishing returns) |

---

## Reference Vocab Cache

### Purpose

1. **Fast path** — Skip AI call for known words. Instant response, zero cost.
2. **Quality assurance** — Verified translations are guaranteed correct.

### Cache Lookup Flow

```
Object identified →
  1. Redis lookup: ref_vocab:en:{word} → HIT? Return cached data (~50ms, $0)
  2. PostgreSQL lookup → HIT? Cache in Redis + return
  3. MISS → Use live AI result, flag for review if confidence < 0.85
```

### Growth Strategy

| Phase | Entries | Source |
|---|---|---|
| Launch | 200 | Hand-curated, Vietnamese linguist verified |
| Beta | +300 | High-confidence AI outputs (>0.9), weekly linguist review |
| Post-beta | 1,000+ | Organic growth from user captures, 60-70% cache hit rate |

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
| Cache hit (reference vocab) | $0 | $0 | ~$0 |
| OpenAI GPT-4o (live) | ~$0.02 | $0 | ~$0.02 |
| OpenRouter fallback (Gemini Flash) | ~$0.005 | $0 | ~$0.005 |
| Pronunciation attempt | $0 | ~$0.006 (Whisper) | ~$0.006 |
| TTS (first time) | $0 | ~$0.015 (OpenAI TTS) | ~$0.015 |
| TTS (cached) | $0 | $0 | ~$0 |

### Monthly Projection (100 Beta Users)

| Cost Item | Month 1 | Month 3 (with cache) |
|---|---|---|
| Vision (GPT-4o) | ~$420 | ~$240 |
| ASR (Whisper) | ~$27 | ~$27 |
| TTS (OpenAI) | ~$45 | ~$15 |
| **Total** | **~$492** | **~$282** |

### Cost Reduction Roadmap

| Optimization | When | Impact |
|---|---|---|
| Reference cache for common words | Launch | -30% vision calls |
| TTS audio caching (local filesystem) | Launch | -90% TTS cost after warm-up |
| Grow cache from user captures | Month 2+ | -50% vision calls by month 3 |
| Switch to cheaper model via OpenRouter | Month 3+ | -60% per-call cost |
| On-device image classifier | v2 (future) | -80% vision calls |

---

## Latency Targets

| Operation | Target | Typical |
|---|---|---|
| Reference cache lookup | <50ms | 10-30ms |
| OpenAI GPT-4o (vision) | <4s | 2-4s |
| OpenRouter fallback | <3s | 1-3s |
| OpenAI Whisper (ASR) | <3s | 1-3s |
| OpenAI TTS (generation) | <1s | 300-600ms |
| TTS (cached, local file) | <10ms | 1-5ms |
| **Full capture (cache hit)** | **<500ms** | **~200ms** |
| **Full capture (AI call)** | **<4.5s** | **~3s** |
| **Pronunciation check** | **<3.5s** | **~2s** |

---

## Testing Strategy

### Unit Tests

- Safety service: stop-list blocking, low confidence rejection
- Pronunciation: exact match, contains match, no match
- Rarity: common/rare word calculation, frequency thresholds

### Integration Tests

- Vision pipeline E2E: real photos → correct JSON structure
- Pronunciation E2E: audio recordings → star ratings
- Safety E2E: inappropriate images → blocking
- Reference cache: hit/miss behavior

### Test Fixtures

```
tests/fixtures/
├── images/
│   ├── cat.jpg          # Common animal
│   ├── telescope.jpg    # Rare object
│   ├── blurry.jpg       # Low confidence trigger
│   ├── knife.jpg        # Safety block trigger
│   └── multiple.jpg     # Multiple objects
│
├── audio/
│   ├── cat_correct.webm # Correct pronunciation
│   ├── cat_wrong.webm   # Wrong word
│   └── meo_correct.webm # Vietnamese pronunciation
│
└── reference_vocab_test.csv  # 20-word test set
```

---

## Sprint Roadmap

| Sprint | Weeks | AI Deliverables |
|---|---|---|
| **1** | 1-2 | Vision prompt design + testing, OpenAI GPT-4o integration, OpenRouter fallback, basic safety filter, reference vocab seed (200 words) |
| **2** | 3-4 | Whisper integration (EN/VI/ZH), ASR-as-judge exact match, OpenAI TTS integration, local TTS caching |
| **3** | 5-6 | Perceptual hash dedup, rarity engine (frequency + difficulty), reference cache optimization, diversity modifier |
| **4** | 7-8 | Mission-aware capture context, rarity rebalancing based on beta data |
| **5** | 9-10 | Content filter sensitivity levels (Standard/Strict), parent notification on flagged content, cache growth pipeline |
| **6** | 11-12 | ASR threshold tuning on children's voices, cost optimization, OpenRouter model evaluation |

---

## Environment Variables

```bash
OPENAI_API_KEY=sk-...              # Primary AI provider
OPENROUTER_API_KEY=sk-or-...       # Fallback AI provider
OPENROUTER_VISION_MODEL=google/gemini-flash-1.5  # Fallback vision model
```

---

## Related Docs

- [AI Pipeline Plan](../../_docs/ai.md)
- [Architecture Plan](../../_docs/architecture.md)
- [Backend Plan](../../_docs/backend.md)
- [Product Vision](../../_docs/product_vision.md)
