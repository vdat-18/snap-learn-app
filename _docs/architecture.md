# SnapLearn — System Architecture Plan

**Overall technical blueprint for the SnapLearn POC**
Version 1.0 | March 2026

---

## 1. Architecture overview

SnapLearn follows a **client-server architecture** with a Next.js PWA frontend communicating with a Python FastAPI backend. The backend orchestrates AI services (vision, speech), manages persistent data, and serves the gamification logic. All AI processing happens server-side — the client is a thin capture & display layer. Everything runs locally during development and can be deployed to a single machine or cloud VM.

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (PWA)                             │
│  Next.js + TypeScript · Tailwind CSS · Service Worker           │
│  Camera API · Web Audio API                                     │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS (REST)
                           │ Image upload, audio stream,
                           │ JSON API calls
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                     API GATEWAY / BACKEND                       │
│  Python · FastAPI · async/await · Uvicorn                       │
│                                                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────────┐  │
│  │ Capture  │ │ Speech   │ │ Game     │ │ Auth & User       │  │
│  │ Service  │ │ Service  │ │ Engine   │ │ Service            │  │
│  │          │ │          │ │          │ │                    │  │
│  │ • Vision │ │ • ASR    │ │ • XP     │ │ • Email/Password  │  │
│  │  (BAML)  │ │ • TTS    │ │ • Levels │ │ • JWT Tokens      │  │
│  │ • Safety │ │ • Match  │ │ • Missions│ │ • Parent/Child    │  │
│  │  (BAML)  │ │ • Feedback│ │ • Leader │ │ • Parent Gate     │  │
│  │ • Rarity │ │  (BAML)  │ │          │ │                    │  │
│  │  (BAML)  │ │          │ │          │ │                    │  │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬──────────────┘  │
│       │            │            │             │                 │
└───────┼────────────┼────────────┼─────────────┼─────────────────┘
        │            │            │             │
        ▼            ▼            ▼             ▼
