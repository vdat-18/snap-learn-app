## ADDED Requirements

### Requirement: Per-child daily capture limit
The system SHALL enforce a daily capture limit per child: 5 captures/day (free tier) or 50 captures/day (premium tier). The counter is stored in Redis with a daily TTL.

#### Scenario: Under limit
- **WHEN** a child has made 3 captures today (free tier, limit 5)
- **THEN** the capture SHALL proceed normally

#### Scenario: Limit reached
- **WHEN** a child has already made 5 captures today (free tier)
- **THEN** the system SHALL return HTTP 429 with error code `CAPTURE_RATE_LIMITED` and message_vi `"Hôm nay chụp nhiều rồi! Mai quay lại nha!"`

### Requirement: Per-child daily pronunciation limit
The system SHALL enforce a daily pronunciation limit per child: 15 attempts/day (free) or 100/day (premium). Stored in Redis with daily TTL.

#### Scenario: Pronunciation limit reached
- **WHEN** a child has used all pronunciation attempts
- **THEN** the system SHALL return HTTP 429 with remaining attempts = 0

### Requirement: Redis-based counter implementation
Rate limit counters SHALL use Redis `INCR` with `EXPIRE` (TTL to midnight UTC+7). The key format SHALL be `ratelimit:{type}:{child_id}:{date}`.

#### Scenario: Counter increment
- **WHEN** a capture or pronunciation request is processed
- **THEN** the system SHALL `INCR` the corresponding Redis key and set TTL if it's a new key

### Requirement: Daily time limit enforcement
The system SHALL check the child's `daily_time_limit_minutes` setting. If exceeded, return HTTP 403 with error code `TIME_LIMIT_REACHED`.

#### Scenario: Time limit exceeded
- **WHEN** a child's session duration exceeds their `daily_time_limit_minutes`
- **THEN** the system SHALL return HTTP 403 with message_vi `"Hôm nay học đủ rồi! Mai quay lại nha!"`
