## ADDED Requirements

### Requirement: BAML generates multilingual descriptions
The BAML `VisionResult` type SHALL include `description_en`, `description_vi`, and `description_zh` fields, and the vision prompts SHALL instruct the AI to generate an excited, child-friendly description sentence in each language.

#### Scenario: Vision returns all 3 descriptions
- **WHEN** the AI vision identifies a brown dog in the photo
- **THEN** `VisionResult` SHALL include:
  - `description_en`: "Wow! A fluffy brown dog lying on the floor!" (excited English)
  - `description_vi`: "Ồ hay quá! Có một chú chó lông nâu đang nằm trên sàn nhà kìa!" (excited Vietnamese)
  - `description_zh`: "哇！地板上躺着一只毛茸茸的棕色小狗！" (excited Mandarin)
- **AND** each description SHALL be 1-2 sentences, age-appropriate for 6-10 year olds

### Requirement: Backend persists multilingual descriptions
The system SHALL store `description_en`, `description_vi`, and `description_zh` from the BAML `VisionResult` in the `captured_vocab` table and include them in the `POST /capture` API response.

#### Scenario: New capture with descriptions
- **WHEN** a child captures a photo and the AI vision returns a `VisionResult` with all 3 description fields
- **THEN** the `captured_vocab` record SHALL have `description_en`, `description_vi`, `description_zh` set to those values
- **AND** the `CaptureResponse.vocab_card` SHALL include all 3 description fields

#### Scenario: Duplicate capture still returns descriptions
- **WHEN** a child captures a duplicate photo or word
- **THEN** the `CaptureResponse.vocab_card` SHALL include the original descriptions from the existing record

#### Scenario: Migration for existing records
- **WHEN** the migration runs on a database with existing `captured_vocab` rows
- **THEN** existing rows SHALL have `description_en = NULL`, `description_vi = NULL`, `description_zh = NULL` (columns are nullable)

### Requirement: RevealCard displays mascot description bubble
The frontend RevealCard SHALL display the description text (in the child's target language) in a mascot speech bubble when the field is present.

#### Scenario: Description available — shows target language
- **WHEN** the RevealCard opens after a successful capture with descriptions present
- **AND** the child's `target_language` is "en"
- **THEN** a speech bubble SHALL appear showing `description_en` text
- **AND** the bubble SHALL be styled as a mascot narration (rounded, colored background, speech-bubble tail)

#### Scenario: Description missing (old records)
- **WHEN** the RevealCard opens and all description fields are null or empty
- **THEN** the mascot bubble SHALL NOT be rendered
- **AND** the rest of the card SHALL display normally without layout shift

### Requirement: RevealCard displays fun fact
The frontend RevealCard SHALL display the `fun_fact_vi` field when present.

#### Scenario: Fun fact available
- **WHEN** the RevealCard opens and `fun_fact_vi` is present in the vocab card
- **THEN** a fun fact section SHALL appear below the word translations
- **AND** it SHALL show a lightbulb icon with the `fun_fact_vi` text

#### Scenario: Fun fact missing
- **WHEN** `fun_fact_vi` is null or empty
- **THEN** the fun fact section SHALL NOT be rendered

### Requirement: RevealCard displays example sentences
The frontend RevealCard SHALL display example sentences when present.

#### Scenario: Example sentences available
- **WHEN** the RevealCard opens and `example_sentence_en` and/or `example_sentence_vi` are present
- **THEN** an example sentences section SHALL appear showing each sentence with its language flag
- **AND** the section SHALL be collapsible (collapsed by default)

#### Scenario: No example sentences
- **WHEN** all example sentence fields are null or empty
- **THEN** the example sentences section SHALL NOT be rendered

### Requirement: Frontend CaptureResponse type includes all fields
The frontend `CaptureResponse` TypeScript type SHALL include `description_en`, `description_vi`, `description_zh`, `fun_fact_vi`, `example_sentence_en`, `example_sentence_vi`, and `example_sentence_zh` in the `vocab_card` object.

#### Scenario: Type matches backend schema
- **WHEN** the backend returns a `CaptureResponse` with all enrichment fields populated
- **THEN** the frontend TypeScript type SHALL accept and correctly type all fields as `string | null`
