# SnapLearn — Backend Implementation Plan

**FastAPI backend: endpoints, services, data layer, and deployment**
Version 1.0 | March 2026

---

## 1. Overview

The SnapLearn backend is a **Python FastAPI** application that serves as the orchestration layer between the Next.js PWA frontend and all external services (AI vision, speech). It owns all business logic — gamification, missions, leaderboards, safety filtering — ensuring the client is a thin display layer.

**Design principles:**
- **Server-authoritative:** XP, levels, rarity, and mission progress are calculated server-side only. The client never computes game state.
- **Async-first:** All I/O-bound operations (AI calls, DB queries) use `async/await`. No blocking threads.
- **Cache-heavy:** Reference vocab, TTS audio files, and leaderboard ranks are cached in Redis to minimize latency and AI costs.
- **Language-agnostic storage:** Every captured vocab stores translations for ALL supported languages (EN, VI, ZH). The frontend filters by the child's selected language.
- **Local-first:** All file storage (photos, TTS audio, logs) uses the local filesystem. No cloud storage dependencies.

---

## 2. Project structure

```
backend/
├── app/
│   ├── main.py                    # FastAPI app creation, middleware, lifespan
│   ├── config.py                  # Settings (env vars, Pydantic BaseSettings)
│   ├── dependencies.py            # Dependency injection (DB session, auth, etc.)
│   │
│   ├── api/
│   │   ├── __init__.py
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
│   ├── services/
│   │   ├── __init__.py
│   │   ├── vision_service.py      # OpenAI GPT-4o / OpenRouter orchestration for object recognition
│   │   ├── speech_service.py      # ASR (OpenAI Whisper) + pronunciation matching
│   │   ├── tts_service.py         # TTS generation + local file caching (OpenAI TTS)
│   │   ├── capture_service.py     # Capture orchestration (vision + rarity + dedup + save)
│   │   ├── rarity_service.py      # Rarity calculation (frequency + difficulty)
│   │   ├── safety_service.py      # Content filtering (stop-list + AI confidence)
│   │   ├── dedup_service.py       # Duplicate detection (perceptual hashing)
│   │   ├── game_service.py        # XP, levels, streaks, evolution
│   │   ├── mission_service.py     # Mission generation, progress tracking, expiry
│   │   ├── leaderboard_service.py # Redis sorted sets, ranking, monthly reset
│   │   ├── auth_service.py        # Email/password auth, JWT token management, parent gate logic
│   │   └── storage_service.py     # Local filesystem upload, file serving
│   │
│   ├── models/
│   │   ├── __init__.py
│   │   ├── base.py                # SQLAlchemy Base, common mixins
│   │   ├── parent_account.py      # ParentAccount model
│   │   ├── child_profile.py       # ChildProfile model
│   │   ├── captured_vocab.py      # CapturedVocab model
│   │   ├── reference_vocab.py     # ReferenceVocab model
│   │   ├── mission.py             # Mission model
│   │   ├── badge.py               # Badge model
│   │   └── leaderboard_entry.py   # LeaderboardEntry model
│   │
│   ├── schemas/
│   │   ├── __init__.py
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
│   │   ├── __init__.py
│   │   ├── session.py             # Async SQLAlchemy engine + session factory
│   │   ├── redis.py               # Redis connection pool
│   │   └── migrations/            # Alembic migration directory
│   │       ├── env.py
│   │       └── versions/
│   │
│   └── utils/
│       ├── __init__.py
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
│   └── photos/
├── tts_cache/                     # Local TTS audio cache
│   ├── en/
│   ├── vi/
│   └── zh/
├── logs/                          # Application log files
│
├── Dockerfile
├── docker-compose.yml             # Local dev: Postgres + Redis + app
├── pyproject.toml                 # Dependencies (uv/poetry)
├── alembic.ini
└── .env.example
```

---

## 3. Core services (detailed)

### 3.1 Capture Service — `capture_service.py`

The most critical service. Orchestrates the entire photo → vocab card pipeline.

