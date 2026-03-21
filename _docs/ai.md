# SnapLearn — AI Pipeline Plan

**Vision, speech: the AI systems that power SnapLearn**
Version 1.0 | March 2026

---

## 1. Overview

SnapLearn's AI pipeline has two core responsibilities:

1. **Vision** — Identify objects from photos, translate to English + Vietnamese + Chinese, categorize, and assess difficulty.
2. **Speech** — Play vocabulary pronunciation (TTS) and judge the child's pronunciation attempt (ASR-as-judge).

All AI services go through **OpenAI** (primary) or **OpenRouter** (fallback). No other AI providers are used.

All LLM-based inference (vision, pronunciation feedback, rarity classification, safety checks) is orchestrated through **[BAML](https://docs.boundaryml.com/)** — a domain-specific language for structured LLM function definitions. BAML provides **type-safe outputs** (Pydantic v2 models), **declarative fallback chains**, and **prompt-as-code** versioning. Non-LLM speech APIs (Whisper ASR, OpenAI TTS) are called directly in Python.

```
┌──────────────────────────────────────────────────────────────────────┐
│                         AI PIPELINE                                   │
│                                                                       │
│  ┌───────────────────────────────────────┐   ┌─────────────────────┐ │
│  │          BAML-ORCHESTRATED            │   │  DIRECT API CALLS   │ │
│  │                                       │   │                     │ │
│  │  ┌────────┐ ┌────────┐ ┌──────────┐  │   │  ┌───────────────┐  │ │
│  │  │ VISION │ │ SPEECH │ │ SAFETY   │  │   │  │ OpenAI Whisper│  │ │
│  │  │        │ │FEEDBACK│ │          │  │   │  │ (ASR/STT)     │  │ │
│  │  │ GPT-4o │ │        │ │ Image &  │  │   │  └───────────────┘  │ │
│  │  │   ↓    │ │ GPT-4o │ │ Word     │  │   │                     │ │
│  │  │ Gemini │ │ Mini   │ │ Checks   │  │   │  ┌───────────────┐  │ │
│  │  │   ↓    │ │   ↓    │ │          │  │   │  │ OpenAI TTS    │  │ │
│  │  │ Claude │ │ Gemini │ │ GPT-4o   │  │   │  │ (text-to-     │  │ │
│  │  │        │ │        │ │ Mini     │  │   │  │  speech)       │  │ │
│  │  └────────┘ └────────┘ └──────────┘  │   │  └───────────────┘  │ │
│  │         ┌──────────┐                  │   │                     │ │
│  │         │ RARITY   │                  │   │                     │ │
│  │         │ GPT-4o   │                  │   │                     │ │
│  │         │ Mini     │                  │   │                     │ │
│  │         └──────────┘                  │   │                     │ │
│  └───────────────────────────────────────┘   └─────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 2. BAML — structured LLM orchestration

### 2.1 Why BAML?

Instead of hand-coding OpenAI/OpenRouter API calls with raw `json.loads()` parsing, SnapLearn uses **BAML (Basically A Made-up Language)** to define all LLM interactions as **typed functions**. This gives us:

| Benefit | Description |
|---|---|
| **Type safety** | BAML generates Pydantic v2 models from `.baml` type definitions. No more `data["object_en"]` guessing — fields are validated at parse time. |
| **Declarative fallbacks** | Provider chains (`GPT-4o → Gemini Flash → Claude Sonnet`) are defined in BAML config, not in retry loops. BAML handles failover automatically. |
| **Prompt versioning** | Prompts live alongside type definitions in `.baml` files, tracked in git — not buried in Python string constants. |
| **Auto-generated client** | Running `baml-cli generate` produces a fully typed async Python client (`baml_client/`) that matches the FastAPI async/await architecture. |
| **Structured output** | BAML injects `{{ ctx.output_format }}` into prompts, which automatically tells the LLM the exact JSON schema to return — no manual schema in prompts. |
| **Built-in testing** | Test cases are defined in `.baml` files and run via `baml-cli test`, enabling fast iteration on prompts without Python test fixtures. |

### 2.2 BAML file structure

All BAML source files live in `app/be/baml_src/`. The generated client is output to `app/be/baml_client/`.

```
app/be/
├── baml_src/                   # BAML source (human-authored)
│   ├── generators.baml         # Code generation config (Python/Pydantic, async-first)
│   ├── types.baml              # Shared type definitions (enums + classes)
│   ├── clients.baml            # LLM provider config + fallback chains
│   ├── vision.baml             # Object recognition functions
│   ├── speech.baml             # Pronunciation feedback functions
│   ├── rarity.baml             # Gamification rarity classification
│   ├── safety.baml             # Content safety checks (image + word)
│   └── tests.baml              # Test cases for all functions
│
├── baml_client/                # Auto-generated (DO NOT EDIT)
│   ├── __init__.py             # Typed async functions: b.IdentifyObject(), etc.
│   ├── types.py                # Pydantic v2 models: VisionResult, BlockedResult, etc.
│   └── ...
```

### 2.3 Type definitions (`types.baml`)

All types are shared across functions and generate Pydantic v2 models.

**Enums:**

| Enum | Values | Purpose |
|---|---|---|
| `ObjectCategory` | 16 categories (animals, food, nature, household, school, vehicles, clothing, body_parts, toys, tools, buildings, weather, colors, instruments, sports, technology) | Object classification for collection book |
| `RarityTier` | common, uncommon, rare, epic, legendary | Gamification rarity with XP rewards (10–250 XP) |
| `Language` | en, vi, zh | Supported languages |
| `SafetyStatus` | safe, blocked | Content safety gate |
| `BlockReason` | inappropriate_content, person_detected, low_confidence | Why content was blocked |
| `FilterLevel` | standard, strict | Parent-configurable content filter level |

**Classes:**

| Class | Fields | Used by |
|---|---|---|
| `VisionResult` | object_en/vi/zh, phonetic_en, pinyin, category, difficulty_en/vi/zh, description_vi, fun_fact_vi, example sentences, confidence | `IdentifyObject`, `IdentifyObjectFiltered` |
| `BlockedResult` | status, reason | `IdentifyObjectFiltered` (union return) |
| `SafetyCheckResult` | status, reason?, confidence | `CheckImageSafety`, `CheckWordSafety` |
| `RarityInput` | object_en, category, difficulty_en/vi/zh, capture_pct? | `ClassifyRarity` input |
| `RarityResult` | rarity, base_xp, reasoning | `ClassifyRarity` output |
| `PronunciationResult` | transcribed_text, target_word, is_match, stars, feedback_vi | `GeneratePronunciationFeedback` |

### 2.4 Client configuration (`clients.baml`)

BAML clients define LLM provider connections and fallback strategies. Environment variables (`OPENAI_API_KEY`, `OPENROUTER_API_KEY`) are resolved at runtime.

```
┌──────────────────────────────────────────────────────────────────┐
│                    BAML CLIENT HIERARCHY                          │
│                                                                   │
│  VisionFallback (heavy tasks: vision, object recognition)        │
│  ├── GPT-4o          (OpenAI, temp=0.2, max_tokens=1024)        │
│  ├── GeminiFlash     (OpenRouter → google/gemini-flash-2.5)     │
│  └── ClaudeSonnet    (OpenRouter → anthropic/claude-sonnet-4)   │
│                                                                   │
│  FastFallback (lightweight tasks: rarity, safety, pronunciation) │
│  ├── GPT-4o-mini     (OpenAI, temp=0.1, max_tokens=512)         │
│  └── GeminiFlash     (OpenRouter → google/gemini-flash-2.5)     │
└──────────────────────────────────────────────────────────────────┘
```

| Client | Provider | Model | Temp | Used for |
|---|---|---|---|---|
| `GPT4o` | OpenAI | gpt-4o | 0.2 | Primary vision (image understanding) |
| `GPT4oMini` | OpenAI | gpt-4o-mini | 0.1 | Fast tasks (rarity, safety, pronunciation feedback) |
| `GeminiFlash` | OpenRouter | google/gemini-flash-2.5 | 0.2 | Fallback for both chains |
| `ClaudeSonnet` | OpenRouter | anthropic/claude-sonnet-4 | 0.2 | Last-resort vision fallback |
| **`VisionFallback`** | fallback | GPT4o → GeminiFlash → ClaudeSonnet | — | Vision functions |
| **`FastFallback`** | fallback | GPT4oMini → GeminiFlash | — | Rarity, safety, pronunciation |

### 2.5 BAML functions overview

| Function | File | Client | Input | Output | Purpose |
|---|---|---|---|---|---|
| `IdentifyObject` | vision.baml | VisionFallback | `photo: image` | `VisionResult` | Core object recognition from camera capture |
| `IdentifyObjectFiltered` | vision.baml | VisionFallback | `photo: image, filter_level` | `VisionResult \| BlockedResult` | Vision with parent-configured safety filter |
| `GeneratePronunciationFeedback` | speech.baml | FastFallback | `target_word, transcribed_text, language, attempt_number` | `PronunciationResult` | Child-friendly pronunciation encouragement |
| `GeneratePronunciationHint` | speech.baml | FastFallback | `word, language` | `string` | Short pronunciation tips in Vietnamese |
| `ClassifyRarity` | rarity.baml | FastFallback | `RarityInput` | `RarityResult` | Hybrid frequency/difficulty rarity classification |
| `CheckImageSafety` | safety.baml | FastFallback | `photo: image, filter_level` | `SafetyCheckResult` | Pre-flight image safety gate |
| `CheckWordSafety` | safety.baml | FastFallback | `word_en, word_vi, word_zh, category, filter_level` | `SafetyCheckResult` | Post-flight word safety validation |

### 2.6 How BAML integrates with FastAPI

The generated `baml_client` exposes a global `b` object with typed async methods:

```python
from baml_client import b
from baml_client.types import VisionResult, BlockedResult, RarityInput

# Vision — fully typed, fallback handled by BAML
result = await b.IdentifyObject(photo=image_bytes)
# result is VisionResult with .object_en, .object_vi, etc.

# Vision with filter — returns union type
result = await b.IdentifyObjectFiltered(photo=image_bytes, filter_level="strict")
if isinstance(result, BlockedResult):
    # Handle blocked content
    ...

# Rarity classification
rarity = await b.ClassifyRarity(RarityInput(
    object_en="telescope",
    category="technology",
    difficulty_en=4,
    difficulty_vi=4,
    difficulty_zh=5,
    capture_pct=3.2,
))
# rarity.rarity == RarityTier.epic, rarity.base_xp == 100

# Safety pre-check
safety = await b.CheckImageSafety(photo=image_bytes, filter_level="standard")
if safety.status == "blocked":
    return {"status": "blocked", "reason": safety.reason}

# Pronunciation feedback
feedback = await b.GeneratePronunciationFeedback(
    target_word="cat",
    transcribed_text="the cat",
    language="en",
    attempt_number=1,
)
# feedback.stars == 3, feedback.feedback_vi == "Tuyệt vời! 🎉"
```

**Key integration pattern:** BAML replaces the manual `VisionService._call_openai()` → `json.loads()` → `_parse_response()` pattern. The fallback chain, JSON parsing, and type validation are all handled by BAML — the Python service layer simply calls `await b.FunctionName(...)` and receives typed objects.

### 2.7 Code generation workflow

```bash
# Install BAML CLI (one-time)
pip install baml-py==0.76.2

# After editing any .baml file, regenerate the client:
cd app/be
baml-cli generate

# Run BAML tests (calls real LLMs — use sparingly):
baml-cli test

# The generated baml_client/ is committed to git for CI reproducibility
```

**Generator config** (`generators.baml`):
- Output: `python/pydantic` (Pydantic v2 models)
- Mode: `async` (matches FastAPI's async/await)
- Version: `0.76.2` (pinned for reproducibility)

### 2.8 BAML test cases

Test cases are defined in `tests.baml` and run against real LLM providers. They verify that prompts produce correctly structured outputs.

| Test | Function | What it validates |
|---|---|---|
| `IdentifyDog` | IdentifyObject | Dog photo → returns VisionResult with correct animal |
| `IdentifyApple` | IdentifyObject | Apple photo → food category, trilingual translations |
| `IdentifyPencil` | IdentifyObject | Pencil photo → school category |
| `IdentifyFilteredStandard/Strict` | IdentifyObjectFiltered | Filter level affects blocking behavior |
| `SafetyCheckSafeImage` | CheckImageSafety | Cat photo → safe |
| `WordSafetyCat/Book` | CheckWordSafety | Common words → safe |
| `RarityCommonCat` | ClassifyRarity | Cat (difficulty 1, 65% capture) → common |
| `RarityRareTelescope` | ClassifyRarity | Telescope (difficulty 4-5, 3.2% capture) → epic |
| `RarityLegendaryAccordion` | ClassifyRarity | Accordion (difficulty 5, no data) → legendary |
| `PronunciationMatchEnglish` | GeneratePronunciationFeedback | Exact match → 3 stars |
| `PronunciationContainsMatch` | GeneratePronunciationFeedback | "the dog" contains "dog" → 3 stars |
| `PronunciationMismatchAttempt1/3` | GeneratePronunciationFeedback | No match → 1 star, different feedback by attempt |
| `HintEnglishCat/MandarinMao/VietnameseMeo` | GeneratePronunciationHint | Pronunciation tips in Vietnamese |

---

## 3. Vision pipeline

### 2.1 Provider strategy

| Provider | Role | Model | Latency | Cost per call | When used |
|---|---|---|---|---|---|
| **OpenAI** | Primary | GPT-4o | 2–4s | ~$0.01–0.03 | Default for all captures |
| **OpenRouter** | Fallback | google/gemini-flash-2.5 or anthropic/claude-sonnet | 1–3s | ~$0.005–0.015 | When OpenAI is unavailable or over error threshold |

> **OpenRouter** provides access to 100+ models (Google Gemini, Anthropic Claude, Meta Llama, etc.) via a single API key and OpenAI-compatible API format. This makes fallback switching trivial — just change the model name.

**Routing logic:**
```
Photo arrives →
  1. Send to OpenAI GPT-4o → process response → LIVE RESULT
  2. If OpenAI fails → send to OpenRouter (Gemini Flash 2.5) → FALLBACK RESULT
  3. If all fail → return friendly error
```

### 2.2 Vision prompt design

The vision prompt is the most critical piece of prompt engineering in SnapLearn. It must:
- Correctly identify objects in diverse Vietnamese environments (markets, schools, homes, streets)
- Return structured JSON (not free text)
- Generate a **natural language description** in Vietnamese — a friendly, excited reaction describing what's in the photo (makes the experience feel conversational for the child)
- Translate to all three languages simultaneously
- Assess linguistic difficulty
- Categorize for the collection book
- Generate a fun fact in Vietnamese
- Handle edge cases (blurry photos, multiple objects, abstract items)

#### System prompt

```
You are SnapLearn Vision, an AI assistant for a children's language learning app
used by Vietnamese children aged 6–10. Your job is to identify real-world objects
from photographs and provide educational vocabulary data.

RULES:
1. Identify the SINGLE most prominent object in the photo.
2. If the photo contains multiple objects, pick the most central/focused one.
3. Return translations in English, Vietnamese, and Mandarin Chinese.
4. Vietnamese should use the most common, child-friendly word (e.g., "con mèo" not "mèo").
5. English phonetic transcription uses IPA format.
6. Chinese pinyin includes tone marks (e.g., māo, not mao).
7. Category must be one of: animals, food, nature, household, school, vehicles, clothing,
   body_parts, toys, tools, buildings, weather, colors, instruments, sports, technology.
8. Difficulty (1–5): 1 = very common/easy word, 5 = rare/complex word.
   Provide separate difficulty ratings for English, Vietnamese, and Chinese.
9. Fun fact must be in Vietnamese, age-appropriate, interesting, and 1 sentence.
10. Confidence (0.0–1.0): How certain you are about the identification.
11. Description (description_vi): Write a SHORT, friendly, excited Vietnamese sentence
    describing what you see in the photo — as if reacting to a child showing you what they found.
    Include visual details (color, size, position, action) to make it feel personal and alive.
    Tone: like an excited friend discovering things together. Max 1-2 sentences.
    Example: "Ồ hay quá! Có một chú chó lông nâu đang nằm trên sàn nhà kìa!"

RESPONSE FORMAT — Always return valid JSON, nothing else:
```

#### User prompt

```
Identify the main object in this photo and provide vocabulary data.

Return ONLY this JSON structure:
{
  "status": "success",
  "description_vi": "<friendly Vietnamese sentence describing what you see>",
  "object_en": "<English name>",
  "phonetic_en": "<IPA pronunciation>",
  "object_vi": "<Vietnamese name>",
  "object_zh": "<Chinese characters>",
  "pinyin": "<pinyin with tone marks>",
  "category": "<category>",
  "difficulty_en": <1-5>,
  "difficulty_vi": <1-5>,
  "difficulty_zh": <1-5>,
  "fun_fact_vi": "<fun fact in Vietnamese>",
  "example_sentence_en": "<simple English sentence using the word>",
  "example_sentence_vi": "<simple Vietnamese sentence using the word>",
  "example_sentence_zh": "<simple Chinese sentence using the word>",
  "confidence": <0.0-1.0>
}
```

#### Example responses

**Common object (high confidence):**
```json
{
  "status": "success",
  "description_vi": "Ồ hay quá! Có một chú mèo lông vàng đang nằm cuộn tròn trên ghế sofa kìa!",
  "object_en": "cat",
  "phonetic_en": "/kæt/",
  "object_vi": "con mèo",
  "object_zh": "猫",
  "pinyin": "māo",
  "category": "animals",
  "difficulty_en": 1,
  "difficulty_vi": 1,
  "difficulty_zh": 2,
  "fun_fact_vi": "Mèo có thể ngủ tới 16 giờ mỗi ngày!",
  "example_sentence_en": "The cat is sleeping on the sofa.",
  "example_sentence_vi": "Con mèo đang ngủ trên ghế sofa.",
  "example_sentence_zh": "猫在沙发上睡觉。",
  "confidence": 0.97
}
```

**Rare object (lower confidence):**
```json
{
  "status": "success",
  "description_vi": "Ô, mình thấy một cái kính viễn vọng màu đen đặt trên bàn gỗ! Hay ghê!",
  "object_en": "telescope",
  "phonetic_en": "/ˈtɛlɪskoʊp/",
  "object_vi": "kính viễn vọng",
  "object_zh": "望远镜",
  "pinyin": "wàngyuǎnjìng",
  "category": "tools",
  "difficulty_en": 3,
  "difficulty_vi": 4,
  "difficulty_zh": 4,
  "fun_fact_vi": "Kính viễn vọng đầu tiên được phát minh cách đây hơn 400 năm!",
  "example_sentence_en": "I can see the moon through the telescope.",
  "example_sentence_vi": "Em có thể nhìn thấy mặt trăng qua kính viễn vọng.",
  "example_sentence_zh": "我可以通过望远镜看到月亮。",
  "confidence": 0.85
}
```

### 3.3 Vision service implementation

With BAML, the vision service is dramatically simplified. The fallback chain, prompt engineering, JSON parsing, and type validation are all handled by the BAML-generated client:

```python
from baml_client import b
from baml_client.types import VisionResult, BlockedResult

class VisionService:
    """
    Object recognition via BAML-orchestrated LLM calls.
    Fallback chain (GPT-4o → Gemini Flash → Claude) is handled by BAML.
    """

    async def identify(self, image_bytes: bytes) -> VisionResult:
        """Identify an object from a photo using BAML's IdentifyObject function."""
        return await b.IdentifyObject(photo=image_bytes)

    async def identify_filtered(
        self, image_bytes: bytes, filter_level: str = "standard"
    ) -> VisionResult | BlockedResult:
        """Identify with parent-configured safety filter."""
        return await b.IdentifyObjectFiltered(
            photo=image_bytes,
            filter_level=filter_level,
        )
```

> **Before BAML:** The vision service was ~130 lines of Python managing two OpenAI clients, retry loops, JSON parsing, and manual type construction. **After BAML:** The same logic is ~15 lines. Prompts, types, and fallback chains are defined declaratively in `.baml` files.

### 2.4 Image preprocessing

Before sending to any AI provider, images are preprocessed client-side AND server-side:

```python
class ImageProcessor:
    MAX_DIMENSION = 1024       # Max width or height in pixels
    JPEG_QUALITY = 80          # Compression quality
    MAX_FILE_SIZE = 2_000_000  # 2MB after compression

    async def process(self, raw_bytes: bytes) -> ProcessedImage:
        """
        Validate, resize, compress, and hash the image.
        """
        # 1. Validate format (JPEG, PNG, WebP only)
        img = Image.open(io.BytesIO(raw_bytes))
        if img.format not in ("JPEG", "PNG", "WEBP"):
            raise ValidationError("Unsupported image format")

        # 2. Strip EXIF data (privacy — may contain GPS, device info)
        img = self._strip_exif(img)

        # 3. Resize (maintain aspect ratio, max 1024px on longest side)
        if max(img.size) > self.MAX_DIMENSION:
            img.thumbnail((self.MAX_DIMENSION, self.MAX_DIMENSION), Image.LANCZOS)

        # 4. Convert to JPEG for consistent API input
        buffer = io.BytesIO()
        img.save(buffer, format="JPEG", quality=self.JPEG_QUALITY)
        compressed = buffer.getvalue()

        # 5. Validate file size
        if len(compressed) > self.MAX_FILE_SIZE:
            raise ValidationError("Image too large after compression")

        return ProcessedImage(
            data=compressed,
            media_type="image/jpeg",
            width=img.size[0],
            height=img.size[1],
            size_bytes=len(compressed),
        )
```

---

## 4. Speech pipeline

### 4.1 Text-to-Speech (TTS)

TTS is used to play the correct pronunciation of vocabulary words. All TTS goes through **OpenAI's TTS API** (`tts-1` or `tts-1-hd`).

| Language | Provider | Voice | Rationale |
|---|---|---|---|
| English (en) | OpenAI TTS | `alloy` or `nova` | Clear, natural, child-friendly |
| Vietnamese (vi) | OpenAI TTS | `nova` | Best multilingual voice for Vietnamese |
| Mandarin (zh) | OpenAI TTS | `nova` | Good Mandarin pronunciation with tones |

> **Note:** OpenAI's TTS voices are multilingual — a single voice like `nova` can pronounce English, Vietnamese, and Mandarin. We pass the word with a language hint in the prompt to ensure correct pronunciation.

**TTS caching strategy:**

TTS audio for any given word+language combination never changes. We aggressively cache to the **local filesystem**:

```
Request for TTS("cat", "en") →
  1. Check Redis: tts:en:{hash("cat")} → local file path?
     YES → serve file from local filesystem (~5ms)
     NO  →
  2. Call OpenAI TTS API → receive audio bytes
  3. Save to local file: tts_cache/en/cat_abc123.mp3
  4. Set Redis key: tts:en:{hash("cat")} = tts_cache/en/cat_abc123.mp3 (TTL: 90 days)
  5. Serve the file
```

```python
class TTSService:
    """
    Text-to-Speech with aggressive local file caching.
    Generates on-demand for words (cached after first generation).
    """

    VOICE_CONFIG = {
        "en": {"voice": "nova", "speed": 0.85},       # Slightly slower for children
        "vi": {"voice": "nova", "speed": 0.80},       # Slower for clarity
        "zh": {"voice": "nova", "speed": 0.75},       # Slowest for tone clarity
    }

    TTS_CACHE_DIR = Path("tts_cache")

    async def get_audio_path(self, word: str, language: str) -> str:
        """Get TTS audio file path. Returns cached path or generates new."""
        cache_key = f"tts:{language}:{hashlib.md5(word.encode()).hexdigest()}"

        # Check Redis cache for local file path
        cached_path = await self.redis.get(cache_key)
        if cached_path:
            path = cached_path.decode()
            if Path(path).exists():
                return path

        # Generate audio via OpenAI TTS
        config = self.VOICE_CONFIG[language]
        response = await self.openai_client.audio.speech.create(
            model="tts-1",
            voice=config["voice"],
            input=word,
            speed=config["speed"],
            response_format="mp3",
        )

        # Save to local filesystem
        file_name = f"{cache_key.replace(':', '_')}.mp3"
        file_path = self.TTS_CACHE_DIR / language / file_name
        file_path.parent.mkdir(parents=True, exist_ok=True)

        async with aiofiles.open(file_path, "wb") as f:
            await f.write(response.content)

        # Cache path in Redis (90-day TTL)
        await self.redis.set(cache_key, str(file_path), ex=90 * 86400)

        return str(file_path)

    async def ensure_cached(self, vocab_data: VisionResult):
        """Pre-generate TTS for all languages of a word. Called async after capture."""
        await asyncio.gather(
            self.get_audio_path(vocab_data.object_en, "en"),
            self.get_audio_path(vocab_data.object_vi, "vi"),
            self.get_audio_path(vocab_data.object_zh, "zh"),
        )
```

### 4.2 Speech-to-Text (ASR) — Pronunciation judge

The core insight: **instead of a pronunciation scoring API, we use ASR as a binary judge.** If the ASR can transcribe the correct word from the child's speech, the pronunciation is good enough. **No fuzzy matching** — it's either exact or not.

| Language | ASR Provider | Model | Config |
|---|---|---|---|
| English | OpenAI | whisper-1 | language="en", prompt hint |
| Vietnamese | OpenAI | whisper-1 | language="vi", prompt hint |
| Mandarin | OpenAI | whisper-1 | language="zh", prompt hint |

```python
class SpeechService:
    """
    ASR-as-pronunciation-judge using OpenAI Whisper.
    Converts child's audio to text, then does exact match against expected word.
    No fuzzy matching — simple and pedagogically appropriate for 6-10 year-olds.
    """

    async def evaluate_pronunciation(
        self, audio_bytes: bytes, expected_word: str, language: str
    ) -> PronunciationResult:
        """
        Evaluate child's pronunciation attempt.
        Returns 3 stars (exact match) or 1 star (no match).
        """
        # 1. Send audio to OpenAI Whisper
        transcript = await self._transcribe(audio_bytes, language, hint=expected_word)

        if not transcript:
            return PronunciationResult(stars=1, transcript="", match_type="no_match")

        # 2. Exact match check (case-insensitive, trimmed)
        is_match = self._exact_match(transcript, expected_word, language)

        if is_match:
            return PronunciationResult(
                stars=3,
                transcript=transcript,
                expected=expected_word,
                match_type="exact",
            )
        else:
            return PronunciationResult(
                stars=1,
                transcript=transcript,
                expected=expected_word,
                match_type="no_match",
            )

    async def _transcribe(
        self, audio_bytes: bytes, language: str, hint: str
    ) -> str | None:
        """Call OpenAI Whisper for transcription."""
        language_codes = {"en": "en", "vi": "vi", "zh": "zh"}

        try:
            # Create a temporary file for the audio (Whisper API requires a file)
            audio_file = io.BytesIO(audio_bytes)
            audio_file.name = "recording.webm"

            response = await asyncio.wait_for(
                self.openai_client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio_file,
                    language=language_codes[language],
                    prompt=hint,  # Boost expected word recognition
                ),
                timeout=5.0,
            )
        except asyncio.TimeoutError:
            logger.warning("Whisper ASR timeout")
            return None

        if not response.text:
            return None

        return response.text.strip().lower()

    def _exact_match(self, transcript: str, expected: str, language: str) -> bool:
        """
        Simple exact string comparison.
        Case-insensitive, trimmed, with minor normalization.
        """
        transcript_clean = transcript.lower().strip().rstrip(".,!?。，！？")
        expected_clean = expected.lower().strip()

        # Direct match
        if transcript_clean == expected_clean:
            return True

        # Contains match (Whisper might add articles: "the cat" vs "cat",
        # or trailing punctuation)
        if expected_clean in transcript_clean or transcript_clean in expected_clean:
            return True

        return False
