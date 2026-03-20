# SnapLearn — AI Pipeline Plan

**Vision, speech, safety, and rarity: the AI systems that power SnapLearn**
Version 1.0 | March 2026

---

## 1. Overview

SnapLearn's AI pipeline has three core responsibilities:

1. **Vision** — Identify objects from photos, translate to English + Vietnamese + Chinese, categorize, and assess difficulty.
2. **Speech** — Play vocabulary pronunciation (TTS) and judge the child's pronunciation attempt (ASR-as-judge).
3. **Safety** — Filter inappropriate content at every layer to protect 6–10 year-old users.

Additionally, the AI pipeline feeds into:
4. **Rarity** — Dynamic rarity calculation combining global capture frequency with AI-assessed linguistic difficulty.
5. **Reference cache** — A growing verified vocabulary database that reduces AI costs and latency over time.

All AI services go through **OpenAI** (primary) or **OpenRouter** (fallback). No other AI providers are used.

```
┌─────────────────────────────────────────────────────────┐
│                    AI PIPELINE                           │
│                                                         │
│  ┌─────────────┐   ┌─────────────┐   ┌──────────────┐  │
│  │   VISION    │   │   SPEECH    │   │   SAFETY     │  │
│  │             │   │             │   │              │  │
│  │ OpenAI      │   │ OpenAI     │   │ Prompt-level │  │
│  │ GPT-4o      │   │ Whisper    │   │ Stop-list    │  │
│  │ (primary)   │   │ (ASR)      │   │ Confidence   │  │
│  │             │   │             │   │ Category     │  │
│  │ OpenRouter  │   │ OpenAI     │   │ filter       │  │
│  │ (fallback)  │   │ TTS        │   │              │  │
│  └──────┬──────┘   └──────┬──────┘   └──────┬───────┘  │
│         │                 │                  │          │
│         ▼                 ▼                  ▼          │
│  ┌─────────────────────────────────────────────────┐    │
│  │              REFERENCE CACHE                     │    │
│  │  1,000+ verified vocab entries (growing)         │    │
│  │  PostgreSQL + Redis hot cache                    │    │
│  └─────────────────────────────────────────────────┘    │
│         │                                               │
│         ▼                                               │
│  ┌─────────────────────────────────────────────────┐    │
│  │              RARITY ENGINE                       │    │
│  │  Global frequency (Redis) + AI difficulty score  │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Vision pipeline

### 2.1 Provider strategy

| Provider | Role | Model | Latency | Cost per call | When used |
|---|---|---|---|---|---|
| **OpenAI** | Primary | GPT-4o | 2–4s | ~$0.01–0.03 | Default for all captures |
| **OpenRouter** | Fallback | google/gemini-flash-1.5 or anthropic/claude-sonnet | 1–3s | ~$0.005–0.015 | When OpenAI is unavailable or over error threshold |
| **Reference cache** | Fast path | N/A (DB lookup) | <50ms | $0 | When the object matches a known verified entry |

> **OpenRouter** provides access to 100+ models (Google Gemini, Anthropic Claude, Meta Llama, etc.) via a single API key and OpenAI-compatible API format. This makes fallback switching trivial — just change the model name.

**Routing logic:**
```
Photo arrives →
  1. Run perceptual hash → check if child already captured this exact object → DUPLICATE
  2. Run lightweight label matching → check reference cache → CACHE HIT
  3. Send to OpenAI GPT-4o → process response → LIVE RESULT
  4. If OpenAI fails → send to OpenRouter (Gemini Flash) → FALLBACK RESULT
  5. If all fail → return friendly error
