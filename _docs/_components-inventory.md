# SnapLearn — Components Inventory

**System components: inputs, outputs, and processing scope**
Version 1.0 | March 2026

---

## Overview

This document catalogues all system components across domains: AI Pipeline, Backend Services, Game Engine, Data Layer, Frontend, Infrastructure, and Cross-Cutting Concerns.

**Design principles:**
- **Server-authoritative**: XP, levels, mission progress calculated server-side only
- **BAML-orchestrated AI**: All LLM inference via BAML; direct APIs for Whisper/TTS only
- **Language-agnostic storage**: Backend stores all 3 languages; frontend filters by child's selection
- **Local-first storage**: Photos and TTS cached locally, not cloud storage

---

## 1. AI Pipeline (BAML-Orchestrated + Direct APIs)

### 1.1 BAML Orchestrator

| Aspect | Description |
|--------|-------------|
| **Expected Input** | Function call with typed parameters (e.g., `b.IdentifyObject(photo=image_bytes)`) |
| **Expected Output** | Pydantic v2 model (e.g., `VisionResult`, `RarityResult`) |
| **Processing Scope** | Routes to configured LLM providers, handles fallback chains (GPT-4o → Gemini → Claude), validates output against schema, retries on failure |
| **Source File** | `baml_src/clients.baml` (provider config), `baml_client/` (generated) |

---

### 1.2 Vision Pipeline

| Aspect | Description |
|--------|-------------|
| **Expected Input** | JPEG image bytes (max 1024px, compressed client-side) |
| **Expected Output** | `VisionResult`: `{object_en, object_vi, object_zh, phonetic_en, pinyin, category, difficulty_en/vi/zh, fun_fact_vi, example_sentences, confidence, description_vi}` |
| **Processing Scope** | Per-photo. BAML `IdentifyObject` or `IdentifyObjectFiltered`. Returns all 3 languages regardless of child's selection. Low confidence (<0.7) triggers retry prompt. |
| **Source File** | `baml_src/vision.baml` |
| **Fallback Chain** | GPT-4o → Gemini Flash 2.5 → Claude Sonnet 4 |

---

### 1.3 Image Safety Checker

| Aspect | Description |
|--------|-------------|
| **Expected Input** | JPEG image bytes + filter_level ("standard" or "strict") |
| **Expected Output** | `SafetyCheckResult`: `{status: "safe" \| "blocked", reason?, confidence}` |
| **Processing Scope** | Pre-flight check before vision. BAML `CheckImageSafety`. Blocks inappropriate content, person detection. |
| **Source File** | `baml_src/safety.baml` |

---

### 1.4 Word Safety Checker

| Aspect | Description |
|--------|-------------|
| **Expected Input** | `{word_en, word_vi, word_zh, category, filter_level}` |
| **Expected Output** | `SafetyCheckResult`: `{status, reason?, confidence}` |
| **Processing Scope** | Post-flight check after vision. BAML `CheckWordSafety`. Validates AI-identified words for appropriateness. |
| **Source File** | `baml_src/safety.baml` |

---

### 1.5 ASR (Automatic Speech Recognition)

| Aspect | Description |
|--------|-------------|
| **Expected Input** | Audio blob (WebM/WAV, max 5 seconds, PTT capture) + language hint |
| **Expected Output** | Transcription string |
| **Processing Scope** | Per-pronunciation attempt. Direct OpenAI Whisper API call. Exact match check against expected word. Binary result: match (★★★) or no match (★). |
| **Provider** | OpenAI Whisper (`whisper-1`) |
| **Latency Target** | < 3 seconds |

---

### 1.6 TTS (Text-to-Speech)

| Aspect | Description |
|--------|-------------|
| **Expected Input** | Word string + language code (en/vi/zh) |
| **Expected Output** | MP3 audio file |
| **Processing Scope** | First call: generates via OpenAI TTS API, caches to local filesystem. Subsequent calls: serves from cache. Voice: `nova` for all languages with language-specific speed settings (en: 0.85, vi: 0.80, zh: 0.75). |
| **Provider** | OpenAI TTS (`tts-1`) |
| **Cache Location** | `./tts_cache/{en,vi,zh}/` |

