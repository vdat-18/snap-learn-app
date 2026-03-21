## Why

The SnapLearn mascot currently speaks to children using the browser's Web Speech API (`window.speechSynthesis`), which produces robotic, inconsistent audio that varies across devices and browsers — especially poor for Vietnamese and Mandarin Chinese. The `voice_instructions.yml` defines ~35 pre-written mascot sentences used throughout the app (onboarding, login, card reveal, navigation, quests, errors). By pre-generating these as high-quality ElevenLabs audio files stored on the backend, every child hears the same warm, natural mascot voice regardless of device, with instant playback from cache and no runtime TTS latency.

Additionally, the app currently only has Vietnamese mascot sentences. English and Chinese translations are needed to match the trilingual vocabulary experience (EN/VI/ZH) the app already supports.

## What Changes

- **Add English and Chinese translations** to `voice_instructions.yml` — each Vietnamese sentence gets an `en` and `zh` counterpart
- **Create a CLI/script to batch-generate mascot audio** — reads `voice_instructions.yml`, calls ElevenLabs TTS for all sentences × 3 languages, stores MP3 files in `tts_cache/mascot/` on the backend
- **Add a new BE endpoint** `GET /api/tts/mascot/{key}/{language}` to serve pre-generated mascot audio by instruction key (e.g., `app_shell.0`, `login.2`) and language
- **Refactor FE `mascotSpeak()`** to fetch pre-generated audio from the backend endpoint instead of using `window.speechSynthesis`, with Web Speech API as fallback
- **Add a mascot voice manifest endpoint** `GET /api/tts/mascot/manifest` that returns the full mapping of instruction keys → audio URLs so the FE can preload critical audio on app start

## Capabilities

### New Capabilities
- `mascot-voice-generation`: Batch generation of mascot voice audio from `voice_instructions.yml` using ElevenLabs, stored in backend file cache, served via API
- `mascot-voice-playback`: Frontend playback system that fetches pre-generated mascot audio from BE, replacing Web Speech API with high-quality ElevenLabs audio

### Modified Capabilities

## Impact

- **Backend**: New API routes (`/api/tts/mascot/*`), new generation script, extended `tts_cache/` with `mascot/` subdirectory
- **Frontend**: `feedbackUtils.ts` (`mascotSpeak`) rewritten to use audio fetch + `AudioContext`/`<audio>` playback; all components using `mascotSpeak()` benefit automatically (App.tsx, LoginScreen, Onboarding, RevealCard, QuestScreen, LevelUpCelebration, ErrorOverlay)
- **Data**: `voice_instructions.yml` expanded with `en` and `zh` translations (~105 new sentences)
- **Dependencies**: No new dependencies — ElevenLabs SDK already integrated in BE
- **Infrastructure**: ~3-5 MB additional storage in `tts_cache/mascot/` Docker volume (35 sentences × 3 languages × ~30KB each)