```

### 2.2 Vision prompt design

The vision prompt is the most critical piece of prompt engineering in SnapLearn. It must:
- Correctly identify objects in diverse Vietnamese environments (markets, schools, homes, streets)
- Return structured JSON (not free text)
- Translate to all three languages simultaneously
- Assess linguistic difficulty
- Categorize for the collection book
- Generate a fun fact in Vietnamese
- Refuse unsafe content
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

SAFETY — MANDATORY:
- REFUSE to identify: weapons, knives, guns, alcohol, tobacco, drugs, adult content,
  violence, blood, nudity, hate symbols, gambling.
- If the image contains ANY of the above, return: {"status": "blocked", "reason": "inappropriate_content"}
- REFUSE to identify people's faces. If a person is the main subject, return:
  {"status": "blocked", "reason": "person_detected"}
- If the image is too blurry, dark, or ambiguous, return low confidence (< 0.5).

RESPONSE FORMAT — Always return valid JSON, nothing else:
```

#### User prompt

```
Identify the main object in this photo and provide vocabulary data.

Return ONLY this JSON structure:
{
  "status": "success",
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

**Safety block:**
```json
{
  "status": "blocked",
  "reason": "inappropriate_content"
}
```

### 2.3 Vision service implementation

```python
class VisionService:
    """
    Orchestrates object recognition via OpenAI GPT-4o (primary)
    and OpenRouter (fallback).
    """

    def __init__(self, config: Config):
        self.openai_client = openai.AsyncOpenAI(api_key=config.OPENAI_API_KEY)
        self.openrouter_client = openai.AsyncOpenAI(
            api_key=config.OPENROUTER_API_KEY,
            base_url="https://openrouter.ai/api/v1",
        )
        self.system_prompt = VISION_SYSTEM_PROMPT
        self.user_prompt = VISION_USER_PROMPT
        self.max_retries = 2
        self.primary_timeout = 8.0    # seconds
        self.fallback_timeout = 6.0
        self.fallback_model = config.OPENROUTER_VISION_MODEL  # e.g., "google/gemini-flash-1.5"

    async def identify(self, image_bytes: bytes) -> VisionResult:
        """
        Identify an object from a photo.
        Tries OpenAI GPT-4o first, falls back to OpenRouter.
        """
        # Encode image for API
        image_b64 = base64.b64encode(image_bytes).decode("utf-8")

        # Try OpenAI GPT-4o (primary)
        for attempt in range(self.max_retries):
            try:
                result = await self._call_openai(image_b64)
                return result
            except (openai.APITimeoutError, openai.APIStatusError) as e:
                logger.warning(f"OpenAI attempt {attempt + 1} failed: {e}")
                if attempt == self.max_retries - 1:
                    break

        # Fallback to OpenRouter
        logger.info(f"Falling back to OpenRouter ({self.fallback_model})")
        try:
            result = await self._call_openrouter(image_b64)
            return result
        except Exception as e:
            logger.error(f"All vision providers failed: {e}")
            raise AIServiceError("Vision service unavailable")

    async def _call_openai(self, image_b64: str) -> VisionResult:
        response = await asyncio.wait_for(
            self.openai_client.chat.completions.create(
                model="gpt-4o",
                max_tokens=500,
                messages=[
                    {"role": "system", "content": self.system_prompt},
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{image_b64}",
                                    "detail": "low",
                                },
                            },
                            {"type": "text", "text": self.user_prompt},
                        ],
                    },
                ],
                response_format={"type": "json_object"},
            ),
            timeout=self.primary_timeout,
        )

        data = json.loads(response.choices[0].message.content)
        return self._parse_response(data, provider="openai")

    async def _call_openrouter(self, image_b64: str) -> VisionResult:
        """
        OpenRouter uses the same OpenAI-compatible API format.
        Just swap the client and model name.
        """
        response = await asyncio.wait_for(
            self.openrouter_client.chat.completions.create(
                model=self.fallback_model,
                max_tokens=500,
                messages=[
                    {"role": "system", "content": self.system_prompt},
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{image_b64}",
                                    "detail": "low",
                                },
                            },
                            {"type": "text", "text": self.user_prompt},
                        ],
                    },
                ],
            ),
            timeout=self.fallback_timeout,
        )

        data = json.loads(response.choices[0].message.content)
        return self._parse_response(data, provider="openrouter")

    def _parse_response(self, data: dict, provider: str) -> VisionResult:
        if data.get("status") == "blocked":
            return VisionResult(status="blocked", reason=data.get("reason"))

        return VisionResult(
            status="success",
            object_en=data["object_en"],
            phonetic_en=data["phonetic_en"],
            object_vi=data["object_vi"],
            object_zh=data["object_zh"],
            pinyin=data["pinyin"],
            category=data["category"],
            difficulty_en=data["difficulty_en"],
            difficulty_vi=data["difficulty_vi"],
            difficulty_zh=data["difficulty_zh"],
            fun_fact_vi=data["fun_fact_vi"],
            example_sentence_en=data.get("example_sentence_en"),
            example_sentence_vi=data.get("example_sentence_vi"),
            example_sentence_zh=data.get("example_sentence_zh"),
            confidence=data["confidence"],
            provider=provider,
        )
