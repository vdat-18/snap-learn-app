# SnapLearn — Backend (FastAPI)

**Server-authoritative API layer: endpoints, services, data, and gamification engine**

---

## Overview

The SnapLearn backend is a **Python FastAPI** application that serves as the orchestration layer between the Next.js PWA frontend and all external services (AI vision, speech). It owns all business logic — gamification, missions, leaderboards, safety filtering — ensuring the client is a thin display layer.

### Design Principles

- **Server-authoritative:** XP, levels, rarity, and mission progress are calculated server-side only. The client never computes game state.
- **Async-first:** All I/O-bound operations (AI calls, DB queries) use `async/await`. No blocking threads.
- **Cache-heavy:** Reference vocab, TTS audio files, and leaderboard ranks are cached in Redis to minimize latency and AI costs.
- **Language-agnostic storage:** Every captured vocab stores translations for ALL supported languages (EN, VI, ZH). The frontend filters by the child's selected language.
- **Local-first:** All file storage (photos, TTS audio, logs) uses the local filesystem. No cloud storage dependencies.

---

## Tech Stack

| Component | Technology | Rationale |
|---|---|---|
| **Framework** | FastAPI (Python 3.12) | Async-native, auto OpenAPI docs, Pydantic validation |
| **Server** | Uvicorn + Gunicorn | Production-grade ASGI server with worker management |
| **ORM** | SQLAlchemy 2.0 + Alembic | Async ORM with migration management |
| **Validation** | Pydantic v2 | Request/response schema validation, JSON serialization |
| **Auth** | python-jose (JWT) + passlib (bcrypt) | Lightweight JWT-based auth, password hashing |
| **Database** | PostgreSQL 16 | Relational data (users, vocab, missions), JSONB for flexibility |
| **Cache** | Redis 7 | Sorted sets for leaderboard, session cache, rate limiting |
| **Logging** | Python `logging` + structlog | Structured logs to stdout and local log files |
| **Testing** | pytest + httpx | Async test client, fixture-based testing |

---

## Project Structure

```
backend/
├── app/
│   ├── main.py                    # FastAPI app creation, middleware, lifespan
│   ├── config.py                  # Settings (env vars, Pydantic BaseSettings)
│   ├── dependencies.py            # Dependency injection (DB session, auth, etc.)
│   │
│   ├── api/                       # Route handlers
│   │   ├── router.py              # Root router aggregating all sub-routers
│   │   ├── auth.py                # POST /auth/register, /auth/login, /auth/refresh
│   │   ├── children.py            # CRUD child profiles
│   │   ├── capture.py             # POST /capture (core loop)
│   │   ├── speech.py              # POST /pronounce, GET /tts
│   │   ├── collection.py          # GET /collection, /collection/{category}, /vocab/{id}
│   │   ├── missions.py            # GET /missions, POST /missions/{id}/claim
│   │   ├── leaderboard.py         # GET /leaderboard/{scope}
│   │   ├── profile.py             # GET /profile, badges
│   │   ├── parent_gate.py         # POST /parent-gate/challenge, /verify
│   │   └── parent.py              # GET /parent/dashboard, /activity-feed, PATCH /controls
│   │
│   ├── services/                  # Business logic
│   │   ├── vision_service.py      # OpenAI GPT-4o / OpenRouter for object recognition
│   │   ├── speech_service.py      # ASR (OpenAI Whisper) + pronunciation matching
│   │   ├── tts_service.py         # TTS generation + local file caching (OpenAI TTS)
│   │   ├── capture_service.py     # Capture orchestration (vision + rarity + dedup + save)
│   │   ├── rarity_service.py      # Rarity calculation (frequency + difficulty)
│   │   ├── safety_service.py      # Content filtering (stop-list + AI confidence)
│   │   ├── dedup_service.py       # Duplicate detection (perceptual hashing)
│   │   ├── game_service.py        # XP, levels, streaks, evolution
│   │   ├── mission_service.py     # Mission generation, progress tracking, expiry
│   │   ├── leaderboard_service.py # Redis sorted sets, ranking, monthly reset
│   │   ├── auth_service.py        # Email/password auth, JWT token management
│   │   └── storage_service.py     # Local filesystem upload, file serving
│   │
│   ├── models/                    # SQLAlchemy models
│   │   ├── parent_account.py
│   │   ├── child_profile.py
│   │   ├── captured_vocab.py
│   │   ├── reference_vocab.py
│   │   ├── mission.py
│   │   ├── badge.py
│   │   └── leaderboard_entry.py
│   │
│   ├── schemas/                   # Pydantic request/response schemas
│   │   ├── auth.py                # RegisterRequest, LoginRequest, TokenResponse
│   │   ├── capture.py             # CaptureRequest, CaptureResponse
│   │   ├── speech.py              # PronounceRequest, PronounceResponse
│   │   ├── collection.py          # VocabCard, CategorySummary
│   │   ├── mission.py             # MissionResponse, MissionClaimResponse
│   │   ├── leaderboard.py         # LeaderboardResponse, RankEntry
│   │   ├── profile.py             # ProfileResponse, BadgeResponse
│   │   └── parent.py              # DashboardResponse, ControlsUpdate
│   │
│   ├── db/
│   │   ├── session.py             # Async SQLAlchemy engine + session factory
│   │   ├── redis.py               # Redis connection pool
│   │   └── migrations/            # Alembic migration directory
│   │
│   └── utils/
│       ├── image.py               # Image validation, compression, hashing
│       ├── audio.py               # Audio format validation, conversion
│       ├── security.py            # Password hashing (bcrypt), JWT encode/decode
│       ├── stop_list.py           # Content blocklist loader
│       └── constants.py           # Rarity tiers, XP values, level thresholds
│
├── tests/
│   ├── conftest.py                # Test fixtures (DB, Redis, mocked AI)
│   ├── test_capture.py
│   ├── test_speech.py
│   ├── test_game.py
│   ├── test_missions.py
│   ├── test_leaderboard.py
│   └── test_safety.py
│
├── scripts/
│   ├── seed_reference_vocab.py    # Load initial 200 verified vocab entries
│   ├── seed_test_data.py          # Generate test users, captures, missions
│   └── reset_leaderboard.py       # Monthly leaderboard reset script
│
├── data/
│   ├── reference_vocab.csv        # 200+ verified EN ↔ VI ↔ ZH entries
│   ├── stop_list_en.txt           # English blocked words
│   ├── stop_list_vi.txt           # Vietnamese blocked words
│   └── stop_list_zh.txt           # Chinese blocked words
│
├── uploads/                       # Local photo storage (opt-in)
├── tts_cache/                     # Local TTS audio cache (en/, vi/, zh/)
├── logs/                          # Application log files
│
├── Dockerfile
├── docker-compose.yml             # Local dev: Postgres + Redis + app
├── pyproject.toml                 # Dependencies (uv/poetry)
├── alembic.ini
└── .env.example
```