```python
class CaptureService:
    """
    Orchestrates: image validation → reference cache check → AI vision
    → safety filter → duplicate detection → rarity calculation → save → XP update.
    """

    async def process_capture(
        self, child_id: UUID, image_data: bytes
    ) -> CaptureResult:
        # 1. Validate & process image
        image = await self._validate_and_compress(image_data)
        photo_hash = compute_perceptual_hash(image)

        # 2. Check for exact duplicate (same child, same object)
        existing = await self.dedup_service.find_duplicate(child_id, photo_hash)
        if existing:
            return await self._handle_duplicate(child_id, existing)

        # 3. Check reference vocab cache (fast, free, verified)
        cached_vocab = await self.reference_cache.lookup(image)
        if cached_vocab:
            return await self._create_vocab_card(child_id, cached_vocab, image, photo_hash, source="cache")

        # 4. Call AI vision (OpenAI GPT-4o)
        ai_result = await self.vision_service.identify(image)

        # 5. Safety check
        if not await self.safety_service.is_safe(ai_result):
            return CaptureResult(status="blocked", message_vi="Chụp thứ khác vui hơn nhé!")

        # 6. Confidence check
        if ai_result.confidence < 0.7:
            return CaptureResult(status="low_confidence", message_vi="Hmm, mình chưa nhìn rõ lắm. Lại gần hơn nha!")

        # 7. Create vocab card with rarity
        return await self._create_vocab_card(child_id, ai_result, image, photo_hash, source="llm")

    async def _create_vocab_card(self, child_id, vocab_data, image, photo_hash, source):
        # Calculate rarity
        rarity = await self.rarity_service.calculate(vocab_data)

        # Save photo to local filesystem (if parent opted in)
        photo_url = await self._maybe_save_photo(child_id, image)

        # Save to DB
        captured = await self.repo.create_captured_vocab(
            child_id=child_id,
            word_en=vocab_data.object_en,
            phonetic_en=vocab_data.phonetic_en,
            word_vi=vocab_data.object_vi,
            word_zh=vocab_data.object_zh,
            pinyin=vocab_data.pinyin,
            category=vocab_data.category,
            rarity_tier=rarity.tier,
            points_earned=rarity.points,
            photo_url=photo_url,
            photo_hash=photo_hash,
            confidence=vocab_data.confidence,
            fun_fact_vi=vocab_data.fun_fact_vi,
            source=source,
        )

        # Update game state (XP, streak, mission progress)
        game_update = await self.game_service.on_capture(child_id, captured)

        # Update global capture frequency (for rarity calculation)
        await self.rarity_service.increment_frequency(vocab_data.object_en)

        # Pre-generate TTS audio (async, don't block response)
        asyncio.create_task(self.tts_service.ensure_cached(vocab_data))

        return CaptureResult(
            status="new_capture",
            vocab_card=captured,
            xp_earned=game_update.xp_earned,
            total_xp=game_update.total_xp,
            level_up=game_update.level_up,
            mission_update=game_update.mission_update,
            tts_urls=await self.tts_service.get_urls(vocab_data),
        )

    async def _handle_duplicate(self, child_id, existing):
        # Duplicate = 25% XP, but opportunity to practice pronunciation
        xp = existing.points_earned // 4
        game_update = await self.game_service.on_duplicate(child_id, existing, xp)
        return CaptureResult(
            status="duplicate",
            vocab_card=existing,
            xp_earned=xp,
            total_xp=game_update.total_xp,
        )
```

### 3.2 Rarity Service — `rarity_service.py`

Dynamic rarity based on global capture frequency + linguistic difficulty.

```python
class RarityService:
    """
    Rarity tiers:
      Common (⚪ 10pts)    — captured by >50% of users OR difficulty 1
      Uncommon (🟢 25pts)  — captured by 20-50% OR difficulty 2
      Rare (🔵 50pts)      — captured by 5-20% OR difficulty 3
      Epic (🟣 100pts)     — captured by 1-5% OR difficulty 4
      Legendary (🟡 250pts)— captured by <1% OR difficulty 5
    """

    async def calculate(self, vocab_data: VisionResult) -> RarityResult:
        # 1. Get global capture frequency from Redis
        frequency_rank = await self._get_frequency_percentile(vocab_data.object_en)

        # 2. Get linguistic difficulty from AI response
        difficulty = max(vocab_data.difficulty_en, vocab_data.difficulty_vi, vocab_data.difficulty_zh)

        # 3. Use the HIGHER rarity between frequency-based and difficulty-based
        freq_rarity = self._frequency_to_rarity(frequency_rank)
        diff_rarity = self._difficulty_to_rarity(difficulty)
        final_rarity = max(freq_rarity, diff_rarity)  # higher = rarer

        return RarityResult(
            tier=final_rarity.name,
            points=final_rarity.points,
        )

    async def increment_frequency(self, word_en: str):
        """Track how many times a word has been captured globally."""
        await self.redis.zincrby("capture_frequency:global", 1, word_en.lower())

    async def _get_frequency_percentile(self, word_en: str) -> float:
        """What % of total users have captured this word? Returns 0.0–1.0."""
        count = await self.redis.zscore("capture_frequency:global", word_en.lower())
        total_users = await self.redis.get("stats:total_active_users") or 1
        return (count or 0) / int(total_users)
```

### 3.3 Game Service — `game_service.py`

Server-authoritative gamification engine.