┌──────────┐ ┌──────────────┐ ┌───────┐ ┌─────────────┐
│ AI       │ │ Speech       │ │ Data  │ │ Local File  │
│ Services │ │ Services     │ │ Layer │ │ Storage     │
│          │ │              │ │       │ │             │
│ OpenAI / │ │ OpenAI       │ │ Postgres│ │ ./uploads/ │
│ OpenRouter│ │ Whisper/TTS │ │ Redis │ │ ./tts_cache/│
│ (vision) │ │ (via API)    │ │       │ │             │
└──────────┘ └──────────────┘ └───────┘ └─────────────┘
```

---

## 2. Technology stack

### 2.1 Frontend

| Component | Technology | Rationale |
|---|---|---|
| **Framework** | Next.js 14 (App Router) + TypeScript | SSR/SSG for SEO, file-based routing, built-in API routes for BFF patterns, optimized image handling, PWA-ready |
| **Styling** | Tailwind CSS 3 | Rapid UI iteration, good CJK typography, small bundle |
| **State management** | Zustand | Lightweight, no boilerplate, works well with async |
| **Animation** | Framer Motion | Spring physics, gesture support, performant for card reveals |
| **Camera** | `navigator.mediaDevices.getUserMedia()` | Direct browser API, no wrapper library needed |
| **Audio recording** | MediaRecorder API + Web Audio API | PTT recording, audio blob for ASR upload |
| **PWA** | next-pwa (Workbox under the hood) | Service worker generation, precaching static assets |
| **Icons** | Lucide React | Consistent stroke-based icons, tree-shakeable |
| **Charts** (parent) | Recharts | Lightweight charting for parent dashboard |
| **HTTP client** | Native `fetch` (via Next.js) or ky | API calls with retry, timeout, interceptors |

### 2.2 Backend

| Component | Technology | Rationale |
|---|---|---|
| **Framework** | FastAPI (Python 3.12) | Async-native, auto OpenAPI docs, Pydantic validation |
| **Server** | Uvicorn + Gunicorn | Production-grade ASGI server with worker management |
| **ORM** | SQLAlchemy 2.0 + Alembic | Async ORM with migration management |
| **Validation** | Pydantic v2 | Request/response schema validation, JSON serialization |
| **LLM orchestration** | BAML (v0.76.2) | Type-safe LLM functions, declarative fallback chains, Pydantic model generation. See [ai.md § 2](./ai.md) |
| **Auth** | python-jose (JWT) + passlib (bcrypt) | Lightweight JWT-based auth, password hashing |
| **Testing** | pytest + httpx + baml-cli test | Async test client, fixture-based testing, BAML prompt validation |

### 2.3 Data layer

| Component | Technology | Rationale |
|---|---|---|
| **Primary DB** | PostgreSQL 16 | Relational data (users, vocab, missions), JSONB for flexibility |
| **Cache / Leaderboard** | Redis 7 | Sorted sets for real-time leaderboard, session cache, rate limiting |
| **File storage** | Local filesystem (`./uploads/`, `./tts_cache/`) | Captured photos (opt-in), TTS audio cache — served via FastAPI static files |
| **Search** (future) | PostgreSQL full-text | Reference vocab lookup; no Elasticsearch needed at POC scale |

### 2.4 Infrastructure

| Component | Technology | Rationale |
|---|---|---|
| **All-in-one local** | Docker Compose | Runs everything locally: FastAPI, Postgres, Redis, Next.js |
| **CI/CD** | GitHub Actions | Build, test, lint pipeline on push/PR |
| **Logging** | Python `logging` + structlog (stdout/file) | Structured logs to stdout and local log files, no 3rd-party service |
| **Monitoring** | FastAPI `/health` endpoint + log file analysis | Simple health checks; upgrade to Prometheus/Grafana when needed |

### 2.5 External AI services

All LLM-based inference is orchestrated through **BAML**, which provides type-safe function definitions, declarative fallback chains, and auto-generated Pydantic v2 models. Non-LLM APIs (Whisper ASR, TTS) are called directly in Python.

| Service | Provider | Model | Purpose | Orchestration |
|---|---|---|---|---|
| **Vision (object recognition)** | OpenAI | GPT-4o | Primary: photo → structured JSON (word, translation, category) | BAML `VisionFallback` chain |
| **Vision fallback** | OpenRouter | google/gemini-flash-2.5 or anthropic/claude-sonnet-4 | Fallback if OpenAI is down or over budget | BAML `VisionFallback` chain |
| **Rarity classification** | OpenAI | GPT-4o-mini | Classify objects into rarity tiers | BAML `FastFallback` chain |
| **Content safety** | OpenAI | GPT-4o-mini | Pre-flight image + post-flight word safety checks | BAML `FastFallback` chain |
| **Pronunciation feedback** | OpenAI | GPT-4o-mini | Child-friendly pronunciation encouragement in Vietnamese | BAML `FastFallback` chain |
| **ASR (speech-to-text)** | OpenAI | Whisper (gpt-4o-transcribe) | Pronunciation judging for EN, VI, ZH | Direct Python API call |
| **TTS (text-to-speech)** | OpenAI | tts-1 / tts-1-hd | Word pronunciation playback for EN, VI, ZH | Direct Python API call |

> **BAML** defines two fallback chains: `VisionFallback` (GPT-4o → Gemini Flash → Claude Sonnet) for heavy vision tasks, and `FastFallback` (GPT-4o-mini → Gemini Flash) for lightweight tasks. All prompts, types, and provider configs are version-controlled in `.baml` files under `app/be/baml_src/`. See [ai.md § 2](./ai.md) for full BAML documentation.

> **OpenRouter** acts as a unified gateway to 100+ models (OpenAI, Anthropic, Google, Meta, etc.) with a single API key and billing. This gives us flexibility to switch models without code changes.

---

## 3. System component design

### 3.1 Capture Service (core loop)

The heart of SnapLearn. Handles the photo → AI → vocab card pipeline.

```
Client                    Backend                     AI Services
  │                          │                            │
  │  POST /api/capture       │                            │
  │  { image: base64/blob }  │                            │
  │ ─────────────────────►   │                            │
  │                          │  1. Send to OpenAI ────────►│
  │                          │     GPT-4o (vision prompt)  │
  │                          │                            │
  │                          │  2. Receive JSON ◄──────────│
  │                          │     { object_en, object_vi, │
  │                          │       object_zh, category,  │
  │                          │       confidence, ... }     │
  │                          │                            │
  │                          │  3. Save CapturedVocab     │
  │                          │     Update user XP          │
  │                          │     Check mission progress  │
  │                          │                            │
  │  ◄─────────────────────  │                            │
  │  { vocab_card, xp_delta, │                            │
  │    mission_update, ... }  │                            │