```

**Why no fuzzy matching?**
- **Simplicity:** Exact match is trivial to implement, test, and debug. No Levenshtein distance, no pinyin conversion libraries.
- **Pedagogically sound:** For 6–10 year-olds learning new words, the bar should be clear — either Whisper understood you, or it didn't. This avoids confusing "partial" scores.
- **Whisper handles variability:** Whisper's own model already accounts for accent/pronunciation variations. If it transcribes "cat" from the child's audio, the pronunciation was close enough.
- **Star system is binary:** ★★★ (3 stars = match) or ★ (1 star = no match). After 3 failed attempts, the app moves on encouragingly. No ambiguous 2-star middle ground.

### 4.3 Audio preprocessing

Children record audio via the PTT (Push-to-Talk) button. The audio needs preprocessing before ASR:

```python
class AudioProcessor:
    """
    Preprocess child's audio recording for ASR.
    """
    MAX_DURATION_SECONDS = 5.0     # Max recording length
    MIN_DURATION_SECONDS = 0.3     # Min recording length (too short = accidental)
    MAX_FILE_SIZE = 1_000_000      # 1MB
    TARGET_SAMPLE_RATE = 48000     # Whisper optimal

    async def process(self, audio_bytes: bytes) -> ProcessedAudio:
        # 1. Validate format (WebM/Opus from MediaRecorder, or WAV)
        # 2. Check duration
        # 3. Normalize volume (children may be too quiet or too loud)
        # 4. Trim silence from start/end
        # 5. Return processed bytes ready for ASR
        ...