```python
class GameService:
    """Manages XP, levels, streaks, evolution, and mission progress."""

    LEVEL_THRESHOLDS = [
        (1, 0, "Beginner Explorer"),
        (5, 500, "Word Collector"),
        (10, 2000, "Vocab Hunter"),
        (20, 8000, "Language Scout"),
        (35, 25000, "Word Master"),
        (50, 60000, "Polyglot Champion"),
    ]

    async def on_capture(self, child_id: UUID, vocab: CapturedVocab) -> GameUpdate:
        child = await self.repo.get_child(child_id)

        # 1. Award XP
        xp_earned = vocab.points_earned
        child.total_xp += xp_earned

        # 2. Check level up
        new_level = self._calculate_level(child.total_xp)
        level_up = None
        if new_level > child.level:
            child.level = new_level
            level_up = self._get_level_info(new_level)

        # 3. Update streak
        today = date.today()
        if child.streak_date != today:
            if child.streak_date == today - timedelta(days=1):
                child.current_streak += 1
            else:
                child.current_streak = 1
            child.streak_date = today
            child.longest_streak = max(child.longest_streak, child.current_streak)

        # 4. Check mission progress
        mission_update = await self.mission_service.on_capture(child_id, vocab)

        # 5. Update leaderboard
        await self.leaderboard_service.add_points(child_id, xp_earned)

        # 6. Save
        await self.repo.save_child(child)

        return GameUpdate(
            xp_earned=xp_earned,
            total_xp=child.total_xp,
            level_up=level_up,
            streak=child.current_streak,
            mission_update=mission_update,
        )

    async def on_pronunciation(self, child_id: UUID, vocab_id: UUID, stars: int) -> PronunciationUpdate:
        vocab = await self.repo.get_captured_vocab(vocab_id)

        # Award bonus XP for 3-star pronunciation
        xp_earned = 5 if stars == 3 else 0

        # Update mastery level (only on match = 3 stars)
        if stars == 3:
            vocab.mastery_level = min(5, vocab.mastery_level + 1)

        # Check evolution (5 perfect pronunciations across different sessions)
        evolved = False
        if vocab.mastery_level >= 5 and not vocab.evolved:
            vocab.evolved = True
            evolved = True
            xp_earned += 50  # Evolution bonus

        if xp_earned > 0:
            child = await self.repo.get_child(child_id)
            child.total_xp += xp_earned
            await self.repo.save_child(child)

        await self.repo.save_captured_vocab(vocab)

        return PronunciationUpdate(
            stars=stars,
            mastery_level=vocab.mastery_level,
            evolved=evolved,
            xp_earned=xp_earned,
        )
```

### 3.4 Mission Service — `mission_service.py`

Dynamic mission generation based on child's collection gaps.

```python
class MissionService:
    """
    Generates and tracks missions. Missions are created dynamically
    based on what the child has NOT yet captured.
    """

    MISSION_TEMPLATES = {
        "daily": [
            {"desc": "Tìm {n} vật màu {color}!", "target": 3, "xp": 50},
            {"desc": "Chụp {n} vật bất kỳ!", "target": 5, "xp": 30},
            {"desc": "Luyện nói {n} từ!", "target": 3, "xp": 40},
        ],
        "weekly": [
            {"desc": "Chụp {n} món trong {location}!", "target": 5, "xp": 200},
            {"desc": "Thu thập từ {n} nhóm khác nhau!", "target": 3, "xp": 300},
        ],
        "category": [
            {"desc": "Hoàn thành nhóm {category}!", "target_pct": 1.0, "xp": 500},
        ],
    }

    async def generate_daily_missions(self, child_id: UUID) -> list[Mission]:
        """Generate 2-3 daily missions. Called at midnight or first login of the day."""
        child = await self.repo.get_child(child_id)
        existing_today = await self.repo.get_active_missions(child_id, type="daily")

        if existing_today:
            return existing_today  # Already generated today

        # Pick 2 templates, personalize based on collection gaps
        uncaptured_categories = await self._get_weak_categories(child_id)
        missions = []

        for template in random.sample(self.MISSION_TEMPLATES["daily"], 2):
            mission = await self._instantiate_template(
                child_id, template, uncaptured_categories
            )
            missions.append(mission)

        await self.repo.save_missions(missions)
        return missions

    async def on_capture(self, child_id: UUID, vocab: CapturedVocab) -> MissionUpdate | None:
        """Check if a capture advances any active mission."""
        active_missions = await self.repo.get_active_missions(child_id)

        for mission in active_missions:
            if self._matches_mission(mission, vocab):
                mission.current_count += 1
                if mission.current_count >= mission.target_count:
                    mission.status = "completed"
                await self.repo.save_mission(mission)

                return MissionUpdate(
                    mission_id=mission.id,
                    new_count=mission.current_count,
                    target_count=mission.target_count,
                    completed=mission.status == "completed",
                )

        return None
```

### 3.5 Leaderboard Service — `leaderboard_service.py`

Real-time rankings using Redis sorted sets.

