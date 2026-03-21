## 1. Project Infrastructure

- [ ] 1.1 Create `app/be/pyproject.toml` with all dependencies (fastapi, uvicorn, sqlalchemy[asyncio], asyncpg, alembic, redis, pydantic, pydantic-settings, python-jose[cryptography], passlib[bcrypt], httpx, Pillow, imagehash, python-multipart, structlog, apscheduler)
- [ ] 1.2 Create `app/be/.env.example` with all required and optional env vars for the backend
- [ ] 1.3 Create `app/be/alembic.ini` configured for async Postgres via asyncpg
- [ ] 1.4 Create directory placeholders: `app/be/uploads/photos/.gitkeep`, `app/be/tts_cache/{en,vi,zh}/.gitkeep`, `app/be/logs/.gitkeep`

## 2. Configuration & App Core

- [ ] 2.1 Create `app/be/app/config.py` — Pydantic BaseSettings loading DATABASE_URL, REDIS_URL, JWT_SECRET_KEY, OPENAI_API_KEY, and all optional settings with defaults
- [ ] 2.2 Create `app/be/app/main.py` — FastAPI app with lifespan (init/dispose DB engine + Redis pool), CORS middleware, global error handler, health check, and router inclusion
- [ ] 2.3 Create `app/be/app/dependencies.py` — FastAPI dependencies: `get_db` (async session), `get_redis`, `get_current_parent` (JWT extraction), `get_current_child` (X-Child-Id validation)

## 3. Database Layer

- [ ] 3.1 Create `app/be/app/db/__init__.py`, `app/be/app/db/session.py` (async engine + async_sessionmaker), `app/be/app/db/redis.py` (Redis connection pool)
- [ ] 3.2 Create `app/be/app/models/__init__.py` and `app/be/app/models/base.py` — DeclarativeBase with UUID pk, created_at, updated_at mixins
- [ ] 3.3 Create `app/be/app/models/parent_account.py` — ParentAccount model (email, password_hash, settings JSONB)
- [ ] 3.4 Create `app/be/app/models/child_profile.py` — ChildProfile model (all fields from SQL schema: XP, level, streak, settings, FK to parent)
- [ ] 3.5 Create `app/be/app/models/captured_vocab.py` — CapturedVocab model (multi-language fields, mastery, evolution, photo_hash, UNIQUE constraint)
- [ ] 3.6 Create `app/be/app/models/mission.py` — Mission model (type, description_vi, target/current count, reward, status, match_criteria JSONB, expires_at)
- [ ] 3.7 Create `app/be/app/models/badge.py` — Badge model (badge_type, badge_name_vi, UNIQUE on child+type)
- [ ] 3.8 Create `app/be/app/models/leaderboard_entry.py` — LeaderboardSnapshot model (scope, period, total_points, final_rank, category_points JSONB)
- [ ] 3.9 Create `app/be/app/models/activity_log.py` — ActivityLog model (event_type, event_data JSONB)
- [ ] 3.10 Create `app/be/app/db/migrations/env.py` — Alembic async env with model imports
- [ ] 3.11 Generate initial Alembic migration creating all 7 tables with indexes

## 4. Pydantic Schemas

- [ ] 4.1 Create `app/be/app/schemas/__init__.py`
- [ ] 4.2 Create `app/be/app/schemas/auth.py` — RegisterRequest, LoginRequest, RefreshRequest, TokenResponse (with optional children list)
- [ ] 4.3 Create `app/be/app/schemas/capture.py` — CaptureRequest (base64 image), CaptureResponse (status, vocab_card, xp, level_up, mission_update, tts_urls)
- [ ] 4.4 Create `app/be/app/schemas/speech.py` — PronounceRequest (vocab_id, language, audio), PronounceResponse (stars, transcript, mastery, evolved, xp)
- [ ] 4.5 Create `app/be/app/schemas/collection.py` — VocabCard, CategorySummary, CollectionResponse, CategoryDetailResponse
- [ ] 4.6 Create `app/be/app/schemas/mission.py` — MissionResponse, MissionClaimResponse, MissionUpdate
- [ ] 4.7 Create `app/be/app/schemas/leaderboard.py` — RankEntry, LeaderboardResponse
- [ ] 4.8 Create `app/be/app/schemas/profile.py` — ProfileResponse, BadgeResponse, ProfileStats
- [ ] 4.9 Create `app/be/app/schemas/parent.py` — DashboardResponse, ActivityEvent, ControlsUpdate, ChildProfileSchema

## 5. Utilities

