## 1. Dependencies & Configuration

- [x] 1.1 Add `elevenlabs` Python package to backend requirements (`requirements.txt` / `pyproject.toml`)
- [x] 1.2 Add `ELEVENLABS_API_KEY` and `ELEVENLABS_VOICE_ID` to `.env.example` and environment configuration (`app/be/app/config.py` or Settings model)
- [x] 1.3 Update Docker Compose `env_file` / environment section to pass through ElevenLabs env vars to backend container

## 2. ASR Model Swap

- [x] 2.1 In `app/be/app/services/speech_service.py`, change `model="whisper-1"` to `model="gpt-4o-transcribe"` in `transcribe_audio()`
- [x] 2.2 Verify the `audio.transcriptions.create()` call still works with `gpt-4o-transcribe` (same endpoint, same parameters: `language`, `response_format`, `file`)

## 3. TTS Provider Swap — ElevenLabs Integration

- [x] 3.1 In `speech_service.py`, replace OpenAI TTS imports and client with `AsyncElevenLabs` client initialization (using `ELEVENLABS_API_KEY` env var)
- [x] 3.2 Rewrite `synthesize_speech()` to call `elevenlabs.text_to_speech.convert()` with model `eleven_v3`, configured voice ID, per-language speed settings (EN=0.85, VI=0.80, ZH=0.75), and `mp3_44100_128` output format
- [x] 3.3 Keep the existing filesystem caching logic intact — same `tts_cache/{lang}/{hash}.mp3` pattern, just swap the generation call
- [x] 3.4 Update TTS constants at top of `speech_service.py`: replace `TTS_MODEL`, `TTS_VOICE` with ElevenLabs equivalents (`ELEVENLABS_MODEL`, `ELEVENLABS_VOICE_ID`)

## 4. TTS Pre-generation

- [x] 4.1 Verify `tts_service.ensure_cached()` still works with the updated `synthesize_speech()` — it calls `speech_service.synthesize_speech()` internally, so the swap should be transparent
- [x] 4.2 Ensure the `capture_service.py` background task (`asyncio.create_task(tts_service.ensure_cached(...))`) works correctly with the async ElevenLabs client

## 5. Documentation Updates

- [x] 5.1 Update `_docs/ai.md` — replace all Whisper/OpenAI TTS references with `gpt-4o-transcribe` and ElevenLabs (`eleven_v3`): provider tables (§4.1, §4.2), code examples (§3.3, TTSService, SpeechService), cost projections (§5), latency targets (§6), sprint mapping (§8)
- [x] 5.2 Update `_docs/architecture.md` — update external AI services table (§2.5) to show `gpt-4o-transcribe` for ASR and ElevenLabs for TTS, update deployment diagram (§9.1) to show ElevenLabs as external service

## 6. Verification

- [x] 6.1 Run existing pronunciation unit tests to verify ASR model swap doesn't break matching logic
- [ ] 6.2 Manual test: generate TTS for a sample word in each language (EN/VI/ZH) via ElevenLabs and verify MP3 output plays correctly
- [ ] 6.3 Manual test: submit a pronunciation attempt via `/api/pronounce` and verify `gpt-4o-transcribe` returns a valid transcription
- [ ] 6.4 Clear `tts_cache/` directory and verify cache repopulates correctly with ElevenLabs-generated audio
