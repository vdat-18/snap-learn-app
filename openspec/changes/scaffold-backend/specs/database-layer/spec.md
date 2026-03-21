## ADDED Requirements

### Requirement: Async SQLAlchemy engine
The system SHALL create an async SQLAlchemy engine using `create_async_engine` with the `asyncpg` driver, configured from the `DATABASE_URL` environment variable.

#### Scenario: Engine initialization
- **WHEN** the application starts
- **THEN** an async engine SHALL be created with connection pooling (pool_size=5, max_overflow=10)

### Requirement: Async session factory
The system SHALL provide an `async_sessionmaker` that yields `AsyncSession` instances for use in FastAPI dependencies.

#### Scenario: Session injection
- **WHEN** a route handler declares a dependency on `get_db`
- **THEN** it SHALL receive an `AsyncSession` that is automatically committed on success and rolled back on exception

### Requirement: Redis connection pool
The system SHALL create a Redis connection pool using `redis.asyncio` configured from the `REDIS_URL` environment variable.

#### Scenario: Redis injection
- **WHEN** a route handler declares a dependency on `get_redis`
- **THEN** it SHALL receive an async Redis client from the connection pool

### Requirement: SQLAlchemy model base
The system SHALL define a `Base` class using SQLAlchemy 2.0 `DeclarativeBase` with common mixins for `id` (UUID, primary key), `created_at` (TIMESTAMPTZ, default now), and `updated_at` (TIMESTAMPTZ, default now, on update now).

#### Scenario: Model inheritance
- **WHEN** a model inherits from `Base`
- **THEN** it SHALL automatically have `id`, `created_at`, and `updated_at` columns

### Requirement: All 7 database models
The system SHALL define SQLAlchemy models for: `ParentAccount`, `ChildProfile`, `CapturedVocab`, `Mission`, `Badge`, `LeaderboardSnapshot`, `ActivityLog` — matching the SQL schema in `_docs/backend.md` section 4.

#### Scenario: ParentAccount model
- **WHEN** the model is defined
- **THEN** it SHALL have columns: `id`, `email`, `password_hash`, `settings` (JSONB), `created_at`, `updated_at`

#### Scenario: ChildProfile model
- **WHEN** the model is defined
- **THEN** it SHALL have columns matching the `child_profile` table including `parent_id` FK, all XP/level/streak fields, and all settings fields

#### Scenario: CapturedVocab model
- **WHEN** the model is defined
- **THEN** it SHALL have columns for all three language translations, mastery per language (0-5), evolution status, photo_hash, confidence, and the UNIQUE constraint on (child_id, word_en, word_vi)

### Requirement: Alembic migration setup
The system SHALL configure Alembic for async migrations with an initial migration that creates all 7 tables and all indexes defined in the backend doc.

#### Scenario: Initial migration
- **WHEN** `alembic upgrade head` is run against an empty database
- **THEN** all 7 tables SHALL be created with correct columns, constraints, foreign keys, and indexes

### Requirement: Pydantic request/response schemas
The system SHALL define Pydantic v2 schemas in `app/schemas/` for all API endpoints, organized by domain: auth, capture, speech, collection, mission, leaderboard, profile, parent.

#### Scenario: Schema validation
- **WHEN** a request is received at any endpoint
- **THEN** FastAPI SHALL automatically validate the request body against the corresponding Pydantic schema
