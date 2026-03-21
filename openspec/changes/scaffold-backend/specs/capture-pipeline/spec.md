## ADDED Requirements

### Requirement: Photo capture endpoint
The system SHALL accept photo captures via `POST /api/capture` with a base64-encoded image in the request body and `X-Child-Id` header identifying the child.

#### Scenario: Successful new capture
- **WHEN** a valid image is submitted and AI identifies the object with confidence ≥ 0.7
- **THEN** the system SHALL return HTTP 200 with `status: "new_capture"`, the full `vocab_card`, `xp_earned`, `total_xp`, optional `level_up`, optional `mission_update`, and `tts_urls` for all three languages

#### Scenario: Duplicate capture
- **WHEN** the image's perceptual hash matches an existing capture for this child
- **THEN** the system SHALL return `status: "duplicate"` with the existing vocab card and 25% XP

#### Scenario: Low confidence
- **WHEN** AI confidence is below 0.7
- **THEN** the system SHALL return `status: "low_confidence"` with `message_vi: "Hmm, mình chưa nhìn rõ lắm. Lại gần hơn nha!"`

### Requirement: Image validation and compression
The system SHALL validate uploaded images (max 5MB, JPEG/PNG formats) and compress them to max 1024px on the longest side before AI processing.

#### Scenario: Oversized image
- **WHEN** an image exceeds the size limit
- **THEN** the system SHALL return HTTP 422 with a validation error

#### Scenario: Image compression
- **WHEN** a valid image larger than 1024px is submitted
- **THEN** the system SHALL resize it to fit within 1024px before sending to AI vision

### Requirement: Capture orchestration pipeline
The system SHALL orchestrate the capture pipeline: image validation → perceptual hash → dedup check → AI vision (via existing BAML `vision_service`) → rarity classification (via existing BAML `rarity_service`) → save vocab card → update XP → check mission progress → pre-generate TTS.

#### Scenario: Full pipeline execution
- **WHEN** a non-duplicate image passes validation
- **THEN** the system SHALL execute all pipeline steps in order, with TTS pre-generation happening asynchronously (non-blocking)

### Requirement: Duplicate detection via perceptual hashing
The system SHALL compute a perceptual hash (pHash) for each captured image and check against the child's existing captures in the database.

#### Scenario: Matching hash found
- **WHEN** a new image's pHash matches an existing `captured_vocab.photo_hash` for the same child
- **THEN** the system SHALL treat it as a duplicate

### Requirement: Optional photo storage
The system SHALL save the original photo to the local filesystem at `{UPLOAD_DIR}/photos/{child_id}/{uuid}.jpg` only if the child's `photo_storage_enabled` setting is true.

#### Scenario: Storage enabled
- **WHEN** `photo_storage_enabled` is true for the child
- **THEN** the system SHALL save the photo and store the file path in `captured_vocab.photo_url`

#### Scenario: Storage disabled
- **WHEN** `photo_storage_enabled` is false
- **THEN** the system SHALL set `photo_url` to null

### Requirement: Vocab card creation with multi-language data
The system SHALL create a `captured_vocab` record storing English, Vietnamese, and Chinese translations, phonetics, pinyin, category, fun fact, example sentences, and confidence score — all returned by the AI vision service.

#### Scenario: All languages stored
- **WHEN** a new vocab card is created
- **THEN** the record SHALL contain `word_en`, `word_vi`, `word_zh`, `pinyin`, `phonetic_en`, `category`, `fun_fact_vi`, `example_sentence_en`, `example_sentence_vi`, `example_sentence_zh`, and `confidence`
