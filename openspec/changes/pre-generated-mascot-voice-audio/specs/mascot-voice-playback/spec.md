## ADDED Requirements

### Requirement: Mascot audio playback via pre-generated files
The `mascotSpeak()` function SHALL attempt to play pre-generated audio from the backend API before falling back to Web Speech API. The function signature SHALL remain backward-compatible so existing component call sites require no changes.

#### Scenario: Play pre-generated audio for known sentence
- **WHEN** `mascotSpeak("Kho báu của bạn ở đây nè!", 'vi-VN')` is called
- **AND** the manifest contains a matching key for this text
- **THEN** the system SHALL fetch the MP3 from `/api/tts/mascot/{key}/vi` and play it via an `Audio` element
- **AND** the mascot UI state SHALL be set to `talking`

#### Scenario: Fall back to Web Speech API for template sentences
- **WHEN** `mascotSpeak("Xin chào Bé Na! Chúng mình cùng bắt đầu khám phá nào!")` is called
- **AND** the text does not match any pre-generated audio key (because it contains interpolated variables)
- **THEN** the system SHALL fall back to `window.speechSynthesis` for playback

#### Scenario: Fall back to Web Speech API on network error
- **WHEN** `mascotSpeak()` attempts to fetch mascot audio from the API
- **AND** the network request fails (timeout, offline, server error)
- **THEN** the system SHALL fall back to `window.speechSynthesis` for playback
- **AND** log the error for debugging

#### Scenario: Random motivational phrase playback
- **WHEN** `mascotSpeak()` is called with no text argument
- **THEN** the system SHALL select a random phrase from the `random_motivational` category
- **AND** play the pre-generated audio for that phrase

#### Scenario: Force interrupt existing playback
- **WHEN** `mascotSpeak(text, lang, true)` is called with `forceInterrupt = true`
- **AND** audio is currently playing
- **THEN** the system SHALL stop the current audio and begin playing the new audio immediately

### Requirement: Manifest preloading on app start
The frontend SHALL fetch the mascot audio manifest from `/api/tts/mascot/manifest` during app initialization and cache it in memory for the duration of the session.

#### Scenario: Manifest loaded on app mount
- **WHEN** the app component mounts
- **THEN** the system SHALL fetch the manifest from `/api/tts/mascot/manifest`
- **AND** store the key-to-URL mapping in a module-level cache

#### Scenario: Manifest fetch failure
- **WHEN** the manifest fetch fails (network error, server error)
- **THEN** the system SHALL log a warning and continue operating with Web Speech API fallback for all mascot speech

### Requirement: Text-to-key lookup mapping
The frontend SHALL maintain a reverse lookup from sentence text to instruction key, built from the manifest data, enabling `mascotSpeak()` to find the correct audio file for any given text string.

#### Scenario: Exact text match finds key
- **WHEN** `mascotSpeak("Tìm từ mới bằng camera ngay nha!")` is called
- **AND** the manifest contains this exact text mapped to key `app_shell__4`
- **THEN** the system SHALL resolve the key and fetch audio from `/api/tts/mascot/app_shell__4/vi`

#### Scenario: No match found for text
- **WHEN** `mascotSpeak()` is called with text not in the manifest
- **THEN** the system SHALL fall back to Web Speech API

### Requirement: Critical audio preloading
The frontend SHALL preload audio files for the most frequently used mascot sentences (splash screen, camera screen defaults) during app initialization to ensure instant playback.

#### Scenario: Preload splash and camera audio
- **WHEN** the manifest is loaded successfully
- **THEN** the system SHALL preload audio for `app_shell__6` (splash), `app_shell__4` (camera default), and `app_shell__5` (camera return) into browser cache via prefetch
