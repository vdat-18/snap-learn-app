## ADDED Requirements

### Requirement: TTS audio generation via ElevenLabs
The system SHALL generate TTS audio using the ElevenLabs `eleven_v3` model via the `elevenlabs` Python SDK (`AsyncElevenLabs.text_to_speech.convert()`).

#### Scenario: Generate English TTS
- **WHEN** TTS is requested for an English word (e.g., "cat")
- **THEN** the system calls ElevenLabs `text_to_speech.convert()` with model `eleven_v3`, the configured voice ID, speed `0.85`, and returns MP3 audio bytes

#### Scenario: Generate Vietnamese TTS
- **WHEN** TTS is requested for a Vietnamese word (e.g., "con meo")
- **THEN** the system calls ElevenLabs with the same voice ID, speed `0.80`, and returns MP3 audio bytes

#### Scenario: Generate Mandarin TTS
- **WHEN** TTS is requested for a Mandarin word (e.g., "猫")
- **THEN** the system calls ElevenLabs with the same voice ID, speed `0.75`, and returns MP3 audio bytes

### Requirement: ElevenLabs client configuration
The system SHALL initialize an `AsyncElevenLabs` client using the `ELEVENLABS_API_KEY` environment variable. The voice ID SHALL be configurable via `ELEVENLABS_VOICE_ID` environment variable.

#### Scenario: Missing API key
- **WHEN** `ELEVENLABS_API_KEY` is not set and TTS is requested
- **THEN** the system raises a configuration error at startup or on first TTS call

#### Scenario: Configurable voice ID
- **WHEN** `ELEVENLABS_VOICE_ID` is set to a specific voice ID
- **THEN** all TTS calls use that voice ID regardless of language

### Requirement: TTS filesystem caching
The system SHALL cache generated TTS audio to the local filesystem at `tts_cache/{language}/{hash}.mp3`. Subsequent requests for the same word+language combination SHALL be served from cache without calling ElevenLabs.

#### Scenario: Cache miss — first generation
- **WHEN** TTS is requested for a word that has no cached file
- **THEN** the system calls ElevenLabs, saves the MP3 to `tts_cache/{lang}/{hash}.mp3`, and returns the audio bytes

#### Scenario: Cache hit — subsequent request
- **WHEN** TTS is requested for a word that already has a cached file
- **THEN** the system returns the cached file bytes without calling ElevenLabs

### Requirement: TTS output format
The system SHALL request MP3 format (`mp3_44100_128`) from ElevenLabs to maintain compatibility with the existing frontend audio playback and caching infrastructure.

#### Scenario: Audio format consistency
- **WHEN** ElevenLabs generates TTS audio
- **THEN** the output is MP3 format, consistent with the existing `/api/tts/{vocab_id}/{lang}` endpoint response

### Requirement: ASR model upgrade
The system SHALL use OpenAI `gpt-4o-transcribe` model (instead of `whisper-1`) for all pronunciation transcription via the `audio.transcriptions.create()` endpoint.

#### Scenario: English pronunciation transcription
- **WHEN** a child submits audio for English pronunciation judging
- **THEN** the system transcribes using `gpt-4o-transcribe` with `language="en"`

#### Scenario: Vietnamese pronunciation transcription
- **WHEN** a child submits audio for Vietnamese pronunciation judging
- **THEN** the system transcribes using `gpt-4o-transcribe` with `language="vi"`

#### Scenario: Mandarin pronunciation transcription
- **WHEN** a child submits audio for Mandarin pronunciation judging
- **THEN** the system transcribes using `gpt-4o-transcribe` with `language="zh"`

### Requirement: TTS pre-generation on capture
The system SHALL pre-generate TTS audio for all three languages (EN/VI/ZH) as an async background task after a successful capture, using ElevenLabs instead of OpenAI TTS.

#### Scenario: Successful capture triggers TTS pre-generation
- **WHEN** a new vocabulary word is captured successfully
- **THEN** the system asynchronously generates and caches TTS for `word_en`, `word_vi`, and `word_zh` via ElevenLabs
