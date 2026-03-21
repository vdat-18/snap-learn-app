## ADDED Requirements

### Requirement: Add points to leaderboard
The system SHALL increment a child's score in the Redis sorted set `leaderboard:global:{period}` (e.g., `leaderboard:global:2026-03`) whenever XP is earned. If the child belongs to a class, their class leaderboard SHALL also be updated.

#### Scenario: Points added
- **WHEN** a child earns 50 XP
- **THEN** the system SHALL `ZINCRBY` the global sorted set by 50 for that child_id, and the class sorted set if applicable

### Requirement: Get leaderboard rankings
The system SHALL return rankings via `GET /api/leaderboard/{scope}` where scope is `"global"`, `"class"`, or `"friends"`. Returns top N entries plus the requesting child's rank.

#### Scenario: Global leaderboard
- **WHEN** a child requests the global leaderboard with `limit=50`
- **THEN** the system SHALL return up to 50 entries (rank, name, avatar_id, points) from the Redis sorted set, plus `my_rank`, `my_score`, and `reset_date`

#### Scenario: Child not on leaderboard
- **WHEN** the requesting child has no score in the current period
- **THEN** `my_rank` SHALL be null and `my_score` SHALL be 0

### Requirement: Monthly leaderboard reset
The system SHALL snapshot current Redis leaderboard data to `leaderboard_snapshot` in PostgreSQL on the 1st of each month, then allow Redis keys to expire naturally (TTL set at creation).

#### Scenario: Monthly snapshot
- **WHEN** the monthly reset job runs
- **THEN** all entries from the previous period's sorted sets SHALL be persisted to `leaderboard_snapshot` with `scope`, `period`, `total_points`, and `final_rank`

### Requirement: Entry hydration
The system SHALL hydrate leaderboard entries with child names and avatar_ids from the database (not stored in Redis).

#### Scenario: Entries displayed
- **WHEN** leaderboard entries are returned
- **THEN** each entry SHALL include `rank`, `name`, `avatar_id`, and `points` (name and avatar fetched from `child_profile`)
