## ADDED Requirements

### Requirement: Create child profile
The system SHALL allow parents to create child profiles via `POST /api/children` with name, avatar_id, and target_language.

#### Scenario: Successful child creation
- **WHEN** a parent sends a valid request with `name`, `avatar_id`, and `target_language` ('en' or 'zh')
- **THEN** the system SHALL create a `child_profile` record linked to the parent, with defaults: `total_xp=0`, `level=1`, `current_streak=0`, `daily_time_limit_minutes=30`, `photo_storage_enabled=false`

### Requirement: Get child profile
The system SHALL return a child's profile with stats via `GET /api/children/{child_id}`.

#### Scenario: Parent requests own child
- **WHEN** an authenticated parent requests a child profile that belongs to them
- **THEN** the system SHALL return the full `ChildProfile` including XP, level, streak, and settings

#### Scenario: Parent requests another parent's child
- **WHEN** an authenticated parent requests a child that does not belong to them
- **THEN** the system SHALL return HTTP 403

### Requirement: Update child profile
The system SHALL allow parents to update child profiles via `PATCH /api/children/{child_id}` with optional fields: name, avatar_id, target_language, secondary_language.

#### Scenario: Partial update
- **WHEN** a parent sends a PATCH with only `target_language: "zh"`
- **THEN** the system SHALL update only that field and return the full updated profile