```

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

        # 6. Compute perceptual hash for duplicate detection
        phash = imagehash.phash(img)

        return ProcessedImage(
            data=compressed,
            media_type="image/jpeg",
            width=img.size[0],
            height=img.size[1],
            size_bytes=len(compressed),
            perceptual_hash=str(phash),
        )
```

---

## 3. Speech pipeline

### 3.1 Text-to-Speech (TTS)

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
    Pre-generates audio for reference vocab on deploy.
    Generates on-demand for novel words (cached after first generation).
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

    async def precache_reference_vocab(self):
        """Batch generate TTS for all reference vocab. Run on deploy."""
        ref_words = await self.repo.get_all_reference_vocab()
        for word in ref_words:
            await self.ensure_cached(word)
            await asyncio.sleep(0.1)  # Rate limit: 10 calls/sec
```

### 3.2 Speech-to-Text (ASR) — Pronunciation judge

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

### 3.3 Audio preprocessing

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

## 4. Safety pipeline

### 4.1 Multi-layer safety architecture

Safety is not a single filter — it's a pipeline of 5 independent layers. Content must pass ALL layers.

```
Photo input
    │
    ▼
┌────────────────────────────┐
│ LAYER 1: AI Prompt Filter  │  GPT-4o system prompt explicitly refuses
│ (built into vision prompt) │  weapons, alcohol, adult content, faces, etc.
│ Returns "blocked" status   │
└─────────────┬──────────────┘
              │ (if status = "success")
              ▼
┌────────────────────────────┐
│ LAYER 2: Confidence Gate   │  Reject AI responses with confidence < 0.7
│ (numerical threshold)      │  "Hmm, mình chưa nhìn rõ lắm!"
└─────────────┬──────────────┘
              │ (if confidence >= 0.7)
              ▼
┌────────────────────────────┐
│ LAYER 3: Stop-List Filter  │  Server-side word blocklist in EN, VI, ZH
│ (curated word lists)       │  Blocks words the AI might miss
│                            │  ~500 entries per language
└─────────────┬──────────────┘
              │ (if word not in stop-list)
              ▼
┌────────────────────────────┐
│ LAYER 4: Category Filter   │  Block certain AI-assigned categories entirely
│ (category blocklist)       │  Standard: weapons, alcohol, tobacco, adult, violence
│                            │  Strict: + insects, medical, scary
└─────────────┬──────────────┘
              │ (if category allowed)
              ▼
┌────────────────────────────┐
│ LAYER 5: Human Review Flag │  Low-confidence results (0.7–0.8) are flagged
│ (async, non-blocking)      │  for human review. Shown to child but logged.
│                            │  Parent notified if flagged.
└─────────────┬──────────────┘
              │
              ▼
         ✅ SAFE — Show vocab card to child
```

### 4.2 Stop-list management

```python
# data/stop_list_en.txt (excerpt)
# One word/phrase per line. Case-insensitive matching.
# Categories: weapons, substances, adult, violence, slurs
gun
pistol
rifle
knife
sword
dagger
bomb
grenade
beer
wine
vodka
whiskey
cigarette
cigar
marijuana
cocaine
# ... (~500 entries)