```

**Key design decisions:**
- Image is compressed client-side (max 1024px, JPEG 80% quality) before upload to reduce latency.
- The AI always returns ALL languages (EN + VI + ZH) regardless of child's selected language. Backend stores all; frontend filters.
- Vision inference goes through BAML (`b.IdentifyObject()` or `b.IdentifyObjectFiltered()`), which handles provider fallback and type-safe parsing automatically.

### 3.2 Speech Service

Handles pronunciation practice via the ASR-as-judge pattern.

```
Client                    Backend                    Speech Services
  │                          │                            │
  │  POST /api/pronounce     │                            │
  │  { audio: blob,          │                            │
  │    vocab_id: uuid,       │                            │
  │    language: 'en'|'vi' } │                            │
  │ ─────────────────────►   │                            │
  │                          │  1. Get expected word       │
  │                          │     from CapturedVocab     │
  │                          │                            │
  │                          │  2. Send audio to           │
  │                          │     OpenAI Whisper ────────►│
  │                          │     (language-specific)     │
  │                          │                            │
  │                          │  3. Receive transcript ◄────│
  │                          │                            │
  │                          │  4. Exact match check:      │
  │                          │     match → ★★★            │
  │                          │     no match → ★           │
  │                          │                            │
  │                          │  5. Update mastery_level    │
  │                          │     Update XP               │
  │                          │     Check evolution         │
  │                          │                            │
  │  ◄─────────────────────  │                            │
  │  { stars, mastery,        │                            │
  │    evolved, xp_delta }    │                            │
```

**Pronunciation matching:** Simple exact string comparison (case-insensitive, trimmed). No fuzzy matching — if Whisper transcribes the correct word, pronunciation is good enough. If it doesn't, the child retries. This keeps the logic simple and the bar pedagogically appropriate for 6–10 year-olds.

**Star rating:**
- **★★★ (3 stars):** Whisper transcript exactly matches expected word
- **★ (1 star):** Whisper transcript does not match (different word or failed transcription)
- After 3 attempts, the system moves on encouragingly

```
GET /api/tts/{vocab_id}/{language}
  → Returns cached audio file or generates via OpenAI TTS
  → Audio is cached to local filesystem for subsequent plays
