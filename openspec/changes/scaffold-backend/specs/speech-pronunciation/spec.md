## ADDED Requirements

### Requirement: Pronunciation judging endpoint
The system SHALL accept pronunciation attempts via `POST /api/pronounce` with `vocab_id`, `language` ('en' or 'vi'), and base64-encoded audio in the body. The `X-Child-Id` header identifies the child.

#### Scenario: Matching pronunciation (3 stars)
- **WHEN** the Whisper transcription matches the target word (case-insensitive)
- **THEN** the system SHALL return `stars: 3`, `match_type: "exact"`, the transcribed text, mastery_level, evolved status, and xp_earned (5 XP bonus)

#### Scenario: Non-matching pronunciation (1 star)
- **WHEN** the transcription does not match
- **THEN** the system SHALL return `stars: 1`, `match_type: "no_match"`, the transcribed text, and `xp_earned: 0`

### Requirement: Pronunciation uses existing BAML speech service
The system SHALL use the existing `speech_service.judge_pronunciation()` function for STT + feedback generation, and `game_service` for XP/mastery updates.

#### Scenario: Service integration
- **WHEN** a pronunciation attempt is processed
- **THEN** the system SHALL call `speech_service.judge_pronunciation()` for transcription + matching, then `game_service.on_pronunciation()` for game state updates

### Requirement: TTS audio serving
The system SHALL serve TTS audio files via `GET /api/tts/{vocab_id}/{language}` from the local filesystem cache.

#### Scenario: Cached TTS exists
- **WHEN** the requested TTS audio file exists in `{TTS_CACHE_DIR}/{language}/{hash}.mp3`
- **THEN** the system SHALL return the MP3 file with `Content-Type: audio/mpeg`

#### Scenario: Cache miss — generate on demand
- **WHEN** the TTS file does not exist in cache
- **THEN** the system SHALL generate it via `speech_service.synthesize_speech()`, cache it, and return the MP3

### Requirement: Audio validation
The system SHALL validate audio uploads: max 1MB (free) / 2MB (premium), WebM or WAV format, duration between 0.3s and 5s.

#### Scenario: Invalid audio format
- **WHEN** audio is not WebM or WAV
- **THEN** the system SHALL return HTTP 422
