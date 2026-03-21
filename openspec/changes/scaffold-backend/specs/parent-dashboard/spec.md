## ADDED Requirements

### Requirement: Parent gate challenge
The system SHALL generate a math challenge via `POST /api/parent-gate/challenge` — a simple arithmetic problem (e.g., "17 + 6 = ?") that a child aged 6-10 cannot easily solve.

#### Scenario: Challenge generation
- **WHEN** the parent gate endpoint is called
- **THEN** the system SHALL return a `challenge` string and `challenge_id` UUID. The challenge SHALL use operations (addition/subtraction/multiplication) with numbers requiring adult-level mental math.

### Requirement: Parent gate verification
The system SHALL verify the math answer via `POST /api/parent-gate/verify` and issue a short-lived parent token on success.

#### Scenario: Correct answer
- **WHEN** the correct integer answer is provided with a valid `challenge_id`
- **THEN** the system SHALL return `verified: true` and a `parent_token` (JWT with 5-minute TTL)

#### Scenario: Wrong answer
- **WHEN** an incorrect answer is provided
- **THEN** the system SHALL return `verified: false` with error code `PARENT_GATE_FAILED`

### Requirement: Parent dashboard stats
The system SHALL return comprehensive child stats via `GET /api/parent/dashboard` with query param `child_id`. Requires parent token (from gate verification).

#### Scenario: Dashboard data
- **WHEN** a parent requests the dashboard for a child
- **THEN** the system SHALL return: `overview` (words_total, streak, level, xp), `words_this_week`, `words_trend` (last 4 weeks), `language_breakdown`, `category_diversity`, `pronunciation_mastery` (counts per level 0-5 + evolved), `streak_info`, `mission_stats`

### Requirement: Activity feed
The system SHALL return the child's activity feed via `GET /api/parent/activity-feed` with pagination (`limit`, `offset`).

#### Scenario: Activity feed retrieval
- **WHEN** a parent requests the activity feed
- **THEN** the system SHALL return events from `activity_log` ordered by `created_at DESC`, each with `type` (capture, pronunciation, mission_complete, level_up, badge_earned, evolution) and `event_data`

### Requirement: Parental controls update
The system SHALL allow updating child settings via `PATCH /api/parent/controls` including `daily_time_limit_minutes`, `target_language`, `secondary_language`, `photo_storage_enabled`, `leaderboard_visibility`.

#### Scenario: Update time limit
- **WHEN** a parent sets `daily_time_limit_minutes: 15`
- **THEN** the child_profile record SHALL be updated and the updated profile returned

### Requirement: CSV export
The system SHALL export a child's vocab collection as CSV via `GET /api/parent/export` with query param `child_id`.

#### Scenario: Export download
- **WHEN** a parent requests export
- **THEN** the system SHALL return a CSV file with columns: word_en, word_vi, word_zh, pinyin, category, mastery_en, mastery_vi, mastery_zh, captured_at

### Requirement: Activity logging
The system SHALL log significant events to `activity_log` for the parent dashboard feed: capture, pronunciation, mission_complete, level_up, badge_earned, evolution.

#### Scenario: Capture logged
- **WHEN** a new vocab card is created
- **THEN** an `activity_log` entry SHALL be created with `event_type: "capture"` and `event_data` containing word_en, word_vi, word_zh, category, and rarity