# data/stop_list_vi.txt (excerpt)
súng
dao
kiếm
rượu
bia
thuốc lá
ma túy
# ... (~500 entries)

# data/stop_list_zh.txt (excerpt)
枪
刀
剑
酒
烟
毒品
# ... (~500 entries)
```

### 4.3 Content filter sensitivity levels

Parents can choose between two filter levels:

| Filter level | Blocks | Use case |
|---|---|---|
| **Standard** (default) | Weapons, alcohol, tobacco, drugs, adult content, violence, hate symbols, gambling | Most families |
| **Strict** | All of Standard + insects, spiders, snakes, medical imagery (syringes, blood), skulls, anything potentially scary for young children | Sensitive families, younger children (5-7) |

### 4.4 Face detection

The AI prompt refuses to identify people as "vocabulary." But as an additional safety layer:

```python
async def check_for_faces(self, ai_result: VisionResult) -> bool:
    """
    Check if the AI identified a person or face.
    Uses the AI's own response — if it returns "person",
    "child", "face", etc., treat as blocked.
    """
    person_words = {"person", "child", "baby", "man", "woman", "boy", "girl", "face", "people"}
    if ai_result.object_en.lower() in person_words:
        return True  # Blocked
    return False
```

**POC approach:** Rely on AI prompt instructions + stop-list filtering for "person", "child", "face", etc. Dedicated face detection API adds latency and cost — defer to post-POC.

---

## 5. Rarity engine

### 5.1 Rarity calculation algorithm

Rarity is **dynamic**, not static. It combines two signals:

1. **Global capture frequency** — How many users have captured this word?
2. **Linguistic difficulty** — How hard is this word in the target languages?

The final rarity is the **higher** of the two (frequency-based vs. difficulty-based).

```python
class RarityEngine:
    RARITY_TIERS = {
        "common":    RarityTier(name="common",    points=10,  color="#94A3B8"),
        "uncommon":  RarityTier(name="uncommon",  points=25,  color="#22C55E"),
        "rare":      RarityTier(name="rare",      points=50,  color="#3B82F6"),
        "epic":      RarityTier(name="epic",      points=100, color="#A855F7"),
        "legendary": RarityTier(name="legendary", points=250, color="#F59E0B"),
    }

    # Frequency-based rarity thresholds
    # (what % of total users have captured this word)
    FREQUENCY_THRESHOLDS = {
        "common":    0.50,   # >50% of users have it
        "uncommon":  0.20,   # 20-50% of users
        "rare":      0.05,   # 5-20% of users
        "epic":      0.01,   # 1-5% of users
        "legendary": 0.0,    # <1% of users
    }

    # Difficulty-based rarity mapping
    DIFFICULTY_MAP = {
        1: "common",
        2: "uncommon",
        3: "rare",
        4: "epic",
        5: "legendary",
    }

    RARITY_ORDER = ["common", "uncommon", "rare", "epic", "legendary"]

    async def calculate(self, vocab_data: VisionResult) -> RarityTier:
        # 1. Frequency-based rarity
        freq_pct = await self._get_capture_frequency(vocab_data.object_en)
        freq_rarity = self._frequency_to_rarity(freq_pct)

        # 2. Difficulty-based rarity (use max difficulty across all languages)
        max_difficulty = max(vocab_data.difficulty_en, vocab_data.difficulty_vi, vocab_data.difficulty_zh)
        diff_rarity = self.DIFFICULTY_MAP[max_difficulty]

        # 3. Final rarity = whichever is HIGHER
        freq_idx = self.RARITY_ORDER.index(freq_rarity)
        diff_idx = self.RARITY_ORDER.index(diff_rarity)
        final = self.RARITY_ORDER[max(freq_idx, diff_idx)]

        return self.RARITY_TIERS[final]

    def _frequency_to_rarity(self, frequency_pct: float) -> str:
        if frequency_pct > 0.50:
            return "common"
        elif frequency_pct > 0.20:
            return "uncommon"
        elif frequency_pct > 0.05:
            return "rare"
        elif frequency_pct > 0.01:
            return "epic"
        else:
            return "legendary"