---

### 1.7 Pronunciation Feedback Generator

| Aspect | Description |
|--------|-------------|
| **Expected Input** | `{target_word, transcribed_text, language, attempt_number}` |
| **Expected Output** | `PronunciationResult`: `{transcribed_text, target_word, is_match, stars, feedback_vi}` |
| **Processing Scope** | Per-pronunciation attempt. BAML `GeneratePronunciationFeedback`. Child-friendly Vietnamese encouragement. |
| **Source File** | `baml_src/speech.baml` |

---

### 1.8 Pronunciation Hint Generator

| Aspect | Description |
|--------|-------------|
| **Expected Input** | `{word, language}` |
| **Expected Output** | Short pronunciation tip string (Vietnamese) |
| **Processing Scope** | On-demand when child needs help. BAML `GeneratePronunciationHint`. |
| **Source File** | `baml_src/speech.baml` |

---

### 1.9 Rarity Classifier

| Aspect | Description |
|--------|-------------|
| **Expected Input** | `RarityInput`: `{object_en, category, difficulty_en/vi/zh, capture_pct?}` |
| **Expected Output** | `RarityResult`: `{rarity: common\|uncommon\|rare\|epic\|legendary, base_xp, reasoning}` |
| **Processing Scope** | Per capture. BAML `ClassifyRarity`. Hybrid: linguistic difficulty + global capture frequency. Determines XP awarded (10-250). |
| **Source File** | `baml_src/rarity.baml` |

---

### 1.10 Image Preprocessor

| Aspect | Description |
|--------|-------------|
| **Expected Input** | Raw image bytes from camera |
| **Expected Output** | `ProcessedImage`: `{data, media_type, width, height, size_bytes}` |
| **Processing Scope** | Client-side + server-side. Validate format (JPEG/PNG/WebP), strip EXIF (privacy), resize to max 1024px (maintain aspect ratio), compress to JPEG 80%, validate < 2MB. |
| **Source File** | `app/utils/image.py`, `src/lib/imageCompression.ts` |

---

### 1.11 Audio Preprocessor

| Aspect | Description |
|--------|-------------|
| **Expected Input** | Raw audio blob from MediaRecorder |
| **Expected Output** | `ProcessedAudio`: validated, normalized, trimmed |
| **Processing Scope** | Validate duration (0.3s - 5s), normalize volume, trim silence from start/end, validate < 1MB. |
| **Source File** | `app/utils/audio.py` |

---

## 2. Backend Services

### 2.1 Capture Service

| Aspect | Description |
|--------|-------------|
| **Expected Input** | `{child_id, image_data}` |
| **Expected Output** | `CaptureResult`: `{status, vocab_card?, xp_earned, total_xp, level_up?, mission_update?, tts_urls}` |
| **Processing Scope** | Orchestrates entire capture pipeline: image validation → safety check (BAML) → vision (BAML) → word safety (BAML) → rarity (BAML) → save vocab → update game state → pre-cache TTS (async). Returns low-confidence message if AI unsure (< 0.7). |
| **Source File** | `app/services/capture_service.py` |
| **API Endpoint** | `POST /api/capture` |

---

### 2.2 Speech Service

| Aspect | Description |
|--------|-------------|
| **Expected Input** | `{vocab_id, language, audio_bytes}` |
| **Expected Output** | `PronunciationResult`: `{stars, transcript, expected, match_type, mastery_level, evolved, xp_earned}` |
| **Processing Scope** | Gets expected word from DB → sends audio to Whisper (direct API) → exact match check → update mastery (only on 3 stars) → check evolution (5 matches across sessions) → award XP bonus (+5 for 3 stars). |
| **Source File** | `app/services/speech_service.py` |
| **API Endpoint** | `POST /api/pronounce` |

---

### 2.3 TTS Service