```python
class LeaderboardService:
    """
    Redis-backed leaderboard with monthly resets.
    Supports scopes: global, class, friends.
    """

    async def add_points(self, child_id: UUID, points: int):
        period = self._current_period()  # e.g., "2026-03"
        await self.redis.zincrby(f"leaderboard:global:{period}", points, str(child_id))

        # Also update class leaderboard if child belongs to a class
        class_id = await self._get_class_id(child_id)
        if class_id:
            await self.redis.zincrby(f"leaderboard:class:{class_id}:{period}", points, str(child_id))

    async def get_rankings(
        self, scope: str, child_id: UUID, limit: int = 50
    ) -> LeaderboardResponse:
        period = self._current_period()
        key = self._get_key(scope, child_id, period)

        # Get top N
        top_entries = await self.redis.zrevrange(key, 0, limit - 1, withscores=True)

        # Get child's rank
        child_rank = await self.redis.zrevrank(key, str(child_id))
        child_score = await self.redis.zscore(key, str(child_id))

        # Hydrate with child names + avatars
        entries = await self._hydrate_entries(top_entries)

        return LeaderboardResponse(
            entries=entries,
            my_rank=child_rank + 1 if child_rank is not None else None,
            my_score=int(child_score or 0),
            reset_date=self._next_reset_date(),
        )

    async def monthly_reset(self):
        """Called by scheduled job on the 1st of each month."""
        old_period = self._previous_period()
        # Snapshot to PostgreSQL for historical records
        await self._snapshot_to_db(old_period)
        # Redis keys auto-expire (TTL set on creation)
```

### 3.6 Safety Service — `safety_service.py`

Multi-layer content filtering.

```python
class SafetyService:
    """
    Content safety for 6-10 year-olds. Multiple filter layers.
    """

    def __init__(self):
        self.stop_lists = {
            "en": self._load_stop_list("data/stop_list_en.txt"),
            "vi": self._load_stop_list("data/stop_list_vi.txt"),
            "zh": self._load_stop_list("data/stop_list_zh.txt"),
        }

    async def is_safe(self, ai_result: VisionResult, filter_level: str = "standard") -> bool:
        # Layer 1: AI confidence check
        if ai_result.confidence < 0.7:
            return False  # Uncertain = don't show

        # Layer 2: Stop-list check (all languages)
        for lang, stop_list in self.stop_lists.items():
            word = getattr(ai_result, f"object_{lang}", "")
            if word.lower() in stop_list:
                return False

        # Layer 3: Category-based filtering
        blocked_categories = {"weapons", "alcohol", "tobacco", "adult", "violence"}
        if filter_level == "strict":
            blocked_categories |= {"insects", "medical", "scary"}
        if ai_result.category in blocked_categories:
            return False

        return True
```

### 3.7 Auth Service — `auth_service.py`

Simple email/password authentication with JWT tokens.

```python
from passlib.context import CryptContext
from jose import jwt, JWTError

class AuthService:
    """
    Email/password auth with JWT tokens.
    No email verification required at registration.
    """

    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

    ACCESS_TOKEN_EXPIRE_MINUTES = 30
    REFRESH_TOKEN_EXPIRE_DAYS = 7

    async def register(self, email: str, password: str) -> TokenResponse:
        """Register a new parent account. No verification needed."""
        # Check if email already exists
        existing = await self.repo.get_parent_by_email(email)
        if existing:
            raise HTTPException(status_code=409, detail="Email already registered")

        # Hash password and create account
        password_hash = self.pwd_context.hash(password)
        parent = await self.repo.create_parent(email=email, password_hash=password_hash)

        # Generate tokens
        access_token = self._create_access_token(parent.id)
        refresh_token = self._create_refresh_token(parent.id)

        # Store refresh token hash in Redis
        await self.redis.set(
            f"refresh:{parent.id}",
            self._hash_token(refresh_token),
            ex=self.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
        )

        return TokenResponse(
            parent_id=parent.id,
            email=parent.email,
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
        )

    async def login(self, email: str, password: str) -> TokenResponse:
        """Authenticate with email + password."""
        parent = await self.repo.get_parent_by_email(email)
        if not parent or not self.pwd_context.verify(password, parent.password_hash):
            raise HTTPException(status_code=401, detail="Invalid email or password")

        access_token = self._create_access_token(parent.id)
        refresh_token = self._create_refresh_token(parent.id)

        await self.redis.set(
            f"refresh:{parent.id}",
            self._hash_token(refresh_token),
            ex=self.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
        )

        children = await self.repo.get_children_by_parent(parent.id)

        return TokenResponse(
            parent_id=parent.id,
            email=parent.email,
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            children=children,
        )

    def _create_access_token(self, parent_id: UUID) -> str:
        payload = {
            "sub": str(parent_id),
            "type": "access",
            "exp": datetime.utcnow() + timedelta(minutes=self.ACCESS_TOKEN_EXPIRE_MINUTES),
        }
        return jwt.encode(payload, self.config.JWT_SECRET_KEY, algorithm="HS256")

    def _create_refresh_token(self, parent_id: UUID) -> str:
        payload = {
            "sub": str(parent_id),
            "type": "refresh",
            "exp": datetime.utcnow() + timedelta(days=self.REFRESH_TOKEN_EXPIRE_DAYS),
        }
        return jwt.encode(payload, self.config.JWT_SECRET_KEY, algorithm="HS256")
```

---

## 4. Database schema (SQL)

