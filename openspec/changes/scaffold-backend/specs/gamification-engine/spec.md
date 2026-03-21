## ADDED Requirements

### Requirement: XP award on capture
The system SHALL award XP to the child on each new capture. Base XP is determined by rarity tier (common=10, uncommon=25, rare=50, epic=100, legendary=250), modified by category diversity multiplier.

#### Scenario: New capture XP
- **WHEN** a child captures a new rare object in a category they have 2 captures in
- **THEN** the system SHALL award `50 * 1.0 = 50` XP (rare base × standard multiplier)

#### Scenario: Duplicate capture XP
- **WHEN** a child captures a duplicate
- **THEN** the system SHALL award 25% of the original `points_earned`

### Requirement: Level progression
The system SHALL calculate the child's level based on total XP using 6 tiers: Level 1 (0 XP, "Beginner Explorer"), Level 5 (500 XP, "Word Collector"), Level 10 (2000 XP, "Vocab Hunter"), Level 20 (8000 XP, "Language Scout"), Level 35 (25000 XP, "Word Master"), Level 50 (60000 XP, "Polyglot Champion").

#### Scenario: Level up
- **WHEN** a child's total XP crosses a level threshold (e.g., reaches 500 XP)
- **THEN** the system SHALL update `child_profile.level`, and the capture/pronunciation response SHALL include `level_up` with the new level number and title

#### Scenario: No level change
- **WHEN** XP increases but does not cross a threshold
- **THEN** `level_up` SHALL be null in the response

### Requirement: Streak tracking
The system SHALL track daily capture streaks. A streak increments when the child captures on consecutive calendar days. It resets to 1 if a day is missed.

#### Scenario: Consecutive day capture
- **WHEN** a child captures today and their `streak_date` is yesterday
- **THEN** `current_streak` SHALL increment by 1, `streak_date` updates to today, and `longest_streak` updates if current exceeds it

#### Scenario: Streak broken
- **WHEN** a child captures today but `streak_date` is more than 1 day ago
- **THEN** `current_streak` SHALL reset to 1

### Requirement: Card evolution
The system SHALL evolve a vocab card when its mastery level reaches 5 (from 5 perfect pronunciations across different sessions). Evolution awards 50 bonus XP.

#### Scenario: Card evolves
- **WHEN** a 3-star pronunciation brings mastery_level to 5 and `evolved` is false
- **THEN** the system SHALL set `evolved=true`, award 50 XP, and return `evolved: true` in the response

### Requirement: Pronunciation XP bonus
The system SHALL award 5 XP for each 3-star pronunciation. No XP for 1-star attempts.

#### Scenario: Perfect pronunciation
- **WHEN** a child receives 3 stars on pronunciation
- **THEN** the system SHALL award 5 XP and increment `mastery_level` (max 5)

#### Scenario: Imperfect pronunciation
- **WHEN** a child receives 1 star
- **THEN** the system SHALL award 0 XP and not change mastery_level

### Requirement: Leaderboard update on XP change
The system SHALL update the leaderboard Redis sorted set whenever XP is awarded.

#### Scenario: XP awarded
- **WHEN** any XP is earned (capture, pronunciation, evolution)
- **THEN** the system SHALL call `leaderboard_service.add_points()` with the XP amount
