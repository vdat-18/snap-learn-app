## ADDED Requirements

### Requirement: Capture route handler
The system SHALL expose `POST /api/capture` that accepts a `CaptureRequest` (base64 image), requires parent JWT auth and `X-Child-Id` header, enforces rate limits, and delegates to `capture_service.process_capture()`.

#### Scenario: Successful new capture
- **WHEN** an authenticated child submits a valid image within rate limits
- **THEN** the route SHALL return HTTP 200 with `CaptureResponse` containing `status`, `vocab_card`, `xp_earned`, `total_xp`, `level`, `level_up`, `mission_updates`, and `tts_urls`

#### Scenario: Rate limited
- **WHEN** the child has exceeded their daily capture limit
- **THEN** the route SHALL return HTTP 429 with error code `CAPTURE_RATE_LIMITED`

### Requirement: Pronunciation route handler
The system SHALL expose `POST /api/pronounce` that accepts a `PronounceRequest` (vocab_id, language, audio_base64), requires auth + child header, enforces pronunciation rate limits, calls `speech_service.judge_pronunciation()` and `game_service.on_pronunciation()`.

#### Scenario: Successful pronunciation attempt
- **WHEN** a valid audio submission is made for an owned vocab card
- **THEN** the route SHALL return HTTP 200 with `PronounceResponse` containing `stars`, `match_type`, `transcript`, `feedback_vi`, `mastery`, `evolved`, `xp_earned`, `total_xp`

#### Scenario: Vocab not owned by child
- **WHEN** the vocab_id does not belong to the authenticated child
- **THEN** the route SHALL return HTTP 404

### Requirement: TTS audio serving route
The system SHALL expose `GET /api/tts/{vocab_id}/{language}` that serves cached TTS audio as MP3. If not cached, it SHALL generate on demand via `speech_service.synthesize_speech()`.

#### Scenario: Cached audio exists
- **WHEN** the TTS file exists in the cache directory
- **THEN** the route SHALL return the MP3 file with `Content-Type: audio/mpeg`

#### Scenario: Cache miss
- **WHEN** the TTS file does not exist
- **THEN** the route SHALL generate it, cache it, and return the MP3 with `Content-Type: audio/mpeg`

### Requirement: Collection overview route
The system SHALL expose `GET /api/collection` that returns the child's total word count and per-category breakdown with progress percentages.

#### Scenario: Child with captures
- **WHEN** an authenticated child requests their collection
- **THEN** the route SHALL return `CollectionResponse` with `total_words` and `categories` (each with name, icon, captured count, total, progress)

### Requirement: Category detail route
The system SHALL expose `GET /api/collection/{category}` that returns all vocab cards in a specific category for the child.

#### Scenario: Valid category request
- **WHEN** a child requests a known category
- **THEN** the route SHALL return `CategoryDetailResponse` with `captured_words` array and `undiscovered_count`

### Requirement: Vocab detail route
The system SHALL expose `GET /api/vocab/{vocab_id}` that returns full detail for a single vocab card owned by the child.

#### Scenario: Valid vocab request
- **WHEN** a child requests a vocab card they own
- **THEN** the route SHALL return `VocabDetailResponse` with all fields including mastery levels, evolution status, fun fact, and example sentences

#### Scenario: Vocab not owned
- **WHEN** a child requests a vocab card belonging to another child
- **THEN** the route SHALL return HTTP 404

### Requirement: Missions list route
The system SHALL expose `GET /api/missions` that returns active missions grouped by type (daily, weekly, category_challenges). If no daily missions exist for today, it SHALL trigger generation via `mission_service.generate_daily_missions()`.

#### Scenario: Missions returned
- **WHEN** an authenticated child requests missions
- **THEN** the route SHALL return `MissionsListResponse` with `daily`, `weekly`, and `category_challenges` arrays

### Requirement: Mission claim route
The system SHALL expose `POST /api/missions/{mission_id}/claim` that claims a completed mission, awards XP, and optionally awards a badge.