| Aspect | Description |
|--------|-------------|
| **Expected Input** | `{word, language}` |
| **Expected Output** | Local file path to MP3 audio |
| **Processing Scope** | Check Redis for cached path (`tts:{lang}:{hash}`) → serve from local filesystem if exists → otherwise generate via OpenAI TTS → save to `./tts_cache/{lang}/` → cache path in Redis (90-day TTL). |
| **Source File** | `app/services/tts_service.py` |
| **API Endpoint** | `GET /api/tts/{vocab_id}/{language}` |

---

### 2.4 Game Service

| Aspect | Description |
|--------|-------------|
| **Expected Input** | Game events (capture, pronunciation, mission complete) |
| **Expected Output** | `GameUpdate`: `{xp_earned, total_xp, level_up?, streak, mission_update?}` |
| **Processing Scope** | XP calculation (rarity-based + bonuses), level progression (threshold-based), streak tracking (daily check), evolution check (mastery 5), leaderboard updates (Redis). Server-authoritative — client never computes game state. |
| **Source File** | `app/services/game_service.py` |
| **Dependencies** | Mission Service, Leaderboard Service |

---

### 2.5 Mission Service

| Aspect | Description |
|--------|-------------|
| **Expected Input** | `{child_id}` for generation; capture/pronunciation events for progress |
| **Expected Output** | Mission objects; `MissionUpdate` progress updates |
| **Processing Scope** | Generate daily (2-3) / weekly (1-2) missions at midnight (personalized based on collection gaps). Track progress on capture/pronunciation events. Expire old missions. Award XP + badges on completion. |
| **Source File** | `app/services/mission_service.py` |
| **API Endpoints** | `GET /api/missions`, `POST /api/missions/{id}/claim` |

---

### 2.6 Leaderboard Service

| Aspect | Description |
|--------|-------------|
| **Expected Input** | `{child_id, points}` for updates; `{scope, child_id}` for queries |
| **Expected Output** | `LeaderboardResponse`: `{entries[], my_rank, my_score, reset_date}` |
| **Processing Scope** | Redis sorted sets for real-time rankings. Supports scopes: global, class, friends. Monthly snapshot to PostgreSQL for history. Reset on 1st of each month. |
| **Source File** | `app/services/leaderboard_service.py` |
| **API Endpoint** | `GET /api/leaderboard/{scope}` |

---

### 2.7 Auth Service

| Aspect | Description |
|--------|-------------|
| **Expected Input** | `{email, password}` for register/login; refresh_token for refresh |
| **Expected Output** | `TokenResponse`: `{parent_id, email, access_token, refresh_token, children[]}` |
| **Processing Scope** | Email/password auth (no verification required). JWT tokens: access (30 min TTL), refresh (7 days TTL). bcrypt password hashing. Parent accounts with child sub-profiles. Parent Gate math puzzle for parent dashboard access. |
| **Source File** | `app/services/auth_service.py` |
| **API Endpoints** | `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/refresh` |

---

### 2.8 Storage Service

| Aspect | Description |
|--------|-------------|
| **Expected Input** | File bytes + type (photo/TTS) |
| **Expected Output** | Local file URL |
| **Processing Scope** | Save to `./uploads/photos/` (opt-in) or `./tts_cache/`. Serve via FastAPI static files. Privacy-first: photo storage disabled by default. |
| **Source File** | `app/services/storage_service.py` |

---

## 3. Game Engine

### 3.1 XP Calculator

| Aspect | Description |
|--------|-------------|
| **Expected Input** | `{action_type, rarity_tier?, is_duplicate?, stars?}` |
| **Expected Output** | XP points earned |
| **Processing Scope** | Rarity-based points (Common: 10, Uncommon: 25, Rare: 50, Epic: 100, Legendary: 250). Duplicate penalty: 25% of original. Pronunciation bonus: +5 for 3 stars. Mission rewards: 50-500. Evolution bonus: +50. |
| **Constants** | `app/utils/constants.py` |

---

