## ADDED Requirements

### Requirement: Collection overview
The system SHALL return a child's vocab collection summary via `GET /api/collection` with total word count and per-category breakdown.

#### Scenario: Child with captures
- **WHEN** a child has captured vocab across multiple categories
- **THEN** the system SHALL return `total_words` and a `categories` array where each entry has `name`, `icon`, `captured` count, `total` count, and `progress` float (0.0-1.0)

### Requirement: Category detail
The system SHALL return vocab cards for a specific category via `GET /api/collection/{category}`.

#### Scenario: Category with captures
- **WHEN** a child requests a category they have captures in
- **THEN** the system SHALL return the `category` name, `captured_words` array of VocabCard objects, and `undiscovered_count`

### Requirement: Vocab card detail
The system SHALL return full detail for a single vocab card via `GET /api/vocab/{vocab_id}` including mastery levels, evolution status, fun fact, and example sentences.

#### Scenario: Valid vocab request
- **WHEN** a child requests a vocab card they own
- **THEN** the system SHALL return the full VocabCard with all fields: translations, phonetics, mastery per language, evolved status, fun_fact_vi, example sentences, capture date, and last practiced date

#### Scenario: Vocab not owned by child
- **WHEN** a child requests a vocab card that belongs to another child
- **THEN** the system SHALL return HTTP 404
