## Context

SnapLearn's mascot (owl) speaks ~35 pre-defined sentences to guide children through the app — navigation hints, congratulations, error messages, onboarding slides, etc. These sentences are defined in `voice_instructions.yml` and currently spoken via the browser's Web Speech API (`window.speechSynthesis`) in `feedbackUtils.ts::mascotSpeak()`.

**Current problems:**
1. **Quality**: Web Speech API voices sound robotic, especially for Vietnamese — the primary language. Chinese voices are often unavailable on mobile devices.
2. **Inconsistency**: Different devices/browsers produce different voices, rates, and quality. Some Android devices have no Vietnamese voice at all.
3. **Language gap**: Only Vietnamese sentences exist. The app teaches vocabulary in EN/VI/ZH but the mascot only speaks Vietnamese.
4. **Latency**: `speechSynthesis` has variable startup time (50-500ms) and can stall on mobile Safari.

**Existing infrastructure to leverage:**
- ElevenLabs TTS is already integrated (`speech_service.py`) with `eleven_v3` model, per-language speed settings, filesystem caching (`tts_cache/{lang}/`), and streaming support
- The FE already uses `mascotSpeak()` as a centralized entry point — all 7 components call this single function
- Docker volume `backend_tts_cache` already persists TTS audio across deployments

## Goals / Non-Goals

**Goals:**
- Pre-generate all mascot voice sentences in 3 languages (EN/VI/ZH) using ElevenLabs
- Store generated audio as MP3 files on the backend, served via a simple API
- Replace `window.speechSynthesis` with high-quality pre-generated audio playback on the FE
- Add English and Chinese translations to `voice_instructions.yml`
- Support template sentences with variables (e.g., `{childName}`, `{newLevel}`) via runtime TTS fallback

**Non-Goals:**
- Dynamic/user-generated mascot speech (that's a different feature)
- Changing the ElevenLabs voice ID or model — reuse existing configuration
- Real-time streaming for mascot audio — files are small (~30KB), full-fetch is fine
- Multilingual UI (the app UI stays Vietnamese; only mascot voice gets trilingual)
- Offline support / service worker caching of audio (future enhancement)

## Decisions

### 1. Storage: Extend existing `tts_cache/` with `mascot/` subdirectory

**Choice**: Store mascot audio at `tts_cache/mascot/{language}/{key}.mp3` where `key` is a hierarchical instruction identifier (e.g., `app_shell__0`, `login__2`).

**Rationale**: Reuses the existing `tts_cache/` Docker volume and cache infrastructure. Separating into `mascot/` prevents collision with dynamically-generated vocab TTS. Using meaningful keys (not SHA256 hashes) makes debugging and manual inspection easy.

**Alternative considered**: Store in a separate `mascot_audio/` directory — rejected because it would need a separate Docker volume and duplicates infrastructure.

### 2. Generation: Python CLI script using existing `synthesize_speech()`

**Choice**: Create `app/be/scripts/generate_mascot_audio.py` that:
1. Parses `voice_instructions.yml`
2. Skips template sentences containing `{variables}` (these need runtime generation)
3. Calls `synthesize_speech()` for each sentence × language
4. Stores results in `tts_cache/mascot/{lang}/{key}.mp3`

**Rationale**: Reuses the existing ElevenLabs client and caching logic. A standalone script can be run during deployment or manually. Template sentences (with `{childName}`, `{newLevel}`) cannot be pre-generated and will fall back to runtime TTS or Web Speech API.

**Alternative considered**: Admin API endpoint to trigger generation — added as secondary option but the script is simpler for CI/CD.

### 3. API: New endpoint pattern `GET /api/tts/mascot/{key}/{language}`

**Choice**: Add routes for serving mascot audio by instruction key and language:
- `GET /api/tts/mascot/{key}/{language}` — serve a specific audio file
- `GET /api/tts/mascot/manifest` — return JSON mapping of all available keys → URLs

**Rationale**: The manifest endpoint lets the FE know which keys have pre-generated audio available (vs. template sentences that need runtime TTS). The key-based lookup is simpler than the vocab TTS pattern (which needs DB lookups). No authentication required — mascot audio is the same for all users.

**Alternative considered**: Bundle audio files as static FE assets — rejected because it would bloat the FE bundle by 3-5MB and require rebuilds when audio changes.

### 4. FE Playback: Refactor `mascotSpeak()` to audio-first with Web Speech API fallback

**Choice**: Refactor `mascotSpeak()` to:
1. Look up the instruction key for the given text
2. If key exists in manifest and audio is available → fetch MP3 from `/api/tts/mascot/{key}/{lang}` and play via `Audio()` element
3. If not available (template sentence, network error) → fall back to existing `window.speechSynthesis`

**Rationale**: Zero changes needed in the 7 components that call `mascotSpeak()` — the function signature stays the same. The fallback ensures graceful degradation. Using `new Audio(url)` is simpler than `AudioContext` for pre-generated files.

### 5. Voice Instructions YAML: Trilingual structure with `vi`/`en`/`zh` keys

**Choice**: Restructure `voice_instructions.yml` from flat strings to trilingual objects:

```yaml
app_shell:
  - vi: "Kho báu của bạn ở đây nè!"
    en: "Your treasure is right here!"
    zh: "你的宝藏在这里！"
    key: "app_shell__0"
    context: "screen: Collection"
```

**Rationale**: Keeps all translations co-located for easy review. The `key` field provides a stable identifier for the API. The `context` field preserves the existing comments.

**Alternative considered**: Separate YAML files per language — rejected because it's harder to keep translations in sync and review side-by-side.

### 6. Language selection for mascot speech on FE

**Choice**: The FE mascot always speaks Vietnamese (the app's UI language) by default. The mascot language is not user-configurable in this change — it matches the app locale.

**Rationale**: The app targets Vietnamese children learning English and Chinese vocabulary. The mascot speaks Vietnamese to guide them. English/Chinese mascot audio is pre-generated for potential future use when the app supports locale switching.

## Risks / Trade-offs

- **[ElevenLabs rate limits]** → Batch generation of ~105 files (35 × 3 langs) may hit rate limits. **Mitigation**: Add retry with exponential backoff in the generation script; run during off-peak hours.
- **[Template sentences need runtime TTS]** → Sentences with `{childName}`, `{newLevel}` cannot be pre-generated. **Mitigation**: Fall back to existing Web Speech API for these (only 2-3 sentences affected). In the future, runtime ElevenLabs TTS could be added.
- **[Audio file freshness]** → If voice instructions change, audio must be regenerated. **Mitigation**: Script is idempotent — only generates missing files. CI/CD can run it on deploy.
- **[First-load latency]** → FE needs to fetch manifest + audio files. **Mitigation**: Manifest is tiny (~2KB JSON). Individual audio files are ~30KB each. Preload critical audio (splash, camera) on app start.
- **[Storage cost]** → ~105 MP3 files × ~30KB = ~3MB total. **Mitigation**: Negligible for backend storage. Docker volume already provisioned.