### 3.2 Level Progression

| Aspect | Description |
|--------|-------------|
| **Expected Input** | Total XP |
| **Expected Output** | Level (1-50) + title + unlocks |
| **Processing Scope** | Threshold-based progression: L1 (0 XP), L5 (500 XP), L10 (2000 XP), L20 (8000 XP), L35 (25000 XP), L50 (60000 XP). Titles: Beginner Explorer → Word Collector → Vocab Hunter → Language Scout → Word Master → Polyglot Champion. Unlocks features at milestones. |
| **Constants** | `app/utils/constants.py` |

---

### 3.3 Streak Tracker

| Aspect | Description |
|--------|-------------|
| **Expected Input** | `{child_id, capture_date}` |
| **Expected Output** | `{current_streak, longest_streak, multiplier?}` |
| **Processing Scope** | Daily check: if captured today after yesterday, increment streak; else reset to 1. Track longest streak. Streak bonuses (multipliers) at milestones: 7 days, 14 days, 30 days. Reset if no capture yesterday. |
| **Source File** | `app/services/game_service.py` |

---

### 3.4 Mastery & Evolution System

| Aspect | Description |
|--------|-------------|
| **Expected Input** | `{vocab_id, stars}` from pronunciation |
| **Expected Output** | `{mastery_level (0-5), evolved: bool, unlocks?: {fun_fact, example_sentence}}` |
| **Processing Scope** | Mastery +1 on 3-star pronunciation (max 5). Evolution at mastery 5 (requires 5 perfect pronunciations across different sessions). Unlocks: fun fact + example sentence + visual upgrade (card glow). |
| **Source File** | `app/services/game_service.py` |

---

### 3.5 Mission Generator

| Aspect | Description |
|--------|-------------|
| **Expected Input** | `{child_id, collection_gaps}` |
| **Expected Output** | `Mission[]` (daily: 2-3, weekly: 1-2) |
| **Processing Scope** | Template-based + personalization. Types: daily (color/category targets), weekly (location/category), category challenge (complete page), diversity (multiple categories), pronunciation (evolve cards). Refresh at midnight UTC+7. Expire old missions. |
| **Source File** | `app/services/mission_service.py` |
| **Templates** | `MISSION_TEMPLATES` in mission_service.py |

---

## 4. Data Layer

### 4.1 User Profile Store

| Aspect | Description |
|--------|-------------|
| **Expected Input** | Parent account data / Child profile data |
| **Expected Output** | `ParentAccount` / `ChildProfile` entity |
| **Processing Scope** | CRUD operations. Parent: email, password_hash, settings (JSONB). Child: name, avatar_id, target_language ('en' \| 'zh'), secondary_language (nullable), total_xp, level, current_streak, longest_streak, streak_date, daily_capture_count. |
| **Source File** | `app/models/parent_account.py`, `app/models/child_profile.py` |
| **Table** | `parent_account`, `child_profile` |

---

### 4.2 Vocab Collection Store

| Aspect | Description |
|--------|-------------|
| **Expected Input** | `{child_id, vocab_data from Vision}` |
| **Expected Output** | `CapturedVocab` entity |
| **Processing Scope** | Store all 3 languages per capture. Track mastery levels (0-5) per language (`mastery_en`, `mastery_vi`, `mastery_zh`). Category assignment. Rarity tier. Photo URL (opt-in). Fun fact, example sentences. Confidence score. Source ('llm'). Unique constraint: (child_id, word_en, word_vi). |
| **Source File** | `app/models/captured_vocab.py` |
| **Table** | `captured_vocab` |
| **Indexes** | `idx_captured_vocab_child_word`, `idx_captured_vocab_child_cat` |

---

### 4.3 Mission Store

| Aspect | Description |
|--------|-------------|
| **Expected Input** | Mission generation / progress events |
| **Expected Output** | `Mission` entities |
| **Processing Scope** | Store active/completed/expired missions. Track progress (current_count / target_count). Match criteria as JSONB (e.g., `{"category": "animals"}`). Reward XP and badge. Status: active, completed, claimed, expired. Auto-expire based on `expires_at`. |
| **Source File** | `app/models/mission.py` |
| **Table** | `mission` |
| **Indexes** | `idx_mission_child_status` |

