## Context

SnapLearn's speech services handle two responsibilities: ASR (pronunciation judging via the "ASR-as-judge" pattern) and TTS (vocabulary word playback in EN/VI/ZH). Currently both use OpenAI — `whisper-1` for ASR and `tts-1` with `nova` voice for TTS.

The architecture doc already specifies `gpt-4o-transcribe` as the ASR model. The product vision and frontend plan reference ElevenLabs for TTS. The code hasn't caught up. This change aligns the implementation to those decisions.

**Current state:**
- `speech_service.py` — contains both ASR (`transcribe_audio()`) and TTS (`synthesize_speech()`) functions
- `tts_service.py` — thin wrapper for TTS pre-generation and URL resolution
- TTS caching — filesystem-based (`tts_cache/{lang}/{hash}.mp3`) with Redis key tracking
- Single provider dependency: `openai` Python SDK
- Single API key: `OPENAI_API_KEY`

## Goals / Non-Goals

**Goals:**
- Replace ASR model `whisper-1` with `gpt-4o-transcribe` for better multilingual transcription accuracy
- Replace TTS provider from OpenAI `tts-1` to ElevenLabs `eleven_v3` for higher-quality voice synthesis
- Maintain the existing filesystem TTS caching strategy (works identically with ElevenLabs MP3 output)
- Keep all external API contracts unchanged (`/api/pronounce`, `/api/tts/{vocab_id}/{lang}`)
- Add `ELEVENLABS_API_KEY` as a new environment variable

**Non-Goals:**
- Changing the pronunciation matching logic (exact match stays)
- Adding ElevenLabs streaming/WebSocket support (not needed — we cache single words)
- Changing the BAML-orchestrated pronunciation feedback (`GeneratePronunciationFeedback`) — that's an LLM call, unaffected
- Migrating existing TTS cache files (new provider generates fresh cache; old files can be purged)
- Adding TTS fallback chains (ElevenLabs → OpenAI fallback is out of scope for now)

## Decisions

### Decision 1: ASR — `gpt-4o-transcribe` via same OpenAI endpoint

**Choice:** Swap model name from `"whisper-1"` to `"gpt-4o-transcribe"` in `transcribe_audio()`.

**Rationale:** `gpt-4o-transcribe` uses the identical `audio.transcriptions.create()` API. It's a one-line change. The model offers better accuracy for non-English languages and children's speech patterns — directly addressing the #1 risk in the product vision (§8: "Vietnamese children's speech patterns cause ASR to fail frequently").

**Alternatives considered:**
- Google Cloud STT (per-language, as in product vision §3.2) — more complex (3 providers), higher integration cost, marginal benefit for POC
- Azure STT — same trade-off as Google; adds a new provider for no clear POC benefit

### Decision 2: TTS — ElevenLabs `eleven_v3` model

**Choice:** Replace OpenAI TTS with ElevenLabs `eleven_v3` via the `elevenlabs` Python SDK (`AsyncElevenLabs.text_to_speech.convert()`).

**Rationale:** `eleven_v3` supports 70+ languages (including Vietnamese and Mandarin), offers higher voice naturalness, and the product vision already names ElevenLabs as the TTS provider for English. The `eleven_v3` model prioritizes quality over latency — acceptable because TTS output is cached to filesystem after first generation.

**Alternatives considered:**
- `eleven_flash_v2_5` — lower latency but fewer languages (32). Since we cache aggressively, latency is less important than quality and language coverage
- Keep OpenAI `tts-1` — works but lower quality, especially for Vietnamese
- Google Cloud TTS WaveNet — high quality but adds another provider and API key

### Decision 3: Voice selection — single multilingual voice

**Choice:** Use a single ElevenLabs multilingual voice for all three languages, configured via a `ELEVENLABS_VOICE_ID` environment variable. Default to a suitable built-in multilingual voice.

**Rationale:** Simplifies configuration. ElevenLabs multilingual voices handle EN/VI/ZH from a single voice ID. Per-language speed adjustment (0.85/0.80/0.75) is passed via the `speed` parameter in voice settings.

**Fallback:** If a single voice doesn't perform well across all three languages during testing, we can switch to per-language voice IDs via config without code changes.

### Decision 4: Async client pattern

**Choice:** Use `AsyncElevenLabs` client, consistent with the existing async architecture. Initialize once at module level or via dependency injection, similar to the existing `openai.AsyncOpenAI` pattern.

### Decision 5: Cache invalidation on provider switch

**Choice:** Clear the existing `tts_cache/` directory on deployment. New ElevenLabs-generated audio will repopulate the cache organically. No migration of old OpenAI TTS files.

**Rationale:** TTS cache is a performance optimization, not persistent data. Clearing it is safe and avoids mixing audio from different providers.

## Risks / Trade-offs

- **ElevenLabs API availability** → No fallback TTS provider in this change. If ElevenLabs is down, TTS generation fails (but cached audio still works). Mitigation: the filesystem cache means most words are served locally after first generation. A TTS fallback chain can be added later if needed.

- **Voice quality for Vietnamese and Mandarin** → ElevenLabs multilingual voices are primarily optimized for European languages. Vietnamese tones and Mandarin tones may not be perfect. Mitigation: test with target vocabulary before beta launch; `ELEVENLABS_VOICE_ID` is configurable to swap voices without code changes.

- **Cost model change** → ElevenLabs charges per character, OpenAI TTS charges per character too but at different rates. For single vocabulary words (3–15 chars) with aggressive caching, the cost impact should be minimal. Mitigation: monitor ElevenLabs usage dashboard during beta.

- **`gpt-4o-transcribe` pricing** → May cost more per minute than `whisper-1`. Mitigation: pronunciation attempts are short (0.3–5 seconds), so per-call cost stays low. Monitor OpenAI billing.

- **New dependency** → Adding `elevenlabs` Python package to backend. Mitigation: it's a well-maintained official SDK from ElevenLabs with async support.