```

### 5.2 Bootstrap problem

With 0 users, every word has 0% capture frequency → everything is "Legendary." This is wrong.

**Solution: seed capture frequency from reference vocab difficulty ratings.**

```python
async def bootstrap_frequency(self):
    """
    On first deploy, seed Redis capture frequency with synthetic data
    based on reference vocab difficulty ratings.

    Common (difficulty 1) → simulate 80% capture rate
    Uncommon (difficulty 2) → simulate 30% capture rate
    Rare (difficulty 3) → simulate 10% capture rate
    Epic (difficulty 4) → simulate 3% capture rate
    Legendary (difficulty 5) → simulate 0.5% capture rate
    """
    SYNTHETIC_TOTAL_USERS = 100  # Assume 100 users for initial distribution

    ref_vocab = await self.repo.get_all_reference_vocab()
    for word in ref_vocab:
        avg_difficulty = (word.difficulty_en + word.difficulty_vi + word.difficulty_zh) / 3
        simulated_captures = int(SYNTHETIC_TOTAL_USERS * self._difficulty_to_rate(avg_difficulty))
        await self.redis.zadd("capture_frequency:global", {word.word_en.lower(): simulated_captures})

    await self.redis.set("stats:total_active_users", SYNTHETIC_TOTAL_USERS)
```

### 5.3 Category diversity bonus

The 5th animal captured is worth less than the 1st musical instrument. This encourages breadth.

```python
async def apply_diversity_modifier(self, child_id: UUID, vocab: CapturedVocab) -> int:
    """
    Reduce points if child has many captures in the same category.
    Bonus points if this is their first capture in a new category.
    """
    category_count = await self.repo.count_captures_in_category(child_id, vocab.category)

    if category_count == 0:
        # FIRST word in a new category! Bonus!
        return int(vocab.points_earned * 1.5)
    elif category_count < 5:
        return vocab.points_earned  # Normal
    elif category_count < 15:
        return int(vocab.points_earned * 0.8)  # Slight reduction
    else:
        return int(vocab.points_earned * 0.6)  # Diminishing returns
```

---

## 6. Reference vocab cache

### 6.1 Purpose and design

The reference vocab cache is a **verified vocabulary database** that serves two purposes:

1. **Fast path** — If the captured object matches a known word, skip the AI call entirely. Instant response, zero cost.
2. **Quality assurance** — Verified translations are guaranteed correct, unlike live AI outputs which may have errors.

### 6.2 Cache structure

```
PostgreSQL: reference_vocab table (~1,000+ rows)
  ├── Curated entries (200 at launch, human-verified)
  └── LLM-verified entries (grows over time, AI outputs reviewed and promoted)

Redis: Hot cache (for fastest lookup)
  ├── ref_vocab:en:{word} → full vocab JSON
  └── ref_vocab:vi:{word} → full vocab JSON
```

### 6.3 Cache lookup flow

```
Captured object identified by AI as "cat" →
  1. Redis lookup: ref_vocab:en:cat → HIT? Return cached data (50ms)
  2. PostgreSQL lookup: SELECT * FROM reference_vocab WHERE LOWER(word_en) = 'cat' → HIT? Cache in Redis + return
  3. MISS → Use live AI result, flag for human review if confidence < 0.85
```

### 6.4 Cache growth strategy

```
Phase 1 (Launch): 200 curated entries
  - Most common household objects (table, chair, cup, plate, ...)
  - School objects (book, pen, pencil, bag, ...)
  - Animals (cat, dog, fish, bird, ...)
  - Food (apple, rice, bread, ...)
  → Hand-verified by Vietnamese linguist