---

### 4.4 Badge Store

| Aspect | Description |
|--------|-------------|
| **Expected Input** | Badge earn events |
| **Expected Output** | `Badge` entities |
| **Processing Scope** | Track earned badges per child. Types: mission completion, category mastery, streak milestones, evolution achievements. Badge name in Vietnamese. Unique constraint: (child_id, badge_type). |
| **Source File** | `app/models/badge.py` |
| **Table** | `badge` |

---

### 4.5 Leaderboard Store

| Aspect | Description |
|--------|-------------|
| **Expected Input** | Point updates / query requests |
| **Expected Output** | Rankings + snapshots |
| **Processing Scope** | Redis sorted sets for real-time rankings (`leaderboard:{scope}:{period}`). PostgreSQL snapshots for monthly history (`leaderboard_snapshot`). Scope: global, class, friends. Category breakdown (JSONB). Monthly reset. |
| **Source File** | `app/models/leaderboard_entry.py`, `app/services/leaderboard_service.py` |
| **Redis Keys** | `leaderboard:global:{period}`, `leaderboard:class:{class_id}:{period}` |

---

### 4.6 Activity Log Store

| Aspect | Description |
|--------|-------------|
| **Expected Input** | Game events (capture, pronunciation, mission, level_up, evolution) |
| **Expected Output** | `ActivityLog` entries |
| **Processing Scope** | Append-only log for parent dashboard. Event type + flexible JSONB payload (`event_data`). Used for activity feed. Indexed by (child_id, created_at DESC). |
| **Source File** | `app/models/activity_log.py` (implied) |
| **Table** | `activity_log` |
| **Indexes** | `idx_activity_child_time` |

---

## 5. Frontend Components

### 5.1 Camera Screen

| Aspect | Description |
|--------|-------------|
| **Expected Input** | Camera stream, capture button press |
| **Expected Output** | Image blob for upload → Reveal Card overlay |
| **Processing Scope** | Live camera feed (rear camera, `getUserMedia`). Top HUD (level badge, XP counter, streak flame). Mission overlay (glassmorphism card). Capture button (72px, loading spinner during AI). Bottom navigation. Error states: permission denied, no internet. |
| **Source File** | `src/app/page.tsx` |
| **Hooks** | `useCamera.ts`, `useCapture.ts` |

---

### 5.2 Reveal Card Overlay

| Aspect | Description |
|--------|-------------|
| **Expected Input** | `CaptureResult` from API |
| **Expected Output** | Display vocab card → pronunciation attempt |
| **Processing Scope** | Slide-up animation with spring physics (damping 25, stiffness 200). Rarity-based glow effects (Common: white shimmer → Legendary: gold particles + rotation). Trilingual display (VI large, EN/ZH with labels). PTT button for pronunciation. Star rating display (☆☆☆ → ★★★). TTS auto-play on reveal (VI → target language). |
| **Source File** | `src/components/capture/RevealCard.tsx` |
| **Animation** | Framer Motion spring |

---

### 5.3 Collection Screen

| Aspect | Description |
|--------|-------------|
| **Expected Input** | Collection data from API (`GET /api/collection`) |
| **Expected Output** | Category grid → Vocab grid navigation |
| **Processing Scope** | Category tiles (2 columns) with progress bars (captured/total). Icons: emoji or illustrations (🐾 animals, 🍎 food, 🌿 nature, 🏫 school, 🏠 home, 🚗 vehicles). Silhouette cards for undiscovered words ("?"). Mastery stars per card. Tap → Vocab Detail. Category completion badge (Master ✨). |
| **Source File** | `src/app/collection/page.tsx`, `src/app/collection/[category]/page.tsx` |
| **Store** | `collectionStore.ts` |

---

