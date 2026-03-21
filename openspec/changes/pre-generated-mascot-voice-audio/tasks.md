## 1. Trilingual Voice Instructions Data

- [x] 1.1 Restructure `voice_instructions.yml` from flat Vietnamese strings to trilingual format with `vi`, `en`, `zh`, `key`, and optional `context`/`template` fields
- [x] 1.2 Add English translations for all ~35 mascot sentences (random_motivational, app_shell, login, onboarding, reveal_card, quest, level_up, error_overlay)
- [x] 1.3 Add Mandarin Chinese translations for all ~35 mascot sentences
- [x] 1.4 Mark template sentences containing `{childName}` and `{newLevel}` with `template: true`
- [x] 1.5 Validate YAML structure — ensure every entry has all required fields and keys follow `{category}__{index}` format

## 2. Backend: Batch Audio Generation Script

- [x] 2.1 Create `app/be/scripts/generate_mascot_audio.py` with CLI argument parsing (`--force`, `--language`)
- [x] 2.2 Implement YAML parser to read `voice_instructions.yml` and extract non-template sentences
- [x] 2.3 Implement generation loop: for each sentence × language, call `synthesize_speech()` and save to `tts_cache/mascot/{language}/{key}.mp3`
- [x] 2.4 Add skip-if-exists logic (default) and `--force` flag for overwrite
- [x] 2.5 Add retry with exponential backoff for ElevenLabs API errors (max 3 retries)
- [x] 2.6 Add progress logging and summary report (generated/skipped/failed counts)
- [ ] 2.7 Test script locally — verify MP3 files are generated correctly in `tts_cache/mascot/` for all 3 languages

## 3. Backend: Mascot Audio API Endpoints

- [x] 3.1 Create `app/be/app/api/mascot_audio.py` router with `GET /api/tts/mascot/{key}/{language}` endpoint
- [x] 3.2 Implement file lookup from `tts_cache/mascot/{language}/{key}.mp3` — return MP3 with `Content-Type: audio/mpeg`
- [x] 3.3 Add validation: language must be `en`/`vi`/`zh`, return 400 otherwise; file not found returns 404
- [x] 3.4 Implement `GET /api/tts/mascot/manifest` endpoint — scan `tts_cache/mascot/` directory and return JSON mapping of available keys → URLs grouped by category
- [x] 3.5 Include a reverse text→key mapping in the manifest response (so FE can look up keys by sentence text)
- [x] 3.6 Register the new router in `app/be/app/main.py`
- [x] 3.7 Ensure both endpoints are unauthenticated (no `get_current_child` / `get_current_parent` dependency)
- [x] 3.8 Add cache headers (`Cache-Control: public, max-age=86400`) to mascot audio responses

## 4. Frontend: Manifest Loading & Caching

- [x] 4.1 Create `app/fe/src/services/mascotAudioApi.ts` with `fetchManifest()` function calling `GET /api/tts/mascot/manifest`
- [x] 4.2 Add module-level manifest cache and `textToKeyMap` (reverse lookup from sentence text → key) built from manifest response
- [x] 4.3 Call `fetchManifest()` during app initialization in `App.tsx` — store result in module cache
- [x] 4.4 Handle manifest fetch failure gracefully — log warning, set manifest to empty (all calls fall back to Web Speech API)

## 5. Frontend: Refactor `mascotSpeak()` for Audio-First Playback

- [x] 5.1 Refactor `mascotSpeak()` in `feedbackUtils.ts` — look up text in `textToKeyMap`, if found fetch MP3 from `/api/tts/mascot/{key}/{lang}` and play via `new Audio(url)`
- [x] 5.2 Keep existing Web Speech API logic as fallback when: text not in manifest, audio fetch fails, or manifest not loaded
- [x] 5.3 Implement `forceInterrupt` support — stop currently playing `Audio` element before starting new playback
- [x] 5.4 Update random motivational phrase logic — select random key from `random_motivational` category in manifest, play pre-generated audio
- [x] 5.5 Map FE language codes (`vi-VN` → `vi`, `en-US` → `en`, `zh-CN` → `zh`) for API requests

## 6. Frontend: Critical Audio Preloading

- [x] 6.1 After manifest loads, preload audio files for splash screen (`app_shell__6`), camera default (`app_shell__4`), and camera return (`app_shell__5`) using `new Audio(url).preload = 'auto'` or `link rel="prefetch"`
- [ ] 6.2 Test preloaded audio plays instantly without network delay on first trigger

## 7. Integration Testing & Validation

- [ ] 7.1 Run generation script and verify all expected MP3 files are created in `tts_cache/mascot/{en,vi,zh}/`
- [ ] 7.2 Test `GET /api/tts/mascot/manifest` returns correct structure with all keys
- [ ] 7.3 Test `GET /api/tts/mascot/{key}/{language}` returns valid MP3 audio
- [ ] 7.4 Test FE mascot speech plays pre-generated audio on screens: splash, camera navigation, collection, quest, login, onboarding slides, card reveal (legendary + epic), level up
- [ ] 7.5 Test FE fallback to Web Speech API for template sentences (`{childName}`, `{newLevel}`) and when BE is unreachable
- [ ] 7.6 Test `forceInterrupt` — rapid navigation between screens should cut off previous audio and play new one
- [ ] 7.7 Verify no regressions in existing vocab TTS playback (`/tts/{vocab_id}/{language}`)
