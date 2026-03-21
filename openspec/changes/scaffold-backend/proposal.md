## Why

The SnapLearn backend has only 3 AI service wrappers (vision, speech, rarity — all BAML-based) and a Dockerfile. The backend document (`_docs/backend.md`) specifies a full FastAPI application with 12 API route modules, 10 services, 7 database models, 8 schema modules, database infrastructure, auth system, and utilities. None of this scaffolding exists. Without it, there is no runnable backend — the frontend has nothing to talk to.

## What Changes

- **FastAPI application scaffold**: `main.py` (app creation, middleware, lifespan), `config.py` (Pydantic BaseSettings), `dependencies.py` (DI for DB session, Redis, auth)
- **API route layer**: 11 route modules — auth, children, capture, speech, collection, missions, leaderboard, profile, parent_gate, parent, plus a root router aggregator
- **Service layer**: 7 new services — `capture_service.py`, `dedup_service.py`, `game_service.py`, `mission_service.py`, `leaderboard_service.py`, `auth_service.py`, `storage_service.py`. Existing BAML-based services (vision, speech, rarity) are preserved as-is.
- **Database layer**: SQLAlchemy 2.0 async models for all 7 tables (parent_account, child_profile, captured_vocab, mission, badge, leaderboard_snapshot, activity_log), async session factory, Redis connection pool, Alembic migrations setup
- **Pydantic schemas**: Request/response models for all endpoints — auth, capture, speech, collection, mission, leaderboard, profile, parent
- **Utilities**: Image processing (validation, compression, perceptual hashing), audio validation, security helpers (bcrypt, JWT), constants (XP values, level thresholds)
- **Project infrastructure**: `pyproject.toml` with all dependencies, `alembic.ini`, local `.env.example`, test scaffolding, seed scripts
- **Directory structure**: `uploads/photos/`, `tts_cache/{en,vi,zh}/`, `logs/`

## Capabilities

### New Capabilities
- `fastapi-scaffold`: App entrypoint, config, middleware (CORS, error handling), lifespan events, health check endpoint
- `auth-system`: Parent email/password registration, login, JWT access+refresh tokens, token refresh flow, auth dependency
- `child-management`: CRUD operations for child profiles under a parent account
- `capture-pipeline`: End-to-end photo capture orchestration — image validation → AI vision (BAML) → dedup → DB save → XP update → TTS pre-generation
- `speech-pronunciation`: Pronunciation judging endpoint (Whisper STT + BAML feedback), TTS audio serving from local cache
- `collection-browsing`: Vocab collection listing, category browsing, individual vocab card detail with mastery/evolution state
- `gamification-engine`: XP calculation, level progression (6 tiers), streak tracking, card evolution (mastery → evolved), pronunciation bonus XP
- `mission-system`: Daily/weekly mission generation based on collection gaps, progress tracking on capture, mission claiming with rewards
- `leaderboard-service`: Redis sorted-set leaderboard with global/class/friends scopes, monthly snapshots to Postgres, reset logic
- `parent-dashboard`: Parent gate (math challenge), dashboard stats, activity feed, parental controls CRUD, CSV export
- `database-layer`: SQLAlchemy 2.0 async models, Alembic migrations, Redis connection pool, session management
- `rate-limiting`: Per-child daily capture/pronunciation limits, per-minute API throttling via Redis counters

### Modified Capabilities
_(none — no existing specs)_

## Impact

- **New files**: ~50+ Python files across `app/be/app/` (api, services, models, schemas, db, utils)
- **Existing code preserved**: `app/be/app/services/vision_service.py`, `speech_service.py`, `rarity_service.py` and all `baml_src/` files remain untouched
- **Dependencies**: FastAPI, uvicorn, SQLAlchemy 2.0, asyncpg, alembic, redis/aioredis, pydantic v2, python-jose, passlib[bcrypt], httpx, Pillow, imagehash, python-multipart, slowapi, structlog, APScheduler
- **Infrastructure**: Requires Postgres 16 + Redis 7 (already defined in root `docker-compose.yml`)
- **Docker**: Existing `app/be/Dockerfile` is compatible; `docker-compose.yml` already maps correct volumes and ports
