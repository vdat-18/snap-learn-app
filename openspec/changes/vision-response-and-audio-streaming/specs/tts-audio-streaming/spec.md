## ADDED Requirements

### Requirement: Streaming TTS fetch with loading state
The frontend SHALL use `fetch()` with streaming response reading for TTS audio playback, replacing the current `new Audio(url)` pattern, and provide a loading indicator during download.

#### Scenario: Cache hit — instant playback
- **WHEN** the TTS endpoint returns audio immediately (cache hit, < 100ms)
- **THEN** audio playback SHALL begin within 200ms of the fetch starting
- **AND** no loading indicator SHALL be visible (too fast to notice)

#### Scenario: Cache miss — streaming fetch with loading state
- **WHEN** the TTS endpoint streams audio from ElevenLabs (cache miss, 500-1500ms)
- **THEN** a subtle loading indicator SHALL appear on the speaker button (pulsing animation)
- **AND** audio playback SHALL begin once the full response is received
- **AND** the loading indicator SHALL disappear when playback starts

#### Scenario: TTS fetch failure — fallback to Web Speech API
- **WHEN** the `fetch()` call to the TTS endpoint fails (network error, timeout, server error)
- **THEN** the system SHALL fall back to Web Speech API (`SpeechSynthesisUtterance`)
- **AND** the loading indicator SHALL disappear

### Requirement: Speech API service uses fetch for TTS
The `speechApi.getTTSAudio()` function SHALL use `fetch()` with `ReadableStream` to consume the TTS response, accumulate chunks into a Blob, and return a Blob URL for playback.

#### Scenario: Successful stream consumption
- **WHEN** `getTTSAudio(vocabId, language)` is called
- **THEN** it SHALL use `fetch()` (not Axios) to request the TTS endpoint
- **AND** it SHALL read the response body as a stream using `response.body.getReader()`
- **AND** it SHALL return a `string` (Blob URL) pointing to the accumulated audio

#### Scenario: Abort on component unmount
- **WHEN** the component calling `getTTSAudio()` unmounts before the fetch completes
- **THEN** the fetch SHALL be aborted via `AbortController`
- **AND** no audio SHALL play

### Requirement: New getDescriptionTTSAudio function
The `speechApi` service SHALL export a `getDescriptionTTSAudio(vocabId, language, signal?)` function for fetching description TTS audio.

#### Scenario: Fetch description TTS
- **WHEN** `getDescriptionTTSAudio(vocabId, 'en')` is called
- **THEN** it SHALL fetch from `/api/tts/description/{vocabId}/en`
- **AND** it SHALL return a Blob URL for the audio
- **AND** it SHALL support an optional `AbortSignal` parameter

### Requirement: TTS playback sequence with description narration
The RevealCard TTS playback sequence SHALL coordinate description narration and word pronunciation in order.

#### Scenario: Full sequence with description (ElevenLabs)
- **WHEN** RevealCard opens with description present and description TTS URLs available
- **THEN** the playback sequence SHALL be:
  1. Fetch description TTS audio via `getDescriptionTTSAudio()`
  2. Play description audio (ElevenLabs voice)
  3. Wait for audio to end + 500ms pause
  4. Play target word TTS via `getTTSAudio()` (existing ElevenLabs)

#### Scenario: Description TTS fails — fallback to Web Speech then continue
- **WHEN** description TTS fetch fails or times out
- **THEN** fall back to `mascotSpeak(description, targetLangCode)` via Web Speech API
- **AND** after 2-second timeout, continue to word TTS

#### Scenario: Word-only sequence without description
- **WHEN** RevealCard opens without description
- **THEN** the playback sequence SHALL immediately play the target word TTS

#### Scenario: Manual replay via speaker button
- **WHEN** the user taps the speaker button on a word
- **THEN** ONLY the word TTS SHALL play (no description re-narration)
- **AND** a loading indicator SHALL appear if the audio is still being fetched
