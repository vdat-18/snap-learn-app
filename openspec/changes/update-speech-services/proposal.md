## Why

The current speech services use OpenAI Whisper (`whisper-1`) for ASR and OpenAI `tts-1` for TTS. The architecture doc already specifies `gpt-4o-transcribe` as the intended ASR model, and the product vision and frontend plan reference ElevenLabs for TTS. Aligning the code to these decisions improves transcription accuracy for children's multilingual speech (Vietnamese, English, Mandarin) and unlocks higher-quality, more natural voice synthesis — both critical for the core capture-and-pronounce loop targeting 6–10 year-olds.

## What Changes

- **ASR model swap**: Replace `whisper-1` with `gpt-4o-transcribe` in the speech service. Same OpenAI `audio.transcriptions.create()` endpoint — model name change only.
- **TTS provider swap**: Replace OpenAI `tts-1` (voice: `nova`) with ElevenLabs `eleven_v3` model. New SDK (`elevenlabs` Python package), new API shape (`text_to_speech.convert()`), new API key (`ELEVENLABS_API_KEY`).
- **TTS voice configuration**: Select and configure an ElevenLabs multilingual voice suitable for EN/VI/ZH with per-language speed settings (0.85/0.80/0.75).
- **Documentation updates**: Update `ai.md`, `architecture.md`, and cost projections to reflect the new providers and models.

## Capabilities

### New Capabilities
- `elevenlabs-tts`: ElevenLabs TTS integration using `eleven_v3` model with multilingual voice support (EN/VI/ZH), per-language speed control, and filesystem caching.

### Modified Capabilities
_(No existing specs to modify — this is the first spec-driven change.)_

## Impact

- **Code**: `app/be/app/services/speech_service.py` (ASR model name + TTS rewrite), `app/be/app/services/tts_service.py` (minor — wraps speech_service)
- **Dependencies**: New Python package `elevenlabs` in backend requirements
- **Environment**: New `ELEVENLABS_API_KEY` environment variable required; update `.env.example` and Docker Compose
- **Docs**: `_docs/ai.md` (provider tables, code examples, cost projections, sprint mapping), `_docs/architecture.md` (external AI services table)
- **Cost**: ElevenLabs charges per character (not per minute). For single vocabulary words (3–15 chars), cost per generation is very low. With filesystem caching, recurring cost approaches zero. ASR cost may change with `gpt-4o-transcribe` pricing vs `whisper-1`.
- **No breaking API changes**: Frontend endpoints (`/api/pronounce`, `/api/tts/{vocab_id}/{lang}`) remain identical. This is a backend-internal provider swap.