```sql
-- Parents (email + password auth)
CREATE TABLE parent_account (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Children (sub-profiles under a parent)
CREATE TABLE child_profile (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID NOT NULL REFERENCES parent_account(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    avatar_id VARCHAR(20) NOT NULL DEFAULT 'bear',
    target_language VARCHAR(5) NOT NULL DEFAULT 'en',  -- 'en' or 'zh'
    secondary_language VARCHAR(5),                      -- nullable
    total_xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    streak_date DATE,
    daily_time_limit_minutes INTEGER DEFAULT 30,
    daily_capture_count INTEGER DEFAULT 0,
    content_filter_level VARCHAR(10) DEFAULT 'standard',
    photo_storage_enabled BOOLEAN DEFAULT FALSE,
    leaderboard_visibility VARCHAR(20) DEFAULT 'class_friends',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Captured vocabulary (one row per unique word per child)
CREATE TABLE captured_vocab (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES child_profile(id) ON DELETE CASCADE,
    word_en VARCHAR(100) NOT NULL,
    phonetic_en VARCHAR(50),
    word_vi VARCHAR(100) NOT NULL,
    word_zh VARCHAR(50) NOT NULL,
    pinyin VARCHAR(50),
    category VARCHAR(50) NOT NULL,
    rarity_tier VARCHAR(20) NOT NULL,  -- common, uncommon, rare, epic, legendary
    points_earned INTEGER NOT NULL,
    photo_url TEXT,                     -- local file path (e.g., /uploads/photos/abc.jpg)
    photo_hash VARCHAR(64),            -- perceptual hash for dedup
    mastery_en SMALLINT DEFAULT 0,     -- 0-5
    mastery_vi SMALLINT DEFAULT 0,     -- 0-5
    mastery_zh SMALLINT DEFAULT 0,     -- 0-5
    evolved BOOLEAN DEFAULT FALSE,
    fun_fact_vi TEXT,
    example_sentence_en TEXT,
    example_sentence_vi TEXT,
    example_sentence_zh TEXT,
    confidence REAL,
    source VARCHAR(10) DEFAULT 'llm',  -- 'cache' or 'llm'
    captured_at TIMESTAMPTZ DEFAULT NOW(),
    last_practiced TIMESTAMPTZ,

    UNIQUE(child_id, word_en, word_vi)  -- One card per word per child
);

-- Reference vocabulary (verification cache, ~1000 entries)
CREATE TABLE reference_vocab (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    word_en VARCHAR(100) NOT NULL,
    phonetic_en VARCHAR(50),
    word_vi VARCHAR(100) NOT NULL,
    word_zh VARCHAR(50) NOT NULL,
    pinyin VARCHAR(50),
    category VARCHAR(50) NOT NULL,
    difficulty_en SMALLINT DEFAULT 1,   -- 1-5
    difficulty_vi SMALLINT DEFAULT 1,   -- 1-5
    difficulty_zh SMALLINT DEFAULT 1,   -- 1-5
    fun_fact_vi TEXT,
    example_sentence_en TEXT,
    example_sentence_vi TEXT,
    example_sentence_zh TEXT,
    verified BOOLEAN DEFAULT FALSE,
    source VARCHAR(20) DEFAULT 'curated',  -- curated, llm_verified
    capture_count INTEGER DEFAULT 0,        -- global frequency
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Missions
CREATE TABLE mission (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES child_profile(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL,            -- daily, weekly, category, diversity, pronunciation
    description_vi TEXT NOT NULL,
    target_count INTEGER NOT NULL,
    current_count INTEGER DEFAULT 0,
    reward_xp INTEGER NOT NULL,
    reward_badge VARCHAR(50),
    status VARCHAR(20) DEFAULT 'active',  -- active, completed, claimed, expired
    match_criteria JSONB,                 -- e.g., {"category": "animals"} or {"color": "red"}
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Badges earned by children
CREATE TABLE badge (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES child_profile(id) ON DELETE CASCADE,
    badge_type VARCHAR(50) NOT NULL,      -- e.g., "animal_master", "explorer", "streak_7"
    badge_name_vi VARCHAR(100) NOT NULL,
    earned_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(child_id, badge_type)
);

-- Leaderboard snapshots (monthly persistence from Redis)
CREATE TABLE leaderboard_snapshot (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES child_profile(id) ON DELETE CASCADE,
    scope VARCHAR(20) NOT NULL,           -- global, class, friends
    period VARCHAR(7) NOT NULL,           -- e.g., "2026-03"
    total_points INTEGER NOT NULL,
    final_rank INTEGER,
    category_points JSONB,                -- per-category breakdown
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity log (for parent dashboard feed)
CREATE TABLE activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES child_profile(id) ON DELETE CASCADE,
    event_type VARCHAR(30) NOT NULL,      -- capture, pronunciation, mission_complete, level_up, badge_earned, evolution
    event_data JSONB NOT NULL,            -- flexible payload per event type
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE UNIQUE INDEX idx_parent_email ON parent_account(LOWER(email));
CREATE INDEX idx_captured_vocab_child_word ON captured_vocab(child_id, word_en, word_vi);
CREATE INDEX idx_captured_vocab_child_cat ON captured_vocab(child_id, category);
CREATE INDEX idx_captured_vocab_hash ON captured_vocab(child_id, photo_hash);
CREATE UNIQUE INDEX idx_ref_vocab_en ON reference_vocab(LOWER(word_en));
CREATE UNIQUE INDEX idx_ref_vocab_vi ON reference_vocab(LOWER(word_vi));
CREATE INDEX idx_ref_vocab_zh ON reference_vocab(word_zh);
CREATE INDEX idx_mission_child_status ON mission(child_id, status, expires_at);
CREATE INDEX idx_activity_child_time ON activity_log(child_id, created_at DESC);
CREATE INDEX idx_leaderboard_scope ON leaderboard_snapshot(scope, period, total_points DESC);
```