```

### 3.3 Game Engine

Server-authoritative gamification logic. The client never calculates XP or levels — it receives the result.

**Responsibilities:**
- **XP calculation:** Points per capture, pronunciation bonus (+5), mission rewards
- **Level progression:** XP thresholds → level up → unlock features
- **Streak tracking:** Daily capture check, streak counter, multiplier at milestones (7, 14, 30 days)
- **Mission engine:** Generate daily/weekly missions based on child's uncaptured categories; track progress; expire old missions
- **Leaderboard:** Redis sorted sets for real-time ranking; periodic PostgreSQL snapshots; monthly reset

### 3.4 Auth & User Service

Two-tier authentication model: parents are full accounts; children are sub-profiles. Simple email/password auth with JWT tokens — no third-party auth provider.

```
Parent Account (email + password)
├── JWT access token (short-lived, 30 min)
├── JWT refresh token (long-lived, 7 days)
│
├── Child Profile 1
│   ├── name, avatar, target_language
│   ├── XP, level, streak
│   └── captured_vocab[]
│
└── Child Profile 2 (future: multi-child support)
```

**Registration flow:**
1. Parent submits email + password → account created immediately (no email verification needed)
2. Parent creates child profile(s) with name, avatar, target language
3. JWT tokens issued for all subsequent API calls

**Parent Gate flow:**
1. Child taps hidden settings icon (3-second hold)
2. Backend generates math puzzle (e.g., `17 + 6 = ?`)
3. Correct answer → 5-minute parent session token
4. Token required for all parent dashboard API calls

---

## 4. Data model (detailed)

### 4.1 Entity relationship diagram

```
┌──────────────┐     ┌──────────────────┐     ┌────────────────┐
│ ParentAccount│     │   ChildProfile    │     │ CapturedVocab  │
├──────────────┤     ├──────────────────┤     ├────────────────┤
│ id (PK)      │◄───┤ parent_id (FK)   │◄───┤ child_id (FK)  │
│ email        │     │ id (PK)          │     │ id (PK)        │
│ password_hash│     │ name             │     │ word_en        │
│ created_at   │     │ avatar_id        │     │ phonetic_en    │
│ settings     │     │ target_language  │     │ word_vi        │
│ (JSONB)      │     │ secondary_lang   │     │ word_zh        │
└──────────────┘     │ total_xp         │     │ pinyin         │
                     │ level            │     │ category       │
                     │ current_streak   │     │ rarity_tier    │
                     │ longest_streak   │     │ points_earned  │
                     │ streak_date      │     │ photo_url      │
                     │ daily_capture_ct │     │ mastery_en (0-5)│
                     │ created_at       │     │ mastery_vi (0-5)│
                     └──────────────────┘     │ mastery_zh (0-5)│
                                              │ evolved        │
                                              │ captured_at    │
                                              │ last_practiced │
                                              │ confidence     │
                                              │ source (cache/ │
                                              │   llm)         │
                                              └────────────────┘

┌────────────────┐     ┌───────────────────┐
│ Mission        │     │ LeaderboardEntry  │
├────────────────┤     ├───────────────────┤
│ id (PK)        │     │ id (PK)           │
│ child_id (FK)  │     │ child_id (FK)     │
│ type           │     │ period_start      │
│ description_vi │     │ scope             │
│ target_count   │     │ total_points      │
│ current_count  │     │ rank              │
│ reward_xp      │     │ category_points   │
│ reward_badge   │     │ (JSONB)           │
│ status         │     └───────────────────┘
│ expires_at     │
│ created_at     │     ┌───────────────────┐
└────────────────┘     │ ReferenceVocab    │
                       ├───────────────────┤
┌────────────────┐     │ id (PK)           │
│ Badge          │     │ word_en           │
├────────────────┤     │ phonetic_en       │
│ id (PK)        │     │ word_vi           │
│ child_id (FK)  │     │ word_zh           │
│ badge_type     │     │ pinyin            │
│ earned_at      │     │ category          │
└────────────────┘     │ difficulty_en     │
                       │ difficulty_vi     │
                       │ difficulty_zh     │
                       │ verified          │
                       │ source            │
                       │ capture_count     │
                       │ (global frequency)│
                       └───────────────────┘
```

### 4.2 Key indexes

```sql
-- Hot path: capture word lookup
CREATE INDEX idx_captured_vocab_child_word ON captured_vocab(child_id, word_en, word_vi);

-- Hot path: collection book by category
CREATE INDEX idx_captured_vocab_child_cat ON captured_vocab(child_id, category);

-- Leaderboard queries
CREATE INDEX idx_leaderboard_scope_period ON leaderboard_entry(scope, period_start, total_points DESC);