```

---

## 5. Cost optimization

### 5.1 Cost per capture

| Scenario | AI cost | Speech cost | Total |
|---|---|---|---|
| **OpenAI GPT-4o** (live) | ~$0.01–0.03 | $0 | ~$0.02 |
| **OpenRouter fallback** (Gemini Flash 2.5) | ~$0.003–0.008 | $0 | ~$0.005 |
| **With pronunciation** (per attempt) | $0 | ~$0.006 (Whisper) | ~$0.006 |
| **With TTS** (per word, first time) | $0 | ~$0.015 (OpenAI TTS) | ~$0.015 |
| **With TTS** (cached) | $0 | $0 | ~$0 |

### 5.2 Monthly cost projection (100 beta users)

| Assumption | Value |
|---|---|
| Active users | 100 |
| Captures per user per day | 10 |
| Pronunciation attempts per capture | 1.5 avg |
| TTS plays per capture | 3 (EN + VI + ZH) |

| Cost item | Month 1 | Month 3 |
|---|---|---|
| OpenAI GPT-4o (vision) | $600 (30K calls × $0.02) | $600 |
| OpenAI Whisper (ASR) | $27 (45K attempts × $0.006/min) | $27 |
| OpenAI TTS | $45 (first-time generation) | $15 (mostly cached) |
| **Total AI costs** | **~$672** | **~$642** |

### 5.3 Cost reduction roadmap

| Optimization | When | Impact |
|---|---|---|
| TTS audio caching (local filesystem) | Launch | -90% TTS cost after warm-up |
| Switch primary to cheaper model via OpenRouter (Gemini Flash 2.5) | Month 3+ | -60% per-call cost |
| On-device image classifier (future) | v2 | -80% vision calls (only novel objects go to AI) |

---

## 6. Latency targets

| Operation | Target | Typical |
|---|---|---|
| OpenAI GPT-4o (vision) | < 4s | 2-4s |
| OpenRouter fallback (vision) | < 3s | 1-3s |
| OpenAI Whisper (pronunciation) | < 3s | 1-3s |
| OpenAI TTS (generation) | < 1s | 300-600ms |
| TTS (cached, local file) | < 10ms | 1-5ms |
| **Full capture flow (AI call)** | **< 4.5s** | **~3s** |
| **Pronunciation check** | **< 3.5s** | **~2s** |

**Local deployment note:** Since everything runs on the same machine, network latency between services is negligible (~0ms). The bottleneck is purely the external OpenAI/OpenRouter API call latency.

---

## 7. Testing strategy

### 7.1 BAML tests (prompt validation)

BAML test cases (in `tests.baml`) validate prompt → structured output correctness against real LLM providers. See section 2.8 for the full test matrix.

```bash
# Run all BAML tests (hits real APIs — use sparingly)
cd app/be && baml-cli test

