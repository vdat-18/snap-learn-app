## ADDED Requirements

### Requirement: Test configuration with async fixtures
The system SHALL provide a `conftest.py` with pytest fixtures for: async SQLAlchemy session (using SQLite in-memory with aiosqlite), mock Redis client, mock AI services (vision, speech, rarity), and an httpx.AsyncClient configured against the FastAPI test app.

#### Scenario: Test database isolation
- **WHEN** a test runs using the `db` fixture
- **THEN** it SHALL receive a fresh async SQLAlchemy session backed by an in-memory SQLite database with all tables created, and changes SHALL be rolled back after the test

#### Scenario: Mock external services
- **WHEN** a test runs that would normally call OpenAI or BAML
- **THEN** the AI service fixtures SHALL provide mock responses without making real API calls

### Requirement: Health endpoint smoke test
The system SHALL include a `test_health.py` that verifies the `/health` endpoint returns HTTP 200 with `status: "healthy"`.

#### Scenario: Health check passes
- **WHEN** the test sends GET /health to the test client
- **THEN** the response SHALL be HTTP 200 with JSON body containing `"status": "healthy"`

### Requirement: Seed test data script
The system SHALL provide `scripts/seed_test_data.py` that creates sample data: 1 parent account, 2 child profiles, 10 captured vocab cards across 3 categories, and 3 active missions.

#### Scenario: Script execution
- **WHEN** `python scripts/seed_test_data.py` is run against a database
- **THEN** the database SHALL contain the seeded test data

### Requirement: Leaderboard reset script
The system SHALL provide `scripts/reset_leaderboard.py` that snapshots the current Redis leaderboard to PostgreSQL and clears the Redis sorted sets.

#### Scenario: Monthly reset
- **WHEN** the script is run on the 1st of the month
- **THEN** all current leaderboard entries SHALL be persisted to `leaderboard_snapshot` and Redis sorted sets for the previous period SHALL be cleared

### Requirement: Reference vocabulary seed script
The system SHALL provide `scripts/seed_reference_vocab.py` that populates reference data for category totals (used by collection progress tracking).

#### Scenario: Reference data seeded
- **WHEN** the script runs
- **THEN** the CATEGORY_TOTALS data SHALL be available for collection progress calculations

### Requirement: SQL schema file for Docker init
The system SHALL provide `data/schema.sql` containing the full PostgreSQL schema (all 7 tables + indexes) matching `_docs/backend.md` section 4. This file is mounted by docker-compose for initial database setup.

#### Scenario: Docker postgres init
- **WHEN** the Postgres container starts with an empty data volume
- **THEN** `schema.sql` SHALL be executed via `docker-entrypoint-initdb.d`, creating all tables and indexes