-- Mission expiry
CREATE INDEX idx_mission_child_status ON mission(child_id, status, expires_at);

-- Auth: email lookup
CREATE UNIQUE INDEX idx_parent_email ON parent_account(LOWER(email));
```

### 4.3 Redis data structures

```
# Real-time leaderboard (sorted set)
ZADD leaderboard:global:2026-03 {score} {child_id}
ZADD leaderboard:class:{class_id}:2026-03 {score} {child_id}

# Global capture frequency (for future rarity calculation)
ZINCRBY capture_frequency:global {1} {word_en_normalized}

# Rate limiting (per child, per day)
INCR ratelimit:capture:{child_id}:{date}
EXPIRE ratelimit:capture:{child_id}:{date} 86400

# TTS audio cache keys (local file paths)
SET tts:en:{word_hash} {local_file_path}
SET tts:vi:{word_hash} {local_file_path}
SET tts:zh:{word_hash} {local_file_path}

# Active session tracking
SET session:{child_id} {timestamp} EX 1800

# JWT refresh token tracking
SET refresh:{parent_id} {token_hash} EX 604800
```

---

## 5. API design

### 5.1 API routes overview

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register parent (email + password) | Public |
| `POST` | `/api/auth/login` | Login (email + password → JWT) | Public |
| `POST` | `/api/auth/refresh` | Refresh access token | Refresh token |
| `POST` | `/api/children` | Create child profile | Parent JWT |
| `GET` | `/api/children/{id}` | Get child profile + stats | Parent JWT |
| `PATCH` | `/api/children/{id}` | Update child settings | Parent JWT |
| `POST` | `/api/capture` | Submit photo for AI recognition | Parent JWT + child_id |
| `POST` | `/api/pronounce` | Submit audio for pronunciation check | Parent JWT + child_id |
| `GET` | `/api/tts/{vocab_id}/{lang}` | Get TTS audio for a word | Parent JWT + child_id |
| `GET` | `/api/collection` | Get child's vocab collection | Parent JWT + child_id |
| `GET` | `/api/collection/{category}` | Get vocab by category | Parent JWT + child_id |
| `GET` | `/api/vocab/{id}` | Get vocab card detail | Parent JWT + child_id |
| `GET` | `/api/missions` | Get active missions | Parent JWT + child_id |
| `POST` | `/api/missions/{id}/claim` | Claim mission reward | Parent JWT + child_id |
| `GET` | `/api/leaderboard/{scope}` | Get leaderboard rankings | Parent JWT + child_id |
| `GET` | `/api/profile` | Get child profile + badges | Parent JWT + child_id |
| `POST` | `/api/parent-gate/challenge` | Get math puzzle | Parent JWT + child_id |
| `POST` | `/api/parent-gate/verify` | Verify answer, get parent token | Parent JWT + child_id |
| `GET` | `/api/parent/dashboard` | Get parent dashboard data | Parent token |
| `GET` | `/api/parent/activity-feed` | Get child activity feed | Parent token |
| `PATCH` | `/api/parent/controls` | Update parental controls | Parent token |
| `GET` | `/api/parent/export` | Export vocab as CSV | Parent token |

### 5.2 Key request/response examples

**POST /api/auth/register**
```json
// Request
{
  "email": "parent@example.com",
  "password": "securepassword123"
}

// Response
{
  "parent_id": "uuid",
  "email": "parent@example.com",
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer"
}
```

**POST /api/capture**
```json
// Request
{
  "image": "<base64 encoded JPEG, max 1024px>",
  "location_hint": "kitchen"  // optional, from mission context
}

