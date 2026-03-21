## ADDED Requirements

### Requirement: Per-child daily capture rate limiting
The system SHALL enforce a daily capture limit per child using Redis counters. Free tier: 5 captures/day, premium tier: 50 captures/day. The counter key SHALL be `ratelimit:capture:{child_id}:{YYYY-MM-DD}` with TTL set to seconds until midnight UTC+7.

#### Scenario: Under limit
- **WHEN** a child has used 3 of 5 daily captures
- **THEN** the capture request SHALL proceed and the counter SHALL increment

#### Scenario: Limit reached
- **WHEN** a child has already used all daily captures
- **THEN** the system SHALL raise `CaptureRateLimited` (HTTP 429) with message_vi "Hôm nay chụp nhiều rồi! Mai quay lại nha!"

### Requirement: Per-child daily pronunciation rate limiting
The system SHALL enforce a daily pronunciation limit per child using Redis counters. Free tier: 15 attempts/day, premium tier: 100 attempts/day. The counter key SHALL be `ratelimit:pronunciation:{child_id}:{YYYY-MM-DD}`.

#### Scenario: Under limit
- **WHEN** a child has used 10 of 15 daily pronunciation attempts
- **THEN** the pronunciation request SHALL proceed

#### Scenario: Limit reached
- **WHEN** all pronunciation attempts are exhausted
- **THEN** the system SHALL raise `PronunciationRateLimited` (HTTP 429)

### Requirement: Rate limit implementation as FastAPI dependency
The system SHALL implement rate limiting as injectable FastAPI dependencies (`check_capture_rate_limit`, `check_pronunciation_rate_limit`) that run after auth dependencies, accessing the child_id from the auth context.

#### Scenario: Dependency injection
- **WHEN** a capture or pronunciation route is called
- **THEN** the rate limit dependency SHALL execute after `get_current_child`, check the Redis counter, and either allow the request or raise the appropriate error

### Requirement: Rate limit TTL to midnight UTC+7
The system SHALL calculate the Redis key TTL as the number of seconds remaining until midnight in UTC+7 (Vietnam timezone), ensuring counters reset at local midnight rather than using a fixed 24-hour window.

#### Scenario: Counter created mid-day
- **WHEN** a new rate limit counter is created at 14:00 UTC+7
- **THEN** the Redis key TTL SHALL be set to 36000 seconds (10 hours until midnight)