# Run specific test
baml-cli test --filter IdentifyDog
```

### 7.2 Unit tests

```python
# tests/test_pronunciation.py
async def test_exact_match_three_stars():
    service = SpeechService()
    result = service._exact_match("cat", "cat", "en")
    assert result is True

async def test_contains_match():
    service = SpeechService()
    result = service._exact_match("the cat", "cat", "en")
    assert result is True  # Whisper added article, still a match

async def test_no_match_one_star():
    service = SpeechService()
    result = service._exact_match("dog", "cat", "en")
    assert result is False
```

### 7.3 Integration tests

- **Vision pipeline E2E:** Upload real photos → verify correct JSON structure from OpenAI GPT-4o
- **Pronunciation pipeline E2E:** Upload audio recordings → verify star ratings

### 7.4 Test data

```
tests/fixtures/
├── images/
│   ├── cat.jpg          # Common animal
│   ├── telescope.jpg    # Rare object
│   ├── blurry.jpg       # Should trigger low confidence
│   └── multiple.jpg     # Multiple objects (should pick main one)
│
├── audio/
│   ├── cat_correct.webm    # Correct pronunciation (should match)
│   ├── cat_wrong.webm      # Wrong word entirely (should not match)
│   └── meo_correct.webm    # Vietnamese pronunciation
```

---

## 8. Sprint-to-AI mapping

| Sprint | Weeks | AI deliverables |
|---|---|---|
| **1** | 1-2 | BAML type definitions + client configuration, vision prompt design + testing (via `baml-cli test`), `IdentifyObject` + `IdentifyObjectFiltered` functions, `CheckImageSafety` + `CheckWordSafety` safety gates, OpenAI GPT-4o integration via BAML, OpenRouter fallback setup via BAML, capture endpoint returning structured JSON |
| **2** | 3-4 | OpenAI Whisper integration (EN + VI + ZH) — direct API, ASR-as-judge exact match logic, OpenAI TTS integration — direct API, local filesystem TTS caching, `GeneratePronunciationFeedback` + `GeneratePronunciationHint` BAML functions, pronunciation endpoint |
| **3** | 5-6 | `ClassifyRarity` BAML function, category diversity modifier |
| **4** | 7-8 | Mission-aware capture context (e.g., "red objects" mission influences category matching) |
| **5** | 9-10 | Parent dashboard, parent gate integration |
| **6** | 11-12 | ASR threshold tuning on children's voice data, cost optimization, BAML prompt iteration + OpenRouter fallback model evaluation |

---

*This document should be read alongside [architecture.md](./architecture.md) and [backend.md](./backend.md).*
