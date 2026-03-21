## Context

SnapLearn's capture pipeline uses BAML to call GPT-4o for object recognition, returning a `VisionResult` with trilingual word translations, difficulty ratings, fun facts, example sentences, and a Vietnamese description (`description_vi`). Currently only the word translations and metadata flow through to the frontend — the description and enrichment fields are either dropped or ignored.

The backend already has ElevenLabs TTS (`eleven_v3`) integrated for word pronunciation. TTS audio is cached to filesystem (`tts_cache/{lang}/{hash}.mp3`) and pre-generated as a background task after capture.

**Current state:**
```
AI Vision → VisionResult
  ├── description_vi: "Ồ hay quá! ..."  → ❌ DROPPED in capture_service.py
  ├── description_en: ❌ doesn't exist in BAML type
  ├── description_zh: ❌ doesn't exist in BAML type
  ├── fun_fact_vi → ✅ stored in DB, ✅ in API response, ❌ not rendered in FE
  ├── example_sentence_* → ✅ stored, ✅ in API, ❌ not rendered in FE
  └── words → ✅ fully working

TTS Pre-generation (background task after capture):
  └── word_en, word_vi, word_zh → ElevenLabs → tts_cache/

Frontend RevealCard:
  ├── Word translations → ✅ displayed
  ├── Pronunciation practice → ✅ working
  ├── TTS playback → ✅ working (Audio(url) + Web Speech fallback)
  └── Description/fun fact/examples → ❌ not shown
```

**Target state:**
```
AI Vision → VisionResult
  ├── description_en: "Wow! A fluffy brown dog..."  → DB + API + FE
  ├── description_vi: "Ồ hay quá! Có một chú chó..." → DB + API + FE
  ├── description_zh: "哇！一只棕色的小狗..."       → DB + API + FE
  ├── fun_fact_vi → rendered in FE (lightbulb card)
  ├── example_sentence_* → rendered in FE (collapsible)
  └── words → unchanged

TTS Pre-generation (background task after capture):
  ├── word_en, word_vi, word_zh → ElevenLabs → tts_cache/
  └── description_en, description_vi, description_zh → ElevenLabs → tts_cache/  ← NEW

Frontend RevealCard:
  ├── Auto-narrate description_{target_lang} via ElevenLabs TTS on open ← NEW
  ├── Mascot speech bubble showing description_{target_lang} text ← NEW
  ├── Fun fact section (lightbulb icon) ← NEW
  ├── Example sentences (collapsible) ← NEW
  ├── Word translations → unchanged
  └── TTS playback → upgraded to fetch() streaming
```

## Goals / Non-Goals

**Goals:**
- Generate AI descriptions in all 3 languages (EN/VI/ZH) via BAML
- Persist descriptions in `CapturedVocab` and include in API response
- Pre-generate ElevenLabs TTS for descriptions during capture (background task)
- Auto-narrate `description_{target_language}` when RevealCard opens (ElevenLabs audio)
- Display description as a mascot speech bubble on RevealCard
- Surface `fun_fact_vi` and example sentences on RevealCard
- Upgrade frontend TTS playback to streaming fetch with loading state

**Non-Goals:**
- Changing the AI vision model or provider (still GPT-4o via BAML)
- Building a custom audio player UI (invisible playback is fine)
- Generating fun facts in all 3 languages (keep `fun_fact_vi` only for now)
- Streaming `MediaSource` playback (fetch + blob is sufficient)
- Modifying ElevenLabs backend streaming logic (it already works)
- Offline TTS (Web Speech API fallback already exists)

## Decisions

### D1: Generate descriptions in all 3 languages via BAML

**Decision**: Add `description_en` and `description_zh` fields to the BAML `VisionResult` class. Update the `IdentifyObject` and `IdentifyObjectFiltered` prompts to generate excited, child-friendly descriptions in all 3 languages.

**Rationale**: The app supports EN/VI/ZH. Vietnamese children learning English should hear "Wow! A fluffy brown dog lying on the floor!" in English, not Vietnamese. The AI already generates trilingual content (words, example sentences) — adding trilingual descriptions is consistent.

**Cost impact**: Minimal. The description fields add ~100-150 extra output tokens per vision call. At GPT-4o pricing (~$0.01/1K output tokens), this is ~$0.001 per capture.

### D2: Use ElevenLabs TTS for description narration (not Web Speech API)

**Decision**: Pre-generate ElevenLabs TTS audio for all 3 description variants during the capture background task. When the RevealCard opens, play the description in the child's target language using the pre-generated audio.