Phase 2 (Beta): +300 entries from AI
  - High-confidence AI outputs (confidence > 0.9) are logged
  - Weekly review: linguist verifies and promotes to reference cache
  → Growing organically from real user captures

Phase 3 (Post-beta): 1,000+ entries
  - Most common captures are now cached
  - AI calls only needed for unusual/rare objects
  - Estimated 60-70% of captures served from cache
  → Significant cost reduction
```

---

## 7. Duplicate detection

### 7.1 Perceptual hashing

Children will photograph the same object multiple times (their cat, their school bag, etc.). We use perceptual hashing to detect duplicates:

```python
class DedupService:
    HASH_THRESHOLD = 8  # Hamming distance threshold for "same object"

    async def find_duplicate(
        self, child_id: UUID, photo_hash: str
    ) -> CapturedVocab | None:
        """
        Check if this child has already captured the same visual object.
        Uses perceptual hash (pHash) with hamming distance comparison.
        """
        # Get all photo hashes for this child
        existing_hashes = await self.repo.get_child_photo_hashes(child_id)

        for existing in existing_hashes:
            distance = self._hamming_distance(photo_hash, existing.photo_hash)
            if distance <= self.HASH_THRESHOLD:
                return existing  # Duplicate found

        return None  # Novel capture

    def _hamming_distance(self, hash1: str, hash2: str) -> int:
        """Count differing bits between two hex hash strings."""
        h1 = int(hash1, 16)
        h2 = int(hash2, 16)
        return bin(h1 ^ h2).count('1')
```

### 7.2 Word-level dedup (in addition to visual)

Even if the photo is different, if the AI identifies the same word, it's a duplicate:

```python
# In capture_service.py, after AI identification:
existing_word = await self.repo.find_captured_vocab(
    child_id=child_id,
    word_en=ai_result.object_en,
    word_vi=ai_result.object_vi,
)
if existing_word:
    return await self._handle_duplicate(child_id, existing_word)
```

---

## 8. Cost optimization

### 8.1 Cost per capture

| Scenario | AI cost | Speech cost | Total |
|---|---|---|---|
| **Cache hit** (reference vocab) | $0 | $0 | ~$0 |
| **OpenAI GPT-4o** (live) | ~$0.01–0.03 | $0 | ~$0.02 |
| **OpenRouter fallback** (Gemini Flash) | ~$0.003–0.008 | $0 | ~$0.005 |
| **With pronunciation** (per attempt) | $0 | ~$0.006 (Whisper) | ~$0.006 |
| **With TTS** (per word, first time) | $0 | ~$0.015 (OpenAI TTS) | ~$0.015 |
| **With TTS** (cached) | $0 | $0 | ~$0 |

### 8.2 Monthly cost projection (100 beta users)

| Assumption | Value |
|---|---|
| Active users | 100 |
| Captures per user per day | 10 |
| Cache hit rate (month 1) | 30% |
| Cache hit rate (month 3) | 60% |
| Pronunciation attempts per capture | 1.5 avg |
| TTS plays per capture | 3 (EN + VI + ZH) |

| Cost item | Month 1 | Month 3 |
|---|---|---|
| OpenAI GPT-4o (vision) | $420 (21K calls × $0.02) | $240 (12K calls × $0.02) |
| OpenAI Whisper (ASR) | $27 (45K attempts × $0.006/min) | $27 |
| OpenAI TTS | $45 (first-time generation) | $15 (mostly cached) |
| **Total AI costs** | **~$492** | **~$282** |

### 8.3 Cost reduction roadmap

| Optimization | When | Impact |
|---|---|---|
| Reference cache for common words | Launch | -30% vision calls |
| TTS audio caching (local filesystem) | Launch | -90% TTS cost after warm-up |
| Grow reference cache from user captures | Month 2+ | -50% vision calls by month 3 |
| Switch primary to cheaper model via OpenRouter (Gemini Flash) | Month 3+ | -60% per-call cost |
| On-device image classifier (future) | v2 | -80% vision calls (only novel objects go to AI) |

---

## 9. Latency targets

| Operation | Target | Typical |
|---|---|---|
| Reference cache lookup | < 50ms | 10-30ms |
| OpenAI GPT-4o (vision) | < 4s | 2-4s |
| OpenRouter fallback (vision) | < 3s | 1-3s |
| OpenAI Whisper (pronunciation) | < 3s | 1-3s |
| OpenAI TTS (generation) | < 1s | 300-600ms |
| TTS (cached, local file) | < 10ms | 1-5ms |
| **Full capture flow (cache hit)** | **< 500ms** | **~200ms** |
| **Full capture flow (AI call)** | **< 4.5s** | **~3s** |
| **Pronunciation check** | **< 3.5s** | **~2s** |

**Local deployment note:** Since everything runs on the same machine, network latency between services is negligible (~0ms). The bottleneck is purely the external OpenAI/OpenRouter API call latency.

---

## 10. Testing strategy

### 10.1 Unit tests

```python
# tests/test_safety.py
async def test_stop_list_blocks_weapons():
    service = SafetyService()
    result = VisionResult(object_en="gun", category="weapons", confidence=0.95)
    assert not await service.is_safe(result)

