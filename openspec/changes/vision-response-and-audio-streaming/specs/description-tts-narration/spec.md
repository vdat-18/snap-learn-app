## ADDED Requirements

### Requirement: Pre-generate description TTS during capture
The backend SHALL pre-generate ElevenLabs TTS audio for `description_en`, `description_vi`, and `description_zh` as part of the background TTS task that runs after each capture.

#### Scenario: New capture triggers description TTS pre-generation
- **WHEN** a new vocabulary card is captured and saved
- **THEN** the background task SHALL call `synthesize_speech()` for each of:
  - `description_en` (Language.En)
  - `description_vi` (Language.Vi)
  - `description_zh` (Language.Zh)
- **AND** the generated audio SHALL be cached at `tts_cache/{lang}/{hash}.mp3`
- **AND** the background task SHALL NOT block the capture response

#### Scenario: Description TTS pre-generation failure
- **WHEN** ElevenLabs TTS fails for a description (API error, timeout)
- **THEN** the failure SHALL be logged as a warning
- **AND** the rest of the TTS pre-generation SHALL continue (word TTS is independent)
- **AND** the frontend SHALL fall back to Web Speech API if cached audio is unavailable

### Requirement: Description TTS API endpoint
The backend SHALL expose `GET /api/tts/description/{vocab_id}/{language}` to serve pre-generated description TTS audio.

#### Scenario: Cache hit — instant response
- **WHEN** description TTS audio is cached for the requested vocab/language
- **THEN** the endpoint SHALL return the MP3 audio with `Content-Type: audio/mpeg`
- **AND** response time SHALL be < 10ms

#### Scenario: Cache miss — stream from ElevenLabs
- **WHEN** description TTS is not cached (e.g., pre-generation failed or old record)
- **THEN** the endpoint SHALL stream from ElevenLabs using `synthesize_speech_stream()`
- **AND** cache the result for future requests

#### Scenario: Invalid language
- **WHEN** the language parameter is not one of "en", "vi", "zh"
- **THEN** the endpoint SHALL return HTTP 400

#### Scenario: Vocab not found
- **WHEN** the vocab_id does not exist or doesn't belong to the requesting child
- **THEN** the endpoint SHALL return HTTP 404

### Requirement: CaptureResponse includes description TTS URLs
The `CaptureResponse` SHALL include TTS URLs for description audio alongside existing word TTS URLs.

#### Scenario: New capture response with description TTS URLs
- **WHEN** a new capture is successful
- **THEN** `CaptureResponse` SHALL include a `description_tts_urls` object with:
  - `en`: "/api/tts/description/{vocab_id}/en"
  - `vi`: "/api/tts/description/{vocab_id}/vi"
  - `zh`: "/api/tts/description/{vocab_id}/zh"

### Requirement: Auto-narrate description on RevealCard open
The frontend SHALL auto-play the description TTS audio in the child's target language when the RevealCard first opens after a capture.

#### Scenario: Full playback sequence with description
- **WHEN** the RevealCard opens with description fields present
- **AND** `description_tts_urls` is available
- **THEN** the playback sequence SHALL be:
  1. Fetch and play `description_{target_language}` TTS via ElevenLabs audio URL
  2. Wait for description audio to end + 500ms pause
  3. Play target word TTS via ElevenLabs (existing behavior)

#### Scenario: Description TTS unavailable — fallback to Web Speech
- **WHEN** the description TTS endpoint fails or times out (>3 seconds)
- **THEN** the system SHALL fall back to `mascotSpeak(description_{target_lang}, target_lang_code)` via Web Speech API
- **AND** then continue to word TTS as normal

#### Scenario: No description available — skip to word TTS
- **WHEN** the RevealCard opens without description fields (old capture)
- **THEN** the system SHALL play the target word TTS immediately (existing behavior)

#### Scenario: Manual speaker button tap — word only
- **WHEN** the user manually taps the speaker button on a word
- **THEN** ONLY the word TTS SHALL play (no description re-narration)

### Requirement: TTS cache warming includes descriptions
The `POST /api/tts/cache/refresh` admin endpoint SHALL also regenerate TTS for description fields when warming the cache.

#### Scenario: Cache refresh includes descriptions
- **WHEN** an admin triggers a cache refresh
- **THEN** the warm_cache function SHALL generate TTS for both words AND descriptions for all vocab entries
- **AND** the response SHALL include counts for both word and description TTS generation
