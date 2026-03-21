## ADDED Requirements

### Requirement: Daily mission generation
The system SHALL generate 2-3 daily missions for each active child. Missions are personalized based on the child's collection gaps (categories with fewer captures are prioritized).

#### Scenario: First login of the day
- **WHEN** a child accesses missions and no daily missions exist for today
- **THEN** the system SHALL generate 2 missions from daily templates, save them with `status: "active"` and `expires_at` set to end of day (UTC+7)

#### Scenario: Missions already generated
- **WHEN** daily missions already exist for today
- **THEN** the system SHALL return the existing missions without generating new ones

### Requirement: Weekly mission generation
The system SHALL generate 1-2 weekly missions every Monday, with expiry at end of Sunday.

#### Scenario: Monday generation
- **WHEN** it is Monday and no weekly missions exist for this week
- **THEN** the system SHALL generate 1-2 weekly missions with appropriate targets and XP rewards (200-300 XP)

### Requirement: Mission progress on capture
The system SHALL check all active missions when a capture occurs. If the capture matches a mission's criteria (e.g., category, color), the mission's `current_count` increments.

#### Scenario: Capture matches active mission
- **WHEN** a child captures an animal and has an active mission "Capture 3 animals"
- **THEN** the mission's `current_count` SHALL increment by 1, and the response SHALL include `mission_update` with the new count

#### Scenario: Mission completed
- **WHEN** `current_count` reaches `target_count`
- **THEN** the mission's `status` SHALL change to `"completed"`

### Requirement: Get active missions
The system SHALL return all active missions via `GET /api/missions`, grouped by type (daily, weekly, category_challenges).

#### Scenario: Active missions exist
- **WHEN** a child has active and completed-but-unclaimed missions
- **THEN** the system SHALL return them grouped by type with progress info

### Requirement: Claim mission reward
The system SHALL allow claiming completed missions via `POST /api/missions/{mission_id}/claim`, awarding XP and optionally a badge.

#### Scenario: Claim completed mission
- **WHEN** a child claims a mission with `status: "completed"`
- **THEN** the system SHALL award `reward_xp`, update the mission status to `"claimed"`, and return `xp_earned`, `total_xp`, optional `badge_earned`, optional `level_up`

#### Scenario: Claim non-completed mission
- **WHEN** a child attempts to claim a mission that is still active or already claimed
- **THEN** the system SHALL return HTTP 400

### Requirement: Mission expiry
The system SHALL mark missions as `"expired"` when their `expires_at` timestamp is past and they are still `"active"`.

#### Scenario: Expired mission
- **WHEN** a daily mission's `expires_at` has passed and status is `"active"`
- **THEN** the system SHALL set status to `"expired"` (handled by background job or on-read check)
