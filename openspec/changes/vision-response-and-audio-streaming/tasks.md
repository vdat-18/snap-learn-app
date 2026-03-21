## 1. BAML — Multilingual Descriptions

- [ ] 1.1 Add `description_en` and `description_zh` fields to `VisionResult` class in `app/be/baml_src/types.baml`
  - `description_en string @description("Friendly English sentence, 1-2 sentences max, excited tone")`
  - `description_zh string @description("Friendly Mandarin sentence, 1-2 sentences max, excited tone")`
- [ ] 1.2 Update `IdentifyObject` prompt in `app/be/baml_src/vision.baml` to generate descriptions in all 3 languages
  - Add examples for EN: "Wow! A fluffy brown dog lying on the floor!"
  - Add examples for ZH: "哇！地板上躺着一只毛茸茸的棕色小狗！"
  - Keep existing VI example
- [ ] 1.3 Update `IdentifyObjectFiltered` prompt in `app/be/baml_src/vision.baml` to also request 3 descriptions
- [ ] 1.4 Run `baml_cli generate` to regenerate `baml_client/` Python types

## 2. Database — Add Description Columns

- [ ] 2.1 Add `description_en`, `description_vi`, `description_zh` columns (nullable `String(500)`) to `CapturedVocab` model in `app/be/app/models/captured_vocab.py`
- [ ] 2.2 Create Alembic migration for the 3 new columns

## 3. Backend — Capture Pipeline

- [ ] 3.1 Add `description_en`, `description_vi`, `description_zh` to `VocabCardResponse` schema in `app/be/app/schemas/capture.py` (all `str | None = None`)
- [ ] 3.2 Add `description_tts_urls: TTSUrls | None = None` field to `CaptureResponse` schema
- [ ] 3.3 In `capture_service.py`, pass `description_en`, `description_vi`, `description_zh` from `vision_result` to `CapturedVocab` constructor (line ~177-194)
- [ ] 3.4 In `capture_service.py`, update `_vocab_to_response()` to include description fields in `VocabCardResponse`
- [ ] 3.5 In `capture_service.py`, build `description_tts_urls` (same pattern as word `tts_urls`) and include in `CaptureResponse`

## 4. Backend — Description TTS Endpoint & Pre-generation

- [ ] 4.1 Add `GET /api/tts/description/{vocab_id}/{language}` endpoint in `app/be/app/api/speech.py`
  - Same pattern as existing `/api/tts/{vocab_id}/{language}` but reads `description_{lang}` instead of `word_{lang}`
  - Cache hit → plain `Response`, cache miss → `StreamingResponse` via `synthesize_speech_stream()`
- [ ] 4.2 Add `get_description_urls(vocab_id)` helper in `tts_service.py` (returns `TTSUrls` with `/api/tts/description/...` paths)
- [ ] 4.3 Extend `tts_service.ensure_cached()` to accept optional `description_en`, `description_vi`, `description_zh` parameters and pre-generate TTS for them
- [ ] 4.4 Update the `asyncio.create_task(tts_service.ensure_cached(...))` call in `capture_service.py` to pass descriptions
- [ ] 4.5 Extend `tts_service.warm_cache()` to also regenerate description TTS

## 5. Frontend — Types & Store

- [ ] 5.1 Update `CaptureResponse.vocab_card` interface in `gameStore.ts` to include `description_en`, `description_vi`, `description_zh` (all `string | null`)
- [ ] 5.2 Add `description_tts_urls` to `CaptureResponse` interface (`{ en: string | null, vi: string | null, zh: string | null } | null`)
- [ ] 5.3 Update `CapturedWord` interface to include description fields for collection display

## 6. Frontend — Speech API Streaming

- [ ] 6.1 Refactor `speechApi.getTTSAudio()` to use `fetch()` + `ReadableStream` instead of Axios blob
  - Support `AbortSignal` parameter
  - Read stream chunks → accumulate into `ArrayBuffer` → create Blob URL
- [ ] 6.2 Add `speechApi.getDescriptionTTSAudio(vocabId, language, signal?)` function
  - Fetches from `/api/tts/description/{vocabId}/{language}`
  - Same streaming pattern as `getTTSAudio()`

## 7. Frontend — RevealCard UI & Auto-narration

- [ ] 7.1 Add `description_en`, `description_vi`, `description_zh`, `description_tts_urls`, `fun_fact_vi`, `example_sentence_en`, `example_sentence_vi`, `example_sentence_zh` to RevealCard props
- [ ] 7.2 Implement mascot speech bubble component (rounded bubble with colored background, speech-bubble tail)
  - Show `description_{target_language}` based on game store's `target_language` setting
  - Gracefully hide when description is null
- [ ] 7.3 Implement fun fact section (lightbulb icon + `fun_fact_vi` text, visible when present)
- [ ] 7.4 Implement example sentences section (collapsible, collapsed by default, flag icons per language)
- [ ] 7.5 Update `playTTSSequence()` to implement auto-narration:
  1. Try fetch description TTS from `/api/tts/description/{id}/{target_lang}`
  2. Play description audio (ElevenLabs)
  3. On end + 500ms pause → play word TTS (existing flow)
  4. Fallback: if description TTS fails, try `mascotSpeak()` via Web Speech API with 2s timeout, then word TTS
  5. If no description, skip straight to word TTS
- [ ] 7.6 Add loading state (pulsing animation on speaker button) while TTS is fetching
- [ ] 7.7 Pass new fields from `App.tsx` → `RevealCard` from the capture response

## 8. Cleanup & Abort Handling

- [ ] 8.1 Cancel any in-flight TTS fetch when RevealCard closes (AbortController cleanup in `useEffect` return)
- [ ] 8.2 Cancel `speechSynthesis` when RevealCard closes (already partially done, verify no regression)
- [ ] 8.3 Clean up Blob URLs via `URL.revokeObjectURL()` to prevent memory leaks

## 9. Verification

- [ ] 9.1 Run `baml_cli generate` and verify no BAML compilation errors
- [ ] 9.2 Run Alembic migration on dev database
- [ ] 9.3 Test capture flow end-to-end: capture photo → verify description fields in API response
- [ ] 9.4 Test description TTS endpoint: `GET /api/tts/description/{id}/en` returns valid MP3
- [ ] 9.5 Test RevealCard: opens → plays description audio (ElevenLabs) → plays word audio → displays speech bubble + fun fact
- [ ] 9.6 Test fallback: disable ElevenLabs → description falls back to Web Speech API → word TTS falls back
- [ ] 9.7 Test old records: open a pre-existing vocab card → no description bubble → word TTS plays normally
- [ ] 9.8 Test speaker button tap: only word TTS plays (no re-narration of description)