- [ ] 5.1 Create `app/be/app/utils/__init__.py`
- [ ] 5.2 Create `app/be/app/utils/constants.py` — LEVEL_THRESHOLDS, RARITY_XP values, CATEGORY_ICONS, error codes with Vietnamese/English messages
- [ ] 5.3 Create `app/be/app/utils/security.py` — bcrypt password hashing, JWT encode/decode helpers, token hash function
- [ ] 5.4 Create `app/be/app/utils/image.py` — image validation (size, format), compression (max 1024px), perceptual hash computation (using imagehash)
- [ ] 5.5 Create `app/be/app/utils/audio.py` — audio format validation (WebM/WAV), size limit checking
- [ ] 5.6 Create `app/be/app/utils/errors.py` — AppError base exception class and all error subclasses (CaptureRateLimited, AuthInvalid, etc.) with code/message_vi/message_en/status_code

## 6. Auth Service & Routes

- [ ] 6.1 Create `app/be/app/services/auth_service.py` — register(), login(), refresh_token(), with bcrypt hashing, JWT generation, Redis refresh token storage
- [ ] 6.2 Create `app/be/app/api/__init__.py` and `app/be/app/api/auth.py` — POST /auth/register, /auth/login, /auth/refresh routes
- [ ] 6.3 Create `app/be/app/api/children.py` — POST /children, GET /children/{id}, PATCH /children/{id} routes

## 7. Core Services (Capture & Game)

- [ ] 7.1 Create `app/be/app/services/storage_service.py` — save_photo() to local filesystem, serve_file() helper
- [ ] 7.2 Create `app/be/app/services/dedup_service.py` — find_duplicate() checking photo_hash against child's existing captures
- [ ] 7.3 Create `app/be/app/services/game_service.py` — on_capture() (XP + level + streak + leaderboard), on_pronunciation() (mastery + evolution + XP), _calculate_level(), level threshold lookup
- [ ] 7.4 Create `app/be/app/services/capture_service.py` — process_capture() orchestrating: validate image → hash → dedup → vision_service.identify_object() → rarity_service.classify_rarity() → save vocab → game_service.on_capture() → async TTS pre-generation
- [ ] 7.5 Create `app/be/app/services/tts_service.py` — ensure_cached() for pre-generation, get_urls() for URL resolution (wraps speech_service.synthesize_speech)

## 8. Mission & Leaderboard Services

- [ ] 8.1 Create `app/be/app/services/mission_service.py` — generate_daily_missions(), generate_weekly_missions(), on_capture() progress check, claim_mission(), _get_weak_categories(), _matches_mission()
- [ ] 8.2 Create `app/be/app/services/leaderboard_service.py` — add_points() (Redis ZINCRBY), get_rankings() (ZREVRANGE + hydrate), monthly_reset(), _snapshot_to_db()

## 9. API Route Handlers

- [ ] 9.1 Create `app/be/app/api/capture.py` — POST /capture route with rate limit check, calls capture_service
- [ ] 9.2 Create `app/be/app/api/speech.py` — POST /pronounce route (calls speech_service + game_service), GET /tts/{vocab_id}/{language} (serves cached audio)
- [ ] 9.3 Create `app/be/app/api/collection.py` — GET /collection, GET /collection/{category}, GET /vocab/{vocab_id}
- [ ] 9.4 Create `app/be/app/api/missions.py` — GET /missions, POST /missions/{mission_id}/claim
- [ ] 9.5 Create `app/be/app/api/leaderboard.py` — GET /leaderboard/{scope}
- [ ] 9.6 Create `app/be/app/api/profile.py` — GET /profile (child profile + badges + stats)
- [ ] 9.7 Create `app/be/app/api/parent_gate.py` — POST /parent-gate/challenge, POST /parent-gate/verify
- [ ] 9.8 Create `app/be/app/api/parent.py` — GET /parent/dashboard, GET /parent/activity-feed, PATCH /parent/controls, GET /parent/export
- [ ] 9.9 Create `app/be/app/api/router.py` — aggregate all sub-routers with prefix and tags

## 10. Rate Limiting

- [ ] 10.1 Create rate limiting dependency/middleware in `app/be/app/services/rate_limit_service.py` — Redis INCR with daily TTL, per-child counters for captures and pronunciations
- [ ] 10.2 Wire rate limit checks into capture and speech routes

## 11. Test Scaffolding & Scripts

- [ ] 11.1 Create `app/be/tests/conftest.py` — test fixtures for async DB session (SQLite in-memory), mock Redis, mock AI services, test client (httpx.AsyncClient)
- [ ] 11.2 Create `app/be/tests/test_health.py` — smoke test for health endpoint
- [ ] 11.3 Create `app/be/scripts/seed_test_data.py` — generates test parent, children, captured vocab, missions
- [ ] 11.4 Create `app/be/scripts/reset_leaderboard.py` — monthly leaderboard reset script

## 12. Data & Schema SQL

- [ ] 12.1 Create `app/be/data/schema.sql` — full SQL schema matching backend doc section 4 (for Docker postgres init)
- [ ] 12.2 Create `app/be/scripts/seed_reference_vocab.py` — seeds reference vocabulary categories/totals for collection progress tracking