---

## Core Services

### Capture Service (Core Loop)

The most critical service. Orchestrates the entire **photo → vocab card** pipeline:

1. Validate & compress image
2. Check for exact duplicate (perceptual hash)
3. Check reference vocab cache (fast, free, verified)
4. Call AI vision (OpenAI GPT-4o) if cache miss
5. Safety filter (stop-list + confidence + category)
6. Rarity calculation (global frequency + linguistic difficulty)
7. Save vocab card + update XP + check mission progress
8. Pre-generate TTS audio (async, non-blocking)

### Game Service

Server-authoritative gamification engine managing:

- **XP system:** Points per rarity tier (Common 10pts → Legendary 250pts), duplicate penalty (25%), pronunciation bonus (+5)
- **Level progression:** 6 levels from Beginner Explorer (0 XP) to Polyglot Champion (60,000 XP)
- **Streaks:** Daily capture tracking, milestone multipliers (7, 14, 30 days)
- **Card evolution:** 5 perfect pronunciations across different sessions → evolved card with fun fact & example sentences

### Mission Service

Dynamic mission generation based on child's collection gaps:

- **Daily missions** (2-3 per day): "Find 3 red objects!", "Capture 5 things!"
- **Weekly missions** (1-2 per week): "Capture 5 items in the kitchen!"
- **Category challenges:** "Complete the Animals category!"

### Leaderboard Service

Real-time rankings using Redis sorted sets:

- Scopes: global, class, friends
- Monthly reset with PostgreSQL snapshots for historical records
- Automatic rank calculation

### Safety Service

Multi-layer content filtering for 6-10 year-olds:

1. AI prompt-level filtering (built into vision prompt)
2. Confidence gate (reject < 0.7)
3. Stop-list filter (curated blocklists in EN, VI, ZH)
4. Category filter (weapons, alcohol, adult content, etc.)
5. Human review flag for borderline results

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register parent (email + password) |
| `POST` | `/api/auth/login` | Login → JWT tokens |
| `POST` | `/api/auth/refresh` | Refresh access token |

### Core Loop
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/capture` | Submit photo for AI recognition |
| `POST` | `/api/pronounce` | Submit audio for pronunciation check |
| `GET` | `/api/tts/{vocab_id}/{lang}` | Get TTS audio for a word |

### Collection & Gamification
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/collection` | Get child's vocab collection |
| `GET` | `/api/collection/{category}` | Get vocab by category |
| `GET` | `/api/vocab/{id}` | Get vocab card detail |
| `GET` | `/api/missions` | Get active missions |
| `POST` | `/api/missions/{id}/claim` | Claim mission reward |
| `GET` | `/api/leaderboard/{scope}` | Get rankings (global/class/friends) |
| `GET` | `/api/profile` | Get child profile + badges |

### Parent Dashboard
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/parent-gate/challenge` | Get math puzzle |
| `POST` | `/api/parent-gate/verify` | Verify answer → parent token |
| `GET` | `/api/parent/dashboard` | Dashboard stats |
| `GET` | `/api/parent/activity-feed` | Child activity feed |
| `PATCH` | `/api/parent/controls` | Update parental controls |
| `GET` | `/api/parent/export` | Export vocab as CSV |

---

## Database Schema

Key tables: `parent_account`, `child_profile`, `captured_vocab`, `reference_vocab`, `mission`, `badge`, `leaderboard_snapshot`, `activity_log`.

See [`_docs/backend.md`](../../_docs/backend.md) for full SQL schema and index definitions.

### Redis Data Structures

- **Leaderboards:** Sorted sets (`leaderboard:global:{period}`)
- **Capture frequency:** Sorted set for rarity calculation (`capture_frequency:global`)
- **Rate limiting:** Per-child daily counters with TTL
- **TTS cache keys:** Local file path mappings
- **JWT refresh tokens:** Per-parent hash with expiry

---

## Rate Limiting & Quotas

| Limit | Free Tier | Premium Tier |
|---|---|---|
| Captures per day | 5 | 50 |
| Pronunciation attempts per day | 15 | 100 |
| TTS requests per minute | 10 | 30 |
| API requests per minute | 30 | 120 |
| Image upload size | 2MB | 5MB |

---

## Background Jobs

| Job | Schedule | Description |
|---|---|---|
| Generate daily missions | 00:00 UTC+7 daily | Create 2-3 daily missions per active child |
| Expire old missions | 00:00 UTC+7 daily | Mark expired missions |
| Generate weekly missions | Monday 00:00 UTC+7 | Create 1-2 weekly missions |
| Leaderboard snapshot | 1st of month | Snapshot Redis to PostgreSQL |
| Leaderboard reset | 1st of month | Clear Redis sorted sets |
| Streak reset check | 00:00 UTC+7 daily | Reset streaks for inactive children |
| TTS pre-cache | On deploy | Pre-generate TTS for reference vocab |

---

## Getting Started

### Prerequisites

- Python 3.12+
- Docker & Docker Compose
- OpenAI API key
- OpenRouter API key (for fallback)

### Quick Start

```bash
cp .env.example .env
# Fill in: OPENAI_API_KEY, OPENROUTER_API_KEY, JWT_SECRET_KEY

docker compose up -d           # Start Postgres + Redis
uv run alembic upgrade head    # Run migrations
uv run python scripts/seed_reference_vocab.py  # Seed 200 verified vocab entries
uv run uvicorn app.main:app --reload --port 8000
```

### Health Check

```
GET /health → { "status": "healthy", "db": "ok", "redis": "ok" }
```

---

## Sprint Roadmap

| Sprint | Weeks | Deliverables |
|---|---|---|
| **1** | 1-2 | FastAPI scaffold, DB schema + migrations, auth (JWT), `POST /capture` (GPT-4o), reference vocab seeding |
| **2** | 3-4 | `POST /pronounce` (Whisper), `GET /tts` (OpenAI TTS + caching), pronunciation matching, star rating |
| **3** | 5-6 | Collection endpoints, mastery system, duplicate detection (pHash), card evolution |
| **4** | 7-8 | Mission service, leaderboard (Redis), level progression, XP system |
| **5** | 9-10 | Parent gate, parent dashboard, activity feed, parental controls, CSV export |
| **6** | 11-12 | Rate limiting, anti-gaming, performance optimization, error handling, logging |

---

## Related Docs

- [Architecture Plan](../../_docs/architecture.md)
- [AI Pipeline Plan](../../_docs/ai.md)
- [Frontend Plan](../../_docs/frontend_plan.md)
- [Product Vision](../../_docs/product_vision.md)
