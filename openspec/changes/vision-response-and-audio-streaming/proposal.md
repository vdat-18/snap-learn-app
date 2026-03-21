## Why

The AI vision pipeline generates a rich `description_vi` field — a friendly, excited Vietnamese sentence describing what the child captured — but this field is **never persisted or sent to the frontend**. The existing change proposal already identified this gap. However, the app supports **three languages** (EN/VI/ZH), and a Vietnamese-only description limits the learning experience. Children learning English or Mandarin should hear an excited AI reaction **in their target language**, not just Vietnamese.

Additionally, using Web Speech API for narration produces inconsistent quality across devices — especially for Vietnamese and Mandarin. Since ElevenLabs TTS is already integrated on the backend with high-quality multilingual voice support (`eleven_v3`), the description narration should use ElevenLabs for a consistent, high-quality "mascot voice" experience on every device.

## What Changes

- **Multilingual AI descriptions**: Extend BAML `VisionResult` to generate `description_en`, `description_vi`, and `description_zh` — an excited reaction sentence in each language
- **Persist all descriptions**: Add `description_en`, `description_vi`, `description_zh` columns to `CapturedVocab` and flow them through the capture pipeline → API response → frontend
- **ElevenLabs narration on capture**: Pre-generate TTS audio for descriptions (alongside word TTS) during the capture background task. Auto-narrate the description in the child's target language when the RevealCard opens
- **Surface enrichment data**: Display `fun_fact_vi` and example sentences on the RevealCard (already in backend response, just not rendered)
- **Streaming TTS playback**: Replace `new Audio(url)` with `fetch()` + blob streaming for faster time-to-first-audio on cache misses

## Capabilities

### New Capabilities
- `vision-response-display`: Handle and display the full AI vision response (multilingual descriptions, fun_fact_vi, example sentences) on the RevealCard UI
- `tts-audio-streaming`: Frontend streaming audio playback for TTS endpoints, replacing buffered download with progressive chunk playback
- `description-tts-narration`: Pre-generate and auto-play ElevenLabs TTS for AI description narration on each capture, in the child's target language

### Modified Capabilities
- `elevenlabs-tts`: Extend TTS pre-generation to include description sentences (not just single words)

## Impact

- **BAML**: `types.baml` (add `description_en`, `description_zh` to `VisionResult`), `vision.baml` (update prompts to generate all 3 descriptions)
- **Backend**: `CapturedVocab` model (3 new columns), `capture.py` schema (add description fields), `capture_service.py` (pass descriptions through + pre-gen TTS for descriptions), DB migration
- **Frontend**: `RevealCard.tsx` (description bubble, fun fact, example sentences, auto-narrate via ElevenLabs), `gameStore.ts` (update `CaptureResponse` type), `speechApi.ts` (streaming fetch + description TTS endpoint), `App.tsx` (pass new fields)
- **APIs**: `POST /capture` response adds `description_en/vi/zh` to `vocab_card` + `tts_urls` gains description audio URLs; `GET /tts/{vocab_id}/{language}` unchanged
- **TTS Cost**: Descriptions are 20-60 chars each. With 3 languages × ~40 chars = ~120 chars per capture. At ElevenLabs pricing (~$0.30/1K chars), this adds ~$0.000036 per capture. With caching, recurring cost approaches zero.
- **Dependencies**: No new dependencies