### 5.4 Vocab Detail Screen

| Aspect | Description |
|--------|-------------|
| **Expected Input** | `vocab_id` |
| **Expected Output** | Full card details → pronunciation practice |
| **Processing Scope** | Photo display with rarity glow. Trilingual text (VI: 28px bold, EN/ZH with 🔊 TTS buttons). Mastery levels per language (★ display). Evolution progress bar (●●●○○ 3/5). Locked sections: fun fact, example sentence (🔓 after evolution). Practice button → SayItChallenge. |
| **Source File** | `src/app/vocab/[id]/page.tsx` |

---

### 5.5 Quest Screen

| Aspect | Description |
|--------|-------------|
| **Expected Input** | Mission data from API (`GET /api/missions`) |
| **Expected Output** | Mission list → claim rewards |
| **Processing Scope** | Sections: Today, This Week, Category Challenges. Mission cards: icon + description (Vietnamese) + progress bar + reward preview (XP + badge). Visual states: active (white), completed (Mint Green), claimed (gray, 60% opacity). Claim button on completion. |
| **Source File** | `src/app/quests/page.tsx` |
| **Store** | `missionStore.ts` |

---

### 5.6 Leaderboard Screen

| Aspect | Description |
|--------|-------------|
| **Expected Input** | `{scope, child_id}` from API (`GET /api/leaderboard/{scope}`) |
| **Expected Output** | Ranked list + user's position |
| **Processing Scope** | Tab bar: Class / Friends / Global. Top 3 podium display (crown for #1, medals for #2/#3). Ranked list below (avatar + name + points). Sticky bar at bottom for user's rank. Reset countdown timer. Monthly reset. |
| **Source File** | `src/app/leaderboard/page.tsx` |

---

### 5.7 Profile Screen

| Aspect | Description |
|--------|-------------|
| **Expected Input** | Child profile data from API (`GET /api/profile`) |
| **Expected Output** | Stats display → Parent Gate |
| **Processing Scope** | Avatar (tròn, gradient border by level) + name + level badge. Stats grid (3 columns): total words, streak, rare cards. Badge showcase (earned: bright, locked: gray 🔒). Favorite category. Hidden parent gate: 3-second hold on ⚙️ icon (32px, gray). |
| **Source File** | `src/app/profile/page.tsx` |

---

### 5.8 Parent Gate

| Aspect | Description |
|--------|-------------|
| **Expected Input** | 3-second hold on settings icon |
| **Expected Output** | Math puzzle → parent token on success |
| **Processing Scope** | API call: `POST /api/parent-gate/challenge` → receive puzzle (e.g., "17 + 6 = ?"). User submits answer: `POST /api/parent-gate/verify`. On success: 5-minute parent session token. Required for all parent dashboard API calls. Child-friendly failure message: "Hỏi bố mẹ nhé! 😊". |
| **Source File** | `src/components/parent/ParentGate.tsx` |
| **API Endpoints** | `POST /api/parent-gate/challenge`, `POST /api/parent-gate/verify` |

---

### 5.9 Parent Dashboard

| Aspect | Description |
|--------|-------------|
| **Expected Input** | Parent token, child_id |
| **Expected Output** | Analytics + controls UI |
| **Processing Scope** | Overview stats (words, streak, level, XP). Progress charts: line chart (words per week), pie chart (category distribution), bar chart (rarity distribution), histogram (pronunciation mastery levels). Activity feed (chronological). Parental controls: daily time limit slider, language toggles, photo storage toggle, leaderboard visibility. Data export (CSV download). Logout button. |
| **Source File** | `src/app/parent/dashboard/page.tsx` |
| **API Endpoints** | `GET /api/parent/dashboard`, `GET /api/parent/activity-feed`, `PATCH /api/parent/controls`, `GET /api/parent/export` |
| **Charts** | Recharts |

---

### 5.10 Onboarding Flow

| Aspect | Description |
|--------|-------------|
| **Expected Input** | First launch detection (localStorage) |
| **Expected Output** | User setup → Camera screen |
| **Processing Scope** | 4-slide carousel (swipe or tap "Next"): 1) Welcome, 2) Capture concept, 3) Pronunciation concept, 4) Collection concept. Final slide: "🚀 Bắt đầu khám phá!" button. Language selection (EN 🇬🇧 / ZH 🇨🇳). Avatar picker (6 animal options). Skip on subsequent launches (persist flag to localStorage). |
| **Source File** | `src/app/onboarding/page.tsx` |