async def test_low_confidence_blocked():
    service = SafetyService()
    result = VisionResult(object_en="cat", category="animals", confidence=0.5)
    assert not await service.is_safe(result)

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

# tests/test_rarity.py
async def test_common_word_rarity():
    engine = RarityEngine()
    # Simulate 80% capture rate + difficulty 1
    result = await engine.calculate(VisionResult(difficulty_en=1, difficulty_vi=1, difficulty_zh=1, object_en="chair"))
    assert result.name == "common"
```

### 10.2 Integration tests

- **Vision pipeline E2E:** Upload real photos → verify correct JSON structure from OpenAI GPT-4o
- **Pronunciation pipeline E2E:** Upload audio recordings → verify star ratings
- **Safety pipeline E2E:** Upload photos of inappropriate items → verify blocking
- **Reference cache:** Verify cache hit/miss behavior with known words

### 10.3 Test data

```
tests/fixtures/
├── images/
│   ├── cat.jpg          # Common animal
│   ├── telescope.jpg    # Rare object
│   ├── blurry.jpg       # Should trigger low confidence
│   ├── knife.jpg        # Should be blocked
│   └── multiple.jpg     # Multiple objects (should pick main one)
│
├── audio/
│   ├── cat_correct.webm    # Correct pronunciation (should match)
│   ├── cat_wrong.webm      # Wrong word entirely (should not match)
│   └── meo_correct.webm    # Vietnamese pronunciation
│
└── reference_vocab_test.csv  # Small test set (20 words)
```

---

## 11. Sprint-to-AI mapping

| Sprint | Weeks | AI deliverables |
|---|---|---|
| **1** | 1-2 | Vision prompt design + testing, OpenAI GPT-4o integration, OpenRouter fallback setup, basic safety filter (prompt-level + stop-list), reference vocab seed (200 words), capture endpoint returning structured JSON |
| **2** | 3-4 | OpenAI Whisper integration (EN + VI + ZH), ASR-as-judge exact match logic, OpenAI TTS integration, local filesystem TTS caching, pronunciation endpoint |
| **3** | 5-6 | Perceptual hash duplicate detection, rarity engine (frequency + difficulty), reference cache lookup optimization, category diversity modifier |
| **4** | 7-8 | Mission-aware capture context (e.g., "red objects" mission influences category matching), rarity rebalancing based on beta data |
| **5** | 9-10 | Content filter sensitivity levels (Standard/Strict), parent notification on flagged content, reference cache growth pipeline (auto-promote high-confidence AI results) |
| **6** | 11-12 | ASR threshold tuning on children's voice data, cost optimization (cache hit rate analysis), OpenRouter fallback model evaluation |

---

*This document should be read alongside [architecture.md](./architecture.md) and [backend.md](./backend.md).*