**Rationale**:
- **Consistent voice**: ElevenLabs provides the same high-quality voice across all devices. Web Speech API quality varies dramatically (especially for Vietnamese/Mandarin on different Android devices).
- **Mascot identity**: Using the same ElevenLabs voice for word pronunciation AND description narration creates a consistent "mascot voice" — crucial for engagement with 6-10 year olds.
- **Pre-generation**: Since descriptions are generated at capture time and cached, there's zero latency when the RevealCard opens. The audio is already waiting.
- **Cost**: Descriptions are short (20-60 chars). At ~$0.30/1K chars, generating 3 language variants costs ~$0.000036 per capture. With caching, this is a one-time cost per unique capture.

**Alternative considered**: Web Speech API for descriptions (free, instant) — rejected because inconsistent quality across devices undermines the mascot experience.

### D3: Description TTS uses same cache pattern as word TTS

**Decision**: Cache description audio at `tts_cache/{lang}/{hash}.mp3` using the same SHA-256 hash pattern. The `ensure_cached()` background task is extended to also pre-generate description audio.

**Rationale**: Reuses existing infrastructure. No new cache directories, no new cache management. The `tts_service.ensure_cached()` function just gets additional word parameters for description text.

**Alternative considered**: Separate cache directory for descriptions — rejected because descriptions are just text going through the same ElevenLabs pipeline. Keeping them in the same cache simplifies management.

### D4: Narrate description in the child's target language

**Decision**: When RevealCard opens, auto-play `description_{target_language}` where `target_language` comes from the game store's `target_language` setting (default: 'en'). The speech bubble text also shows in the target language.

**Rationale**: The primary learning value is hearing natural-language descriptions in the language being learned. Vietnamese children learning English benefit most from "Wow! A fluffy brown dog!" in English, followed by the English word pronunciation.

**Playback sequence**:
1. RevealCard opens → play `description_{target_lang}` TTS (ElevenLabs, 1-3 seconds)
2. After description ends → short pause (500ms)
3. Play target word TTS (ElevenLabs, existing behavior)

**Fallback**: If description TTS fails to load, skip to word TTS immediately. If word TTS also fails, fall back to Web Speech API (existing behavior).

### D5: Add new TTS endpoint for description audio

**Decision**: Add `GET /api/tts/description/{vocab_id}/{language}` to serve description audio separately from word audio. This keeps the existing `/api/tts/{vocab_id}/{language}` endpoint unchanged.

**Rationale**: Descriptions and words are different texts with different cache entries. Combining them into one endpoint would require a `type` parameter and complicate the API. Separate endpoints are clearer and cacheable independently.

**Alternative considered**: Return description TTS URLs in `CaptureResponse.tts_urls` alongside word URLs — this is also done (both approaches work together). The URL points to the new endpoint.

### D6: Frontend streaming TTS via fetch() + Blob

**Decision**: Replace `axios.get(url, {responseType: 'blob'})` in `speechApi.getTTSAudio()` with native `fetch()` + `ReadableStream` reader. Accumulate chunks into an `ArrayBuffer`, create a `Blob`, and return a Blob URL.

**Rationale**: `fetch()` provides `AbortController` support for component unmount cleanup, and the streaming reader pattern enables a loading indicator during download. Functionally equivalent to the current approach but with better error handling.

### D7: RevealCard enrichment layout

**Decision**: Add three new UI sections to RevealCard:
1. **Mascot speech bubble** (always visible when description exists): Rounded bubble with mascot avatar, showing `description_{target_lang}` text
2. **Fun fact** (below word translations): Lightbulb icon + `fun_fact_vi` text, always visible when present
3. **Example sentences** (collapsible, below fun fact): Flag icons + sentences in available languages

**Rationale**: Progressive disclosure. The speech bubble is the key engagement hook (always visible). Fun fact adds delight. Example sentences are supplementary (collapsed by default to avoid overwhelming 6-year-olds).

## Risks / Trade-offs

- **Description TTS pre-generation adds latency to background task** → Three additional ElevenLabs API calls per capture (~1-2s each). Mitigation: These run as background tasks and don't block the capture response. The user sees the RevealCard immediately; description audio is usually cached by the time they finish reading the speech bubble.

- **ElevenLabs rate limits with description TTS** → More API calls per capture (6 total: 3 words + 3 descriptions). Mitigation: ElevenLabs allows 100+ concurrent requests on paid plans. Background tasks are already async.

- **BAML prompt size increase** → Adding 2 more description fields increases output by ~100-150 tokens. Mitigation: Minimal cost impact. Latency impact is <200ms (GPT-4o is fast for short outputs).

- **Description quality in English and Mandarin** → GPT-4o generates excellent English descriptions but Mandarin quality may vary. Mitigation: Test with sample captures. The prompt explicitly asks for age-appropriate, excited language. Mandarin descriptions use simplified Chinese.

- **DB migration for 3 new columns** → Nullable columns, so migration is non-breaking and instant on PostgreSQL.

- **Existing records won't have descriptions** → Old vocab entries captured before this change have NULL descriptions. Mitigation: Frontend gracefully hides the speech bubble when descriptions are null. No visual regression.