---

## 6. Infrastructure

### 6.1 PostgreSQL Database

| Aspect | Description |
|--------|-------------|
| **Expected Input** | SQL queries from services (via SQLAlchemy async) |
| **Expected Output** | Persistent data storage |
| **Processing Scope** | Relational data: `parent_account`, `child_profile`, `captured_vocab`, `mission`, `badge`, `leaderboard_snapshot`, `activity_log`. JSONB for flexible fields (settings, match_criteria, event_data, category_points). Indexed hot paths. Alembic migrations. |
| **Source File** | `app/db/session.py`, `app/db/migrations/` |
| **Version** | PostgreSQL 16 |

---

### 6.2 Redis Cache

| Aspect | Description |
|--------|-------------|
| **Expected Input** | Key-value operations (GET, SET, ZINCRBY, ZREVRANGE, etc.) |
| **Expected Output** | Cached data / sorted set rankings |
| **Processing Scope** | Leaderboard sorted sets (`leaderboard:{scope}:{period}`). TTS cache key → local file path (`tts:{lang}:{hash}`). Rate limiting counters with daily TTL (`ratelimit:capture:{child_id}:{date}`). Session tracking (`session:{child_id}`). Refresh token tracking (`refresh:{parent_id}`). Global capture frequency for rarity (`capture_frequency:global`). |
| **Source File** | `app/db/redis.py` |
| **Version** | Redis 7 |

---

### 6.3 Local File Storage

| Aspect | Description |
|--------|-------------|
| **Expected Input** | File writes from Storage Service / TTS Service |
| **Expected Output** | File URLs for serving |
| **Processing Scope** | `./uploads/photos/` for captured images (opt-in, privacy-first). `./tts_cache/{en,vi,zh}/` for TTS audio cache. `./logs/` for application logs. Served via FastAPI static files (`StaticFiles` directory mount). No cloud storage dependencies for POC. |
| **Volume Mounts** | `docker-compose.yml` volumes |

---

### 6.4 BAML Runtime

| Aspect | Description |
|--------|-------------|
| **Expected Input** | `.baml` source files (types, clients, functions) |
| **Expected Output** | Generated Python client (`baml_client/`) |
| **Processing Scope** | Compile-time: `baml-cli generate` produces typed async functions matching `.baml` definitions. Runtime: executes LLM calls with declarative fallback chains. Type validation on responses (Pydantic v2). Prompt versioning in git. |
| **Source Files** | `baml_src/*.baml` |
| **Generated** | `baml_client/` |
| **Version** | BAML 0.76.2 |

---

## 7. Cross-Cutting Concerns

### 7.1 Authentication Middleware

| Aspect | Description |
|--------|-------------|
| **Expected Input** | HTTP requests to protected endpoints |
| **Expected Output** | Authenticated request with `parent_id` + `X-Child-Id` context |
| **Processing Scope** | JWT validation (`Authorization: Bearer` header). Access token extraction and verification. Parent gate token validation for `/api/parent/*` routes. Rate limiting per child. Inject `X-Child-Id` header into request context. |
| **Source File** | `app/dependencies.py` |

---

### 7.2 Error Handler

| Aspect | Description |
|--------|-------------|
| **Expected Input** | Exceptions from services |
| **Expected Output** | Child-friendly error JSON |
| **Processing Scope** | Catch all exceptions globally. Map to error codes (`CAPTURE_LOW_CONFIDENCE`, `AI_SERVICE_ERROR`, `AUTH_INVALID`, etc.). Translate to Vietnamese child-friendly messages. Log for debugging (structured logging). Never expose technical stack traces to child. HTTP status codes preserved. |
| **Source File** | `app/main.py` (exception handlers) |
| **Error Codes** | See `backend.md` § 7.2 |