#### Scenario: Successful claim
- **WHEN** a child claims a mission with status "completed"
- **THEN** the route SHALL return `MissionClaimResponse` with `xp_earned`, `total_xp`, `level`, `level_up`

#### Scenario: Mission not claimable
- **WHEN** the mission is still active, already claimed, or expired
- **THEN** the route SHALL return HTTP 400

### Requirement: Leaderboard route
The system SHALL expose `GET /api/leaderboard/{scope}` where scope is "global", "class", or "friends", with optional `limit` query parameter (default 50).

#### Scenario: Leaderboard returned
- **WHEN** an authenticated child requests the global leaderboard
- **THEN** the route SHALL return `LeaderboardResponse` with ranked entries, `my_rank`, `my_score`, and `reset_date`

### Requirement: Profile route
The system SHALL expose `GET /api/profile` that returns the child's profile including badges and stats.

#### Scenario: Profile returned
- **WHEN** an authenticated child requests their profile
- **THEN** the route SHALL return `ProfileResponse` with child info, `level_name`, `badges` array, and `stats` (total_words, total_categories, words_this_week, etc.)

### Requirement: Parent gate challenge route
The system SHALL expose `POST /api/parent-gate/challenge` that generates a math problem (addition/subtraction/multiplication with numbers 10-99) and returns a `challenge` string and `challenge_id`.

#### Scenario: Challenge generated
- **WHEN** the endpoint is called (no auth required)
- **THEN** the route SHALL return a challenge string (e.g., "47 + 28 = ?") and a UUID challenge_id. The answer SHALL be stored in Redis with 2-minute TTL.

### Requirement: Parent gate verify route
The system SHALL expose `POST /api/parent-gate/verify` that checks the answer and returns a short-lived parent gate JWT on success.

#### Scenario: Correct answer
- **WHEN** the correct integer answer is provided with a valid challenge_id
- **THEN** the route SHALL return `verified: true` and a `parent_token` JWT with 5-minute TTL and `type: "parent_gate"`

#### Scenario: Wrong answer
- **WHEN** an incorrect answer is provided
- **THEN** the route SHALL return `verified: false` and error code `PARENT_GATE_FAILED`

### Requirement: Parent dashboard route
The system SHALL expose `GET /api/parent/dashboard?child_id=UUID` that returns comprehensive stats for a child. Requires parent gate token.

#### Scenario: Dashboard returned
- **WHEN** a parent with a valid gate token requests the dashboard
- **THEN** the route SHALL return `DashboardResponse` with overview, words_this_week, words_trend, language_breakdown, category_diversity, pronunciation_mastery, streak_info, and mission_stats

### Requirement: Activity feed route
The system SHALL expose `GET /api/parent/activity-feed?child_id=UUID&limit=50&offset=0` with pagination.

#### Scenario: Feed returned
- **WHEN** a parent requests the activity feed
- **THEN** the route SHALL return `ActivityFeedResponse` with events array, total count, limit, and offset

### Requirement: Parental controls route
The system SHALL expose `PATCH /api/parent/controls` that updates child settings (time limit, language, photo storage, leaderboard visibility).

#### Scenario: Controls updated
- **WHEN** a parent sends a partial update
- **THEN** the route SHALL update only the provided fields on `child_profile` and return the updated child profile

### Requirement: CSV export route
The system SHALL expose `GET /api/parent/export?child_id=UUID` that returns a CSV file with the child's vocab collection.

#### Scenario: CSV download
- **WHEN** a parent requests export
- **THEN** the route SHALL return a `StreamingResponse` with `Content-Type: text/csv` containing columns: word_en, word_vi, word_zh, pinyin, category, mastery_en, mastery_vi, mastery_zh, captured_at

### Requirement: Root router aggregation
The system SHALL define `app/api/router.py` that includes all 11 sub-routers (auth, children, capture, speech, collection, missions, leaderboard, profile, parent_gate, parent) with appropriate path prefixes and OpenAPI tags.

#### Scenario: All routes registered
- **WHEN** the application starts
- **THEN** all endpoints SHALL be accessible under their respective `/api/{domain}` paths