// Response (success)
{
  "status": "new_capture",
  "vocab_card": {
    "id": "uuid",
    "word_en": "cat",
    "phonetic_en": "/kæt/",
    "word_vi": "con mèo",
    "word_zh": "猫",
    "pinyin": "māo",
    "category": "animals",
    "photo_url": "/uploads/photos/abc123.jpg",
    "fun_fact_vi": "Mèo có thể ngủ 16 giờ mỗi ngày!",
    "mastery_en": 0,
    "mastery_vi": 0,
    "mastery_zh": 0,
    "evolved": false
  },
  "xp_earned": 25,
  "total_xp": 167,
  "level_up": null,
  "mission_update": {
    "mission_id": "uuid",
    "new_count": 2,
    "target_count": 3,
    "completed": false
  },
  "tts_urls": {
    "en": "/api/tts/uuid/en",
    "vi": "/api/tts/uuid/vi",
    "zh": "/api/tts/uuid/zh"
  }
}

// Response (low confidence)
{
  "status": "low_confidence",
  "message_vi": "Hmm, mình chưa nhìn rõ lắm. Lại gần hơn nha!",
  "confidence": 0.45
}
```

**POST /api/pronounce**
```json
// Request
{
  "vocab_id": "uuid",
  "language": "en",
  "audio": "<base64 encoded WAV/WebM>"
}