---

### 7.3 Rate Limiter

| Aspect | Description |
|--------|-------------|
| **Expected Input** | API requests per child |
| **Expected Output** | Allow / 429 Too Many Requests |
| **Processing Scope** | Free tier: 5 captures/day, 15 pronunciations/day. Premium tier: 50 captures/day, 100 pronunciations/day. Redis counter with daily TTL (`ratelimit:{action}:{child_id}:{date}`). TTS rate limit: 10/min (free), 30/min (premium). API rate limit: 30/min (free), 120/min (premium). Child-friendly message on limit: "Hôm nay chụp nhiều rồi! Mai quay lại nha!" |
| **Implementation** | Redis INCR + EXPIRE, FastAPI middleware (slowapi) |

---

### 7.4 Background Jobs Scheduler

| Aspect | Description |
|--------|-------------|
| **Expected Input** | Scheduled triggers (cron) |
| **Expected Output** | Job execution (missions, cleanup, resets) |
| **Processing Scope** | Daily (00:00 UTC+7): generate daily missions, expire old missions, reset streaks for inactive children. Weekly (Monday 00:00): generate weekly missions. Monthly (1st 00:00): snapshot leaderboard to PostgreSQL, reset Redis sorted sets. POC: APScheduler running in FastAPI process. |
| **Source File** | `app/main.py` (lifespan) or dedicated scheduler module |
| **Jobs** | See `backend.md` § 6 |

---

### 7.5 Logging & Observability

| Aspect | Description |
|--------|-------------|
| **Expected Input** | Application events (captures, errors, latency) |
| **Expected Output** | Structured logs (stdout + file) |
| **Processing Scope** | Python `logging` + `structlog`. Format: JSON structured. Destinations: stdout (Docker), local file (`./logs/snaplearn.log`). Key metrics: capture latency (e2e, AI), pronunciation distribution, mission completion rate, AI errors by provider. Health check: `GET /health` (DB + Redis ping). |
| **Source File** | `app/main.py`, service files |
| **Metrics** | See `backend.md` § 9.2 |

---

## Summary

### Component Count by Domain

| Domain | Count |
|--------|-------|
| AI Pipeline | 11 |
| Backend Services | 8 |
| Game Engine | 5 |
| Data Layer | 6 |
| Frontend Components | 10 |
| Infrastructure | 4 |
| Cross-Cutting Concerns | 5 |
| **Total** | **49** |

### Key Architectural Decisions

1. **BAML Orchestrator**: Central to AI architecture — all LLM inference goes through BAML for type safety, fallback chains, and prompt versioning.

2. **Server-Authoritative Game State**: XP, levels, missions computed server-side only. Client is thin display layer.

3. **Binary Pronunciation Scoring**: Simple exact match (★★★ or ★) via Whisper ASR. No fuzzy matching. Pedagogically appropriate for 6-10 year-olds.

4. **Language-Agnostic Storage**: Backend stores all 3 languages per capture. Frontend filters by child's selected language.

5. **Local-First Storage**: Photos and TTS cached locally (`./uploads/`, `./tts_cache/`). No cloud storage dependencies for POC.

6. **Redis-Backed Leaderboard**: Real-time rankings via sorted sets. Monthly snapshot to PostgreSQL for history.

7. **Parent Gate**: Math puzzle (e.g., "17 + 6 = ?") required for all parent dashboard access. 5-minute session token.

---

## Related Documents

- [product_vision.md](./product_vision.md) — Product requirements and user experience
- [architecture.md](./architecture.md) — System architecture and technology stack
- [ai.md](./ai.md) — AI pipeline implementation details
- [backend.md](./backend.md) — Backend API and services
- [frontend_plan.md](./frontend_plan.md) — Frontend screens and design system