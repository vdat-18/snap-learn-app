## ADDED Requirements

### Requirement: Trilingual voice instructions data
The system SHALL maintain a `voice_instructions.yml` file containing all pre-defined mascot sentences with translations in Vietnamese (`vi`), English (`en`), and Mandarin Chinese (`zh`). Each instruction entry SHALL have a stable `key` identifier in the format `{category}__{index}` (e.g., `app_shell__0`, `login__2`). Template sentences containing variable placeholders (e.g., `{childName}`, `{newLevel}`) SHALL be marked with a `template: true` flag.

#### Scenario: YAML structure with trilingual entries
- **WHEN** the system reads `voice_instructions.yml`
- **THEN** each entry SHALL contain `vi`, `en`, `zh` text fields, a `key` field, and an optional `context` comment field

#### Scenario: Template sentences identified
- **WHEN** a sentence contains placeholder variables like `{childName}` or `{newLevel}`
- **THEN** the entry SHALL have `template: true` and the generation script SHALL skip it during batch generation

### Requirement: Batch audio generation script
The system SHALL provide a Python script (`app/be/scripts/generate_mascot_audio.py`) that reads `voice_instructions.yml`, generates MP3 audio for all non-template sentences across all 3 languages using ElevenLabs TTS, and stores the files in `tts_cache/mascot/{language}/{key}.mp3`.

#### Scenario: Generate all mascot audio
- **WHEN** the script is executed with no arguments
- **THEN** the system SHALL generate MP3 files for every non-template sentence in all 3 languages (EN/VI/ZH)
- **AND** store each file at `tts_cache/mascot/{language}/{key}.mp3`
- **AND** log progress and any failures

#### Scenario: Skip already-generated files
- **WHEN** the script is executed and a file at `tts_cache/mascot/{language}/{key}.mp3` already exists
- **THEN** the system SHALL skip generation for that file and log that it was skipped

#### Scenario: Force regeneration
- **WHEN** the script is executed with a `--force` flag
- **THEN** the system SHALL regenerate all files, overwriting existing ones

#### Scenario: Generate for specific language only
- **WHEN** the script is executed with `--language en` (or `vi` or `zh`)
- **THEN** the system SHALL only generate files for the specified language

#### Scenario: Handle ElevenLabs API errors gracefully
- **WHEN** the ElevenLabs API returns an error for a specific sentence
- **THEN** the system SHALL log the error, skip that sentence, and continue with the remaining sentences
- **AND** return a summary of successes and failures at the end

### Requirement: Mascot audio API endpoint
The system SHALL expose a `GET /api/tts/mascot/{key}/{language}` endpoint that serves pre-generated mascot audio files. This endpoint SHALL NOT require authentication since mascot audio is identical for all users.

#### Scenario: Serve cached mascot audio
- **WHEN** a GET request is made to `/api/tts/mascot/app_shell__0/vi`
- **AND** the file `tts_cache/mascot/vi/app_shell__0.mp3` exists
- **THEN** the system SHALL respond with HTTP 200, `Content-Type: audio/mpeg`, and the MP3 file contents

#### Scenario: Audio file not found
- **WHEN** a GET request is made to `/api/tts/mascot/{key}/{language}`
- **AND** the corresponding MP3 file does not exist
- **THEN** the system SHALL respond with HTTP 404

#### Scenario: Invalid language parameter
- **WHEN** a GET request is made with a language other than `en`, `vi`, or `zh`
- **THEN** the system SHALL respond with HTTP 400

### Requirement: Mascot audio manifest endpoint
The system SHALL expose a `GET /api/tts/mascot/manifest` endpoint that returns a JSON mapping of all available mascot audio keys to their API URLs, grouped by category. This endpoint SHALL NOT require authentication.

#### Scenario: Return full manifest
- **WHEN** a GET request is made to `/api/tts/mascot/manifest`
- **THEN** the system SHALL scan `tts_cache/mascot/` and return a JSON object with category-grouped entries listing available keys and their URLs for each language

#### Scenario: Manifest reflects actual files
- **WHEN** a mascot audio file is missing from the filesystem
- **THEN** the manifest SHALL NOT include that key/language combination