---

## 5. API endpoint specifications

### 5.1 Authentication

```
POST /api/auth/register
  Body: { email: str, password: str }
  Returns: { parent_id: UUID, email: str, access_token: str, refresh_token: str, token_type: "bearer" }

POST /api/auth/login
  Body: { email: str, password: str }
  Returns: { parent_id: UUID, email: str, access_token: str, refresh_token: str, token_type: "bearer", children: ChildProfile[] }

POST /api/auth/refresh
  Body: { refresh_token: str }
  Returns: { access_token: str, refresh_token: str, token_type: "bearer" }
```

### 5.2 Child management

```
POST /api/children
  Body: { name: str, avatar_id: str, target_language: 'en'|'zh' }
  Auth: Parent JWT
  Returns: ChildProfile

GET /api/children/{child_id}
  Auth: Parent JWT
  Returns: ChildProfile with stats

PATCH /api/children/{child_id}
  Body: { name?, avatar_id?, target_language?, secondary_language? }
  Auth: Parent JWT
  Returns: ChildProfile
```

### 5.3 Capture (core loop)

```
POST /api/capture
  Headers: X-Child-Id: UUID
  Body: { image: base64 str }
  Auth: Parent JWT
  Rate limit: 50/day per child (freemium: 5/day)

  Returns (success):
    {
      status: "new_capture" | "duplicate",
      vocab_card: VocabCard,
      xp_earned: int,
      total_xp: int,
      level_up: LevelInfo | null,
      mission_update: MissionUpdate | null,
      tts_urls: { en: str, vi: str, zh: str }
    }

  Returns (failure):
    { status: "low_confidence" | "blocked", message_vi: str }
```

### 5.4 Speech (pronunciation)

```
POST /api/pronounce
  Headers: X-Child-Id: UUID
  Body: { vocab_id: UUID, language: 'en'|'vi', audio: base64 str }
  Auth: Parent JWT
  Rate limit: 100/day per child

  Returns:
    {
      stars: 1|3,
      transcript: str,
      expected: str,
      match_type: "exact" | "no_match",
      mastery_level: int (0-5),
      evolved: bool,
      xp_earned: int,
      attempts_remaining: int
    }

GET /api/tts/{vocab_id}/{language}
  Returns: Audio file (MP3) served from local filesystem cache
```

### 5.5 Collection

```
GET /api/collection
  Headers: X-Child-Id: UUID
  Returns:
    {
      total_words: int,
      categories: [
        { name: str, icon: str, captured: int, total: int, progress: float }
      ]
    }

GET /api/collection/{category}
  Headers: X-Child-Id: UUID
  Returns:
    {
      category: str,
      captured_words: VocabCard[],
      undiscovered_count: int
    }

GET /api/vocab/{vocab_id}
  Headers: X-Child-Id: UUID
  Returns: VocabCard (full detail with mastery, evolution, fun fact)
```

### 5.6 Missions

```
GET /api/missions
  Headers: X-Child-Id: UUID
  Returns:
    {
      daily: Mission[],
      weekly: Mission[],
      category_challenges: Mission[]
    }

POST /api/missions/{mission_id}/claim
  Headers: X-Child-Id: UUID
  Returns:
    {
      xp_earned: int,
      total_xp: int,
      badge_earned: Badge | null,
      level_up: LevelInfo | null
    }
```

### 5.7 Leaderboard

```
GET /api/leaderboard/{scope}
  Scope: "global" | "class" | "friends"
  Headers: X-Child-Id: UUID
  Query: ?limit=50

  Returns:
    {
      entries: [{ rank: int, name: str, avatar_id: str, points: int }],
      my_rank: int,
      my_score: int,
      reset_date: str (ISO date)
    }
```

### 5.8 Profile

```
GET /api/profile
  Headers: X-Child-Id: UUID
  Returns:
    {
      child: ChildProfile,
      badges: Badge[],
      favorite_category: str,
      stats: {
        total_words: int,
        streak: int,
        rare_cards: int,
        evolved_cards: int
      }
    }
```

### 5.9 Parent Gate

```
POST /api/parent-gate/challenge
  Returns: { challenge: str, challenge_id: UUID }
  Example: { challenge: "17 + 6 = ?", challenge_id: "..." }

POST /api/parent-gate/verify
  Body: { challenge_id: UUID, answer: int }
  Returns: { verified: bool, parent_token: str (5-min TTL) }
```

### 5.10 Parent Dashboard