// Response
{
  "stars": 3,
  "transcript": "cat",
  "expected": "cat",
  "match_type": "exact",
  "mastery_en": 4,
  "xp_earned": 5,
  "evolved": false,
  "attempts_remaining": 2
}
```

---

## 6. Frontend architecture

### 6.1 Directory structure

```
src/
├── app/                           # Next.js App Router
│   ├── layout.tsx                 # Root layout + providers
│   ├── page.tsx                   # Camera screen (default home)
│   ├── onboarding/
│   │   └── page.tsx               # 4-slide onboarding flow
│   ├── collection/
│   │   ├── page.tsx               # Category grid
│   │   └── [category]/
│   │       └── page.tsx           # Vocab grid for a category
│   ├── vocab/
│   │   └── [id]/
│   │       └── page.tsx           # Single word detail + practice
│   ├── quests/
│   │   └── page.tsx               # Mission list
│   ├── leaderboard/
│   │   └── page.tsx               # Rankings (class/friends/global)
│   ├── profile/
│   │   └── page.tsx               # Child profile + badges
│   ├── parent/
│   │   ├── dashboard/
│   │   │   └── page.tsx           # Parent dashboard
│   │   └── login/
│   │       └── page.tsx           # Parent login
│   ├── auth/
│   │   ├── login/
│   │   │   └── page.tsx           # Parent login
│   │   └── register/
│   │       └── page.tsx           # Parent registration
│   └── manifest.json              # PWA manifest
│
├── components/
│   ├── ui/                        # Reusable primitives (Button, Card, Badge, ...)
│   ├── capture/                   # CaptureButton, Viewfinder, RevealCard
│   ├── pronunciation/             # PTTButton, StarRating, SayItChallenge
│   ├── navigation/                # BottomNav, TopHUD, MissionOverlay
│   ├── gamification/              # XPCounter, LevelBadge, StreakFlame, Confetti
│   └── parent/                    # ParentGate, DashboardCharts, ControlPanel
│
├── hooks/
│   ├── useCamera.ts               # Camera stream management
│   ├── useAudioRecorder.ts        # PTT audio recording
│   ├── useCapture.ts              # Capture flow orchestration
│   ├── usePronunciation.ts        # Pronunciation practice flow
│   ├── useTTS.ts                  # Text-to-speech playback
│   └── useAuth.ts                 # JWT auth state + refresh
│
├── stores/
│   ├── userStore.ts               # Child profile, XP, level, streak
│   ├── collectionStore.ts         # Captured vocab, categories
│   ├── missionStore.ts            # Active missions, progress
│   └── audioStore.ts              # Sound effects state
│
├── services/
│   ├── api.ts                     # HTTP client setup + JWT interceptor
│   ├── captureApi.ts              # /api/capture calls
│   ├── speechApi.ts               # /api/pronounce + /api/tts calls
│   ├── gameApi.ts                 # Missions, leaderboard, profile calls
│   └── parentApi.ts               # Parent dashboard API calls
│
├── lib/
│   ├── imageCompression.ts        # Client-side image resize + compress
│   ├── audioUtils.ts              # Audio blob processing
│   └── constants.ts               # XP values, category icons
│
├── assets/
│   ├── sounds/                    # SFX (capture click, chime, confetti, etc.)
│   ├── illustrations/             # Onboarding slides, mascot, error states
│   └── fonts/                     # Outfit font files
│
└── middleware.ts                   # Next.js middleware (auth redirect, etc.)
```

### 6.2 Data flow

All data is fetched from the server on each request. The frontend does **not** maintain an offline cache — an internet connection is always required for the core experience (camera capture, pronunciation practice). Zustand stores hold in-memory state for the current session only.

| Data | Storage | Strategy |
|---|---|---|
| User profile / XP | Zustand (in-memory) | Fetched on app load, updated on server responses |
| Captured vocab cards | Zustand (in-memory) | Fetched from API when viewing collection |
| Mission progress | Zustand (in-memory) | Fetched from API when viewing quests |
| Leaderboard | Direct API call | No caching, always live |
| Sound effects | Browser Cache API (SW) | Precached on install via service worker |
| Static assets | Browser Cache API (SW) | Precached on install, stale-while-revalidate |

---

## 7. Security & privacy

### 7.1 Authentication & authorization

- **Parent accounts** use email + password (bcrypt-hashed). No email verification required at registration.
- **JWT tokens:** Access token (30-minute TTL) + refresh token (7-day TTL). Access token is sent in `Authorization: Bearer` header.
- **Child profiles** are NOT separate auth accounts — they are records linked to a parent account
- All child API requests use the parent's JWT, with a `X-Child-Id` header to identify which child profile
- **Parent Gate** issues a short-lived (5-minute) session token for parent dashboard access
- **Rate limiting:** 50 captures/day per child (prevents abuse), 100 pronunciation attempts/day

### 7.2 Data privacy (COPPA-aligned)

- **No PII from children** collected beyond first name and avatar choice
- **Photo storage is opt-out by default** — photos are processed by the AI and discarded unless parent explicitly enables storage
- **No social features** — children cannot message, share photos, or connect with unknown users
- **Leaderboard anonymization** — display names only, no profile photos on public leaderboards
- **Data export** — parents can download full vocab CSV at any time
- **Data deletion** — parents can permanently delete all child data

### 7.3 Content safety

1. **No free-form AI chat** — all AI interactions are structured (photo → word identification only)

---

## 8. Performance & latency budget

Target: **< 4 seconds** from capture button tap to card reveal on a local/LAN connection.

| Step | Target | Optimization |
|---|---|---|
| Image capture + compress | < 200ms | Client-side resize to 1024px, JPEG 80% |
| Upload to server | < 100ms | Local network, compressed image ~100-200KB |
| OpenAI GPT-4o call | < 3000ms | Streaming response |
| DB writes (vocab + XP) | < 100ms | Async, non-blocking for response |
| Response to client | < 50ms | JSON response ~2KB |
| **Total** | **< 3.5s** | |

**TTS latency:** Novel words: OpenAI TTS ~500ms, cached to local filesystem for subsequent plays.

**ASR latency:** OpenAI Whisper API = 1-3s. Acceptable for pronunciation practice flow (child releases PTT button → 1-3s wait → stars appear).

---

## 9. Deployment architecture

### 9.1 Local development (everything-in-one)

```
┌──────────────────────────────────────────────────────────────┐
│                    LOCAL MACHINE                              │
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌───────┐  ┌─────────┐  │
│  │ Next.js     │  │ FastAPI     │  │Postgres│  │  Redis  │  │
│  │ (port 3000) │  │ (port 8000) │  │ (5432) │  │ (6379)  │  │
│  │             │  │             │  │        │  │         │  │
│  │ PWA client  │◄►│ API server  │◄►│   DB   │  │  Cache  │  │
│  └─────────────┘  │             │  └────────┘  └─────────┘  │
│                   │ ./uploads/  │                            │
│                   │ ./tts_cache/│                            │
│                   │ ./logs/     │                            │
│                   └─────────────┘                            │
│                          │                                   │
│              ┌───────────┴───────────┐                       │
│              │                       │                       │
│              ▼                       ▼                       │
│     ┌──────────────┐       ┌──────────────┐                 │
│     │ OpenAI API   │       │ OpenRouter   │                 │
│     │ (GPT-4o,     │       │ (fallback    │                 │
│     │  Whisper,    │       │  models)     │                 │
│     │  TTS)        │       │              │                 │
│     └──────────────┘       └──────────────┘                 │
└──────────────────────────────────────────────────────────────┘
```

### 9.2 Docker Compose setup

```yaml
# docker-compose.yml
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    env_file: .env
    volumes:
      - ./backend/app:/app/app
      - ./data/uploads:/app/uploads
      - ./data/tts_cache:/app/tts_cache
      - ./data/logs:/app/logs
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: snaplearn
      POSTGRES_USER: snaplearn
      POSTGRES_PASSWORD: dev_password
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  pgdata:
```

### 9.3 Environment strategy

| Environment | Purpose | Infrastructure |
|---|---|---|
| **Local dev** | Development + testing | Docker Compose (all services on one machine) |
| **Production** | Beta users (if needed) | Same Docker Compose on a cloud VM (e.g., DigitalOcean, Hetzner) |

### 9.4 CI/CD pipeline

```
Push to main ──► GitHub Actions
                    │
                    ├── Lint + Type check (frontend: ESLint/tsc, backend: ruff/mypy)
                    ├── Unit tests (pytest + vitest/jest)
                    ├── Build frontend (Next.js)
                    └── Build backend (Docker)
```

---

## 10. Scalability considerations (beyond POC)

The POC is designed for **100 beta users** running on a single machine. Here's what changes at scale:

| Scale point | Challenge | Solution |
|---|---|---|
| **500+ users** | OpenAI API costs | Switch to cheaper models via OpenRouter |
| **1,000+ users** | Single machine bottleneck | Move to cloud VM with more CPU/RAM, or split frontend/backend to separate servers |
| **5,000+ users** | Database load | Managed Postgres (e.g., Supabase, Railway), read replicas |
| **10,000+ users** | File storage limits | Migrate local files to S3/CloudFlare R2 |
| **50,000+ users** | Leaderboard computation | Dedicated Redis instance, periodic batch ranking |
| **100,000+ users** | Full re-architecture | Kubernetes, message queue, microservices split |

---

## 11. Sprint-to-architecture mapping

How the architecture rolls out across the 12-week POC:

| Sprint | Weeks | Architecture components |
|---|---|---|
| **1** | 1-2 | Next.js PWA scaffold, Camera API, FastAPI skeleton, OpenAI GPT-4o integration, basic capture endpoint, Postgres schema (User, CapturedVocab), email/password auth with JWT |
| **2** | 3-4 | Speech service (OpenAI Whisper + TTS), pronunciation endpoint, audio recording/playback on frontend, star rating system, local TTS caching |
| **3** | 5-6 | Collection Book UI + API, category queries, vocab detail, card mastery system |
| **4** | 7-8 | Mission engine, leaderboard (Redis sorted sets), level progression, XP system, bottom navigation |
| **5** | 9-10 | Parent dashboard, Parent Gate, parental controls, activity feed |
| **6** | 11-12 | Beta feedback iteration, performance optimization, anti-gaming tuning, logging review |

---

*This document should be read alongside [product_vision.md](./product_vision.md), [frontend_plan.md](./frontend_plan.md), [backend.md](./backend.md), and [ai.md](./ai.md).*