```
GET /api/parent/dashboard
  Auth: Parent token (from parent gate)
  Query: ?child_id=UUID

  Returns:
    {
      overview: { words_total: int, streak: int, level: int, xp: int },
      words_this_week: int,
      words_trend: [{ date: str, count: int }],   # last 4 weeks
      language_breakdown: { en: int, vi: int, zh: int },
      category_diversity: [{ category: str, count: int }],
      rarity_distribution: { common: int, uncommon: int, rare: int, epic: int, legendary: int },
      pronunciation_mastery: { level_0: int, level_1: int, ..., level_5: int, evolved: int },
      streak_info: { current: int, longest: int, days_active_this_month: int },
      mission_stats: { attempted: int, completed: int }
    }

GET /api/parent/activity-feed
  Auth: Parent token
  Query: ?child_id=UUID&limit=50&offset=0

  Returns:
    {
      events: [
        {
          type: "capture",
          data: { word_en: str, word_vi: str, word_zh: str, rarity: str, photo_url: str },
          created_at: str
        },
        {
          type: "pronunciation",
          data: { word: str, language: str, stars: int },
          created_at: str
        },
        ...
      ]
    }

PATCH /api/parent/controls
  Auth: Parent token
  Body: {
    child_id: UUID,
    daily_time_limit_minutes?: int,
    target_language?: str,
    secondary_language?: str | null,
    photo_storage_enabled?: bool,
    content_filter_level?: "standard" | "strict",
    leaderboard_visibility?: "none" | "class_friends" | "all"
  }
  Returns: ChildProfile (updated)

GET /api/parent/export
  Auth: Parent token
  Query: ?child_id=UUID
  Returns: CSV file download
```

---

## 6. Background jobs & scheduled tasks

| Job | Schedule | Description |
|---|---|---|
| **Generate daily missions** | 00:00 UTC+7 daily | Create 2-3 daily missions for each active child |
| **Expire old missions** | 00:00 UTC+7 daily | Mark expired missions as `expired` |
| **Generate weekly missions** | Monday 00:00 UTC+7 | Create 1-2 weekly missions |
| **Leaderboard snapshot** | 1st of month 00:00 | Snapshot Redis leaderboard to PostgreSQL |
| **Leaderboard reset** | 1st of month 00:01 | Clear Redis sorted sets for new period |
| **Streak reset check** | 00:00 UTC+7 daily | Reset streaks for children who didn't capture yesterday |
| **TTS pre-cache** | On deploy | Pre-generate TTS audio for reference vocab (1000 words × 3 languages) |
| **Reference vocab update** | Weekly | Promote high-confidence LLM results to verified reference vocab |

**POC implementation:** Use FastAPI's built-in `BackgroundTasks` for simple async jobs. For scheduled tasks, use a lightweight scheduler like `APScheduler` running in the same process.

---

## 7. Error handling strategy

### 7.1 Error response format

All errors return consistent JSON:

```json
{
  "error": {
    "code": "CAPTURE_LOW_CONFIDENCE",
    "message_vi": "Hmm, mình chưa nhìn rõ lắm. Lại gần hơn nha!",
    "message_en": "Low confidence — try getting closer",
    "details": {}
  }
}
```

### 7.2 Error codes

| Code | HTTP | When | Child-facing message (VI) |
|---|---|---|---|
| `CAPTURE_LOW_CONFIDENCE` | 200 | AI confidence < 0.7 | "Hmm, mình chưa nhìn rõ lắm. Lại gần hơn nha!" |
| `CAPTURE_BLOCKED` | 200 | Content safety filter triggered | "Chụp thứ khác vui hơn nhé!" |
| `CAPTURE_RATE_LIMITED` | 429 | Daily capture limit exceeded | "Hôm nay chụp nhiều rồi! Mai quay lại nha!" |
| `AI_SERVICE_ERROR` | 502 | OpenAI/OpenRouter API down | "AI buồn ngủ một chút! Chụp lại nhé!" |
| `AI_TIMEOUT` | 504 | AI call exceeds 10s timeout | "AI buồn ngủ một chút! Chụp lại nhé!" |
| `AUTH_INVALID` | 401 | Invalid/expired JWT token | (Redirect to login) |
| `AUTH_CREDENTIALS_INVALID` | 401 | Wrong email or password | "Email hoặc mật khẩu không đúng" |
| `AUTH_EMAIL_EXISTS` | 409 | Email already registered | "Email đã được đăng ký" |
| `PARENT_GATE_FAILED` | 403 | Wrong math answer | "Hỏi bố mẹ nhé!" |
| `TIME_LIMIT_REACHED` | 403 | Daily time limit exceeded | "Hôm nay học đủ rồi! Mai quay lại nha!" |
| `VALIDATION_ERROR` | 422 | Bad request data | (Generic retry) |
| `INTERNAL_ERROR` | 500 | Unexpected server error | "Có lỗi rồi! Thử lại nhé!" |

### 7.3 AI service resilience

```python
class VisionService:
    async def identify(self, image: bytes) -> VisionResult:
        try:
            # Primary: OpenAI GPT-4o
            result = await self._call_openai(image, timeout=8.0)
            return result
        except (TimeoutError, APIError) as e:
            logger.warning(f"OpenAI failed: {e}, trying OpenRouter fallback")
            try:
                # Fallback: OpenRouter (Gemini Flash or Claude Sonnet)
                result = await self._call_openrouter(image, timeout=6.0)
                return result
            except (TimeoutError, APIError) as e:
                logger.error(f"All vision providers failed: {e}")
                raise AIServiceError("Vision service unavailable")
```

---

## 8. Rate limiting & quotas

| Limit | Free tier | Premium tier | Implementation |
|---|---|---|---|
| Captures per day | 5 | 50 | Redis counter with daily TTL |
| Pronunciation attempts per day | 15 | 100 | Redis counter with daily TTL |
| TTS requests per minute | 10 | 30 | Redis sliding window |
| API requests per minute | 30 | 120 | FastAPI middleware (slowapi) |
| Image upload size | 2MB | 5MB | FastAPI request size limit |
| Audio upload size | 1MB | 2MB | FastAPI request size limit |

---

## 9. Observability

### 9.1 Logging

All logging uses Python's built-in `logging` module with `structlog` for structured output. Logs are written to stdout (for Docker) and to local log files.

```python
import structlog
import logging

# Configure structured logging to stdout + file
logging.basicConfig(
    level=logging.INFO,
    handlers=[
        logging.StreamHandler(),                           # stdout
        logging.FileHandler("logs/snaplearn.log"),         # local file
    ],
)

logger = structlog.get_logger()

# Every capture is logged with context
logger.info(
    "capture_processed",
    child_id=str(child_id),
    word_en=result.word_en,
    rarity=result.rarity_tier,
    source=result.source,          # cache or llm
    ai_latency_ms=ai_latency,
    total_latency_ms=total_latency,
    confidence=result.confidence,
)
```

### 9.2 Key metrics to track (via log aggregation)

| Metric | Type | Purpose |
|---|---|---|
| `capture.total` | Counter | Total captures processed |
| `capture.cache_hit_rate` | Gauge | % of captures served from reference cache |
| `capture.ai_latency_ms` | Histogram | OpenAI/OpenRouter response time |
| `capture.e2e_latency_ms` | Histogram | Total capture endpoint latency |
| `pronunciation.stars` | Histogram | Distribution of pronunciation scores |
| `pronunciation.asr_latency_ms` | Histogram | OpenAI Whisper response time |
| `mission.completion_rate` | Gauge | % of missions completed before expiry |
| `leaderboard.active_users` | Gauge | Users with leaderboard entries this period |
| `ai.errors` | Counter | AI service errors (by provider) |
| `auth.active_sessions` | Gauge | Currently active child sessions |

### 9.3 Health check

```python
@app.get("/health")
async def health_check(db: AsyncSession = Depends(get_db), redis = Depends(get_redis)):
    try:
        await db.execute(text("SELECT 1"))
        await redis.ping()
        return {"status": "healthy", "db": "ok", "redis": "ok"}
    except Exception as e:
        return JSONResponse(status_code=503, content={"status": "unhealthy", "error": str(e)})
```

---

## 10. Local development setup

```yaml
# docker-compose.yml
services:
  backend:
    build: .
    ports:
      - "8000:8000"
    env_file: .env
    volumes:
      - ./app:/app/app
      - ./uploads:/app/uploads
      - ./tts_cache:/app/tts_cache
      - ./logs:/app/logs
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

```bash
# Quick start
cp .env.example .env
# Fill in: OPENAI_API_KEY, OPENROUTER_API_KEY, JWT_SECRET_KEY
docker compose up -d
uv run alembic upgrade head
uv run python scripts/seed_reference_vocab.py
uv run uvicorn app.main:app --reload --port 8000
```

---

## 11. Sprint-to-backend mapping

| Sprint | Weeks | Backend deliverables |
|---|---|---|
| **1** | 1-2 | FastAPI scaffold, DB schema + migrations, email/password auth (JWT), `POST /capture` (OpenAI GPT-4o integration), reference vocab seeding |
| **2** | 3-4 | `POST /pronounce` (OpenAI Whisper integration), `GET /tts` (OpenAI TTS + local file caching), pronunciation exact-match logic, star rating system |
| **3** | 5-6 | `GET /collection`, `GET /vocab/{id}`, mastery update logic, duplicate detection (pHash), card evolution logic |
| **4** | 7-8 | Mission service (daily/weekly generation), leaderboard service (Redis sorted sets), level progression, `GET /leaderboard`, `GET /missions`, `POST /missions/{id}/claim` |
| **5** | 9-10 | Parent gate API, parent dashboard endpoints, activity feed, parental controls CRUD, CSV export |
| **6** | 11-12 | Rate limiting, anti-gaming tuning, performance optimization, error handling hardening, log review and cleanup |

---

*This document should be read alongside [architecture.md](./architecture.md) and [ai.md](./ai.md).*
