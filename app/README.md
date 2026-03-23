# SnapLearn App - Comprehensive Codebase Exploration

**Date**: March 2026
**Project**: SnapLearn — AI-Powered Vocabulary Camera
**Scope**: Hackathon project (36 hours) for Vietnamese children aged 6-10 learning English

---

## 1. OVERALL PROJECT STRUCTURE

### Top-Level Directories
```
snap-learn-app/
├── app/
│   ├── ai/                 # AI scripts and utilities
│   ├── be/                 # Backend (Python/FastAPI)
│   └── fe/                 # Frontend (React/TypeScript/Vite)
├── _docs/                  # Documentation and assets
├── openspec/               # OpenSpec design documents
├── docker-compose.*.yml    # Docker orchestration
├── Makefile               # Build commands
└── README.md              # Main project documentation
```

### Key Configuration Files
- `.env` / `.env.example` - Environment variables
- `.env.production.example` - Production config example
- `docker-compose.yml` - Local Docker setup
- `Makefile` - Development commands

### Documentation Files
- `README.md` - Main project overview
- `AUDIO_CODE_REFERENCE.md` - Audio implementation details
- `AUDIO_RECORDING_ANALYSIS.md` - Frontend audio flow analysis
- `AUDIO_RESEARCH_CHECKLIST.txt` - Audio research findings
- `DEPLOYMENT.md`, `DOCKER.md` - Deployment guides

---

## 2. FRONTEND FRAMEWORK & DEPENDENCIES

### Framework Stack
- **Runtime**: Node.js 18+
- **Framework**: React 19.2.4
- **Language**: TypeScript 5.9.3
- **Build Tool**: Vite 7.0.0
- **CSS**: Tailwind CSS 3.4.19 + PostCSS
- **PWA**: vite-plugin-pwa 1.2.0

### Key Dependencies
```json
{
  "axios": "^1.13.6",           // HTTP client for API calls
  "framer-motion": "^12.38.0",  // Animation library
  "lucide-react": "^0.577.0",   // Icon library
  "react-dom": "^19.2.4",       // React rendering
  "zustand": "^5.0.12",         // State management
  "canvas-confetti": "^1.9.4",  // Celebration effects
  "clsx": "^2.1.1",             // CSS class management
  "tailwind-merge": "^3.5.0"    // Tailwind utilities
}
```

### Build Configuration
- **Vite Config**: `app/fe/vite.config.ts`
  - PWA auto-update enabled
  - HTTPS support via `@vitejs/plugin-basic-ssl`
  - Proxy to backend API at `/api`
  - Service worker support (commented out in index.html)

### Frontend Directory Structure
```
app/fe/src/
├── components/ui/              # 20+ UI components
│   ├── RevealCard.tsx          # Pronunciation practice card
│   ├── VocabDetail.tsx         # Vocab detail view
│   ├── CollectionBook.tsx      # Collection/vault
│   ├── ProfileScreen.tsx       # User profile
│   ├── LeaderboardScreen.tsx   # Rankings
│   ├── LoginScreen.tsx         # Auth
│   └── [15+ others]
├── services/
│   ├── api.ts                  # Axios instance with auth
│   ├── captureApi.ts          # Camera capture endpoint
│   ├── speechApi.ts           # TTS & pronunciation endpoint
│   ├── authApi.ts             # Authentication
│   ├── collectionApi.ts       # Collection management
│   ├── mascotAudioApi.ts      # Pre-generated audio
│   ├── profileApi.ts          # User profile
│   ├── leaderboardApi.ts      # Rankings
│   └── missionApi.ts          # Quests/missions
├── store/
│   ├── gameStore.ts           # Global state (Zustand)
│   └── mockData.ts            # Development mock data
├── utils/
│   ├── audioContext.ts        # Web Audio API context
│   ├── pronunciationRecording.ts  # MediaRecorder setup
│   ├── feedbackUtils.ts       # TTS & haptic feedback
│   ├── confetti.ts            # Celebration effects
│   └── [others]
├── hooks/
│   └── useSoundEffects.ts     # Sound effect triggers
├── assets/                     # Images, fonts, logos
├── App.tsx                    # Main app component
├── main.tsx                   # Vite entry point
└── index.css                  # Global styles
```

---

## 3. VOICE/AUDIO HANDLING - DETAILED ANALYSIS

### Audio Technologies Used

#### A. Web Audio API (audioContext.ts)
**Purpose**: Play TTS audio through shared AudioContext singleton

**Key Features**:
- Shared global `AudioContext` instance (required for mobile browsers)
- Context resumption during user gestures (click/tap)
- `AudioBufferSourceNode` for playback
- Automatic stop of previous sources before new playback

**Implementation**:
```typescript
// Get or create shared context
getAudioContext(): AudioContext

// Unlock context during user gesture
unlockAudioContext(): void

// Play audio from blob URL
playAudioFromUrl(url: string): Promise<void>

// Stop current playback
stopCurrentAudioContext(): void
```

**Mobile Considerations**:
- Mobile browsers block audio outside user gestures
- Solution: Unlock context once on camera capture button click
- Subsequent audio plays are allowed even after async gaps

---

#### B. MediaRecorder API (pronunciationRecording.ts)
**Purpose**: Record user pronunciation for speech evaluation

**Key Details**:
- Uses `navigator.mediaDevices.getUserMedia({ audio: true })`
- Detects best MIME type for browser:
  - Chrome/Firefox: `audio/webm;codecs=opus`
  - Safari: `audio/mp4;codecs=mp4a.40.2` (fallback)
- 3-second fixed recording duration (auto-stops)

**MIME Type Detection**:
```typescript
function pickPronunciationRecorderMimeType(): string | undefined {
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4;codecs=mp4a.40.2',
    'audio/mp4',
  ];
  for (const mimeType of candidates) {
    if (MediaRecorder.isTypeSupported(mimeType)) return mimeType;
  }
}
```

**Recording Flow**:
1. `getUserMedia({ audio: true })` - Request microphone
2. `new MediaRecorder(stream, { mimeType })` - Create recorder
3. Collect chunks in `ondataavailable` event handler
4. Create `Blob` with recorded audio
5. Encode as base64
6. Send to `/api/pronounce` endpoint

---

#### C. Text-to-Speech (TTS) - ElevenLabs Primary, OpenAI Fallback
**Service**: `app/be/app/services/speech_service.py`

**Primary TTS Provider**: ElevenLabs (eleven_v3 model)
- Voice ID: `ELEVENLABS_VOICE_ID` (configurable)
- Supported Languages: English, Vietnamese, Chinese
- Speed settings per language:
  - English: 0.85
  - Vietnamese: 0.80
  - Chinese: 0.75
- Output format: `mp3_44100_128`

**Fallback**: OpenAI TTS (gpt-4o-mini-tts)
- Voice: "nova" (clear and natural)
- Used if ElevenLabs fails
- Speed range: 0.25–4.0

**TTS Caching**:
- Server-side cache directory: `TTS_CACHE_DIR` (default: `./tts_cache`)
- TTL: 90 days
- Organized by language subdirectories (`en/`, `vi/`, `zh/`)
- Pre-generation on background tasks
- Cache warming endpoints available

---

#### D. Automatic Speech Recognition (ASR)
**Service**: OpenAI gpt-4o-transcribe (via OpenAI SDK)

**Features**:
- Transcribes child's pronunciation attempt
- Language hints for accuracy
- Supports WebM, WAV formats
- Max size: 1MB, duration: 0.3–5 seconds

**Implementation** (speech_service.py):
```python
async def transcribe_audio(
    audio_bytes: bytes,
    language: Language,
    openai_client: openai.AsyncOpenAI,
) -> str
```

---

#### E. Audio Feedback & Effects (useSoundEffects.ts)
**Purpose**: UI feedback sounds for interactions

**Sound Types**:
- `playChime()` - Success sound
- `playPop()` - Button press
- `playChamp()` - Victory sound

**Implementation**: Web Audio API oscillator nodes

---

### Audio Files and Caching

#### Pre-Generated Mascot Audio
**Service**: `mascotAudioApi.ts`

**Manifest Structure**:
- Categories: Random motivational, App shell, Login, Onboarding, etc.
- Each entry has: key, VI/EN/ZH text, URLs, template flag
- Module-level cache + text→key reverse lookup
- Critical audio preload on app startup

**Manifest Location**: `/api/mascot/manifest` (JSON file)
**Audio Endpoints**: `/api/mascot/{key}/{language}`

**Example Categories** (from voice_instructions.yml):
- `random_motivational` - Random encouragement phrases (8+ entries)
- `app_shell` - Navigation screen guidance (8+ entries)
- `login` - Login/onboarding (10+ entries)
- `reveal_card` - Card reveal reactions (4+ entries)
- `quest` - Quest descriptions
- `level_up` - Level up celebrations
- `error_overlay` - Error messages

---

### Audio in UI Components

#### RevealCard.tsx (48KB - Largest component)
**Purpose**: Display newly captured vocabulary card with pronunciation practice

**Audio Features**:
- Play word pronunciation (TTS via `playWordTTS()`)
- Play description TTS (`playDescriptionTTS()`)
- Voice recording for pronunciation check
- 3-second auto-stop recording
- Real-time listening indicator
- Mascot speaks encouragement phrases

**Audio State**:
```typescript
const [isListening, setIsListening] = useState(false);
const [isTTSLoading, setIsTTSLoading] = useState(false);
const mediaRecorderRef = useRef<MediaRecorder | null>(null);
const audioChunksRef = useRef<Blob[]>([]);
```

**Key Functions**:
- `startSpeechRecognition()` - Begin recording
- `playWordTTS()` - Play word audio
- `playDescriptionTTS()` - Play description
- Audio blob URL cleanup on unmount

---

#### VocabDetail.tsx (27KB)
**Purpose**: Practice pronunciation of previously captured words

**Audio Features**:
- Pre-play word pronunciation (auto before recording)
- 1200ms delay before recording starts
- 3-second recording
- Auto-speak via mascot
- Haptic feedback

---

### Audio API Integration (speechApi.ts)

```typescript
export const speechApi = {
  // Send pronunciation for evaluation
  pronounce: async (
    vocab_id: string,
    language: string,
    audio_base64: string
  ): Promise<PronunciationResponse>

  // Get pre-generated TTS (via streaming fetch)
  getTTSAudio: async (
    vocab_id: string,
    language: string,
    signal?: AbortSignal
  ): Promise<string>  // Returns blob URL

  // Get TTS for description
  getDescriptionTTSAudio: async (
    vocab_id: string,
    language: string,
    signal?: AbortSignal
  ): Promise<string>

  // Synthesize TTS from text
  synthesizeTTS: async (
    text: string,
    language: string,
    signal?: AbortSignal
  ): Promise<string>
}
```

**Response Structure** (PronunciationResponse):
```typescript
{
  stars: 1 | 2 | 3;                      // Rating
  match_type: 'exact' | 'contains' | 'no_match';
  transcript: string;                     // Recognized text
  feedback_vi: string;                    // Vietnamese feedback
  mastery: number;                        // Updated mastery
  evolved: boolean;                       // Card evolved?
  xp_earned: number;                      // XP reward
  total_xp: number;                       // User total XP
  image_url: string | null;              // Card image
}
```

---

## 4. REAL-TIME COMMUNICATION & ARCHITECTURE

### Current Implementation: REST API (No WebSocket/WebRTC)

**Communication Pattern**: 
- Simple HTTP/REST over Axios
- No persistent connections
- No real-time features currently

**Request Flow**:
1. Frontend captures image via camera
2. POST `/api/capture` with base64 image
3. Backend processes (AI vision, database)
4. Returns `CaptureResponse` JSON
5. Frontend updates UI

**Authentication**:
- JWT tokens in localStorage
- Bearer token in `Authorization` header
- Child ID in `X-Child-Id` header
- Token refresh via `/api/auth/refresh` (401 interceptor)

### Backend API Architecture

**FastAPI Framework**:
- Async/await throughout
- CORS middleware enabled
- Global error handlers
- Health check endpoint: `/health`

**Router Structure**:
```python
# app/api/router.py routes to:
├── /api/auth           # Authentication
├── /api/capture        # Vision AI processing
├── /api/pronounce      # Pronunciation evaluation
├── /api/tts/*          # Text-to-speech
├── /api/collection/*   # Vocab collection
├── /api/profile/*      # User profile
├── /api/leaderboard/*  # Rankings
├── /api/missions/*     # Quests
├── /api/parent/*       # Parent dashboard
├── /api/mascot/*       # Pre-generated audio
└── /health             # Health check
```

### WebSocket / Real-Time: NOT IMPLEMENTED
- No WebSocket connections
- No LiveKit integration
- No real-time collaboration
- No socket.io usage

**LiveKit References**: Only found in ElevenLabs SDK types (not used)

---

## 5. BACKEND/API INTEGRATION

### Backend Stack
- **Framework**: FastAPI (Python 3.12+)
- **ORM**: SQLAlchemy 2.0+ (async)
- **Database**: PostgreSQL (via asyncpg, Supabase)
- **Cache**: Redis
- **AI Orchestration**: BAML (Python client)
- **AI Models**:
  - Vision: GPT-4o → Gemini Flash → Claude Sonnet (fallback chain)
  - Speech: OpenAI gpt-4o-transcribe
  - TTS: ElevenLabs eleven_v3 (primary), OpenAI TTS (fallback)

### Key Backend Services

#### 1. Capture Service (capture_service.py)
```python
async def process_capture(
    image_base64: str,
    child: ChildProfile,
    db: AsyncSession,
    redis: Redis,
    settings: Settings,
) -> CaptureResponse
```

**Pipeline**:
1. Validate image (format, size)
2. Deduplication check (image hash)
3. AI vision processing (BAML IdentifyObject)
4. Rarity determination
5. Save to database
6. Update XP & missions
7. Pre-generate TTS (background task)
8. Return response

**Response**:
```typescript
{
  status: 'new_capture' | 'duplicate' | 'low_confidence',
  vocab_card: {
    id, word_en, word_vi, word_zh, phonetic_en,
    category, rarity_tier, description_vi, confidence, photo_url
  },
  xp_earned, total_xp, level, level_up,
  mission_updates: [],
  tts_urls: { en, vi, zh },
  description_tts_urls: { en?, vi?, zh? },
  message_vi: string
}
```

---

#### 2. Speech Service (speech_service.py)
**Components**:

a) **Pronunciation Evaluation**:
- Transcribe audio via OpenAI
- Compare to target word (case-insensitive, fuzzy matching)
- Generate 1–3 star rating
- Produce Vietnamese feedback via BAML

b) **TTS Synthesis**:
- Try ElevenLabs first
- Fallback to OpenAI if needed
- Cache MP3 files server-side

c) **ASR (Automatic Speech Recognition)**:
- OpenAI gpt-4o-transcribe
- Handles WebM and MP4 audio formats
- Language-aware transcription

---

#### 3. Vision Service (vision_service.py)
**BAML Functions**:

a) **IdentifyObject**: Basic object detection
```baml
function IdentifyObject(photo: image) -> VisionResult
```

b) **IdentifyObjectFiltered**: With parental content filter
```baml
function IdentifyObjectFiltered(
  photo: image,
  filter_level: FilterLevel
) -> VisionResult | BlockedResult
```

**Output Structure** (VisionResult):
```typescript
{
  status: 'success' | 'blocked',
  object_en: string,
  phonetic_en: string,        // IPA, e.g., /kæt/
  category: string,
  difficulty_vi: number,       // 1–5 scale
  description_vi: string,      // 2–3 sentence Vietnamese
  confidence: number           // 0.0–1.0
}
```

**Safety Checks**:
- Blocks weapons, alcohol, drugs, adult content, violence, hate symbols, gambling
- Strict filter: additional blocks for insects, medical imagery, skulls

---

#### 4. Game Service (game_service.py)
**Functions**:
- `on_pronunciation()` - Update mastery, XP, evolution
- Trigger mission progress checks
- Manage level-ups

---

#### 5. Rarity Service (rarity_service.py)
**Purpose**: Determine vocab rarity tier

**Tiers**: Common → Uncommon → Rare → Epic → Legendary

**Logic**: Based on difficulty_vi score and frequency

---

#### 6. TTS Service (tts_service.py)
**Functions**:
- `ensure_cached()` - Pre-generate and cache TTS
- `clear_cache()` - Remove cached files
- `warm_cache()` - Regenerate vocabulary TTS
- `get_urls()` - Build endpoint URLs
- `get_description_urls()` - Description URLs

---

### BAML Configuration

**BAML Files** (app/be/baml_src/):
- `clients.baml` - Provider definitions (OpenAI, Gemini, Claude, OpenRouter)
- `vision.baml` - Vision AI functions
- `speech.baml` - Pronunciation feedback generation
- `rarity.baml` - Rarity classification
- `types.baml` - Shared type definitions
- `safety.baml` - Safety checking (not actively used in core flow)

**Example BAML Function**:
```baml
function IdentifyObject(photo: image) -> VisionResult {
  client VisionFallback  // Uses OpenAI → Gemini → Claude
  
  prompt #"
    [Detailed system prompt]
    {{ ctx.output_format }}
    {{ photo }}
  "#
}
```

---

## 6. UI COMPONENTS & SCREENS

### Main Screens (20+ components)

1. **RevealCard.tsx** (48KB) - Newly captured word with pronunciation
2. **VocabDetail.tsx** (27KB) - Detailed vocab view & practice
3. **CollectionBook.tsx** (18KB) - Word vault/collection
4. **ProfileScreen.tsx** (33KB) - User profile & stats
5. **LeaderboardScreen.tsx** (16KB) - Global rankings
6. **LoginScreen.tsx** (15KB) - Authentication
7. **Onboarding.tsx** (13KB) - Intro tutorial (4 slides)
8. **QuestScreen.tsx** (20KB) - Daily/weekly missions
9. **LevelUpCelebration.tsx** (8KB) - Level up animation
10. **AIProcessingLoading.tsx** (6KB) - AI processing indicator
11. **MascotCharacter.tsx** (5KB) - Mascot animation/speaking
12. **DuplicateCaptureModal.tsx** (8KB) - Duplicate detection
13. **LanguageSelectScreen.tsx** (6KB) - Language choice
14. **BackgroundParallax.tsx** (2KB) - Parallax background
15. **ErrorOverlay.tsx** (5KB) - Error messages
16. **MissionOverlay.tsx** (5KB) - Mission completion
17. **XPFlyManager.tsx** (3KB) - XP particle effects
18. **TradingCard.tsx** (2KB) - Card display
19. **AnimatedNumber.tsx** (1KB) - Animated counters
20. **Skeleton.tsx** (4KB) - Loading placeholders

### UI Patterns

- **Animations**: Framer Motion for all transitions
- **Styling**: Tailwind CSS with custom theme
- **Icons**: Lucide React
- **Feedback**: Sound effects + haptic (mobile)
- **Effects**: Canvas confetti for celebrations

---

## 7. STATE MANAGEMENT - ZUSTAND

### gameStore.ts (Core Application State)

**State Interface**:
```typescript
interface GameState {
  // Server-synced state
  xp: number;
  streak: number;
  level: number;
  lastCapturedAt: string | null;
  capturedCount: number;
  collections: CapturedWord[];      // Captured vocab
  quests: Quest[];                   // Active missions
  levelUpMessage: {...} | null;      // Level up notification

  // Auth state
  accessToken: string | null;
  refreshToken: string | null;
  parentId: string | null;
  childId: string | null;
  childProfile: ChildProfile | null;

  // UI state
  mascotMessage: {...} | null;       // Mascot dialog
  target_language: 'en' | 'vi' | 'zh';
  secondary_language: string;

  // Daily usage tracking
  dailyUsageSeconds: number;
  dailyResetAt: string | null;
  isTimeLimitExceeded: boolean;
}
```

**Key Actions**:
- `setAuth()` - Login
- `logout()` - Logout
- `addCollection()` - Add vocab to collection
- `updateXP()` - Update XP
- `incrementUsageSeconds()` - Track usage time
- `checkAndResetDailyUsage()` - Reset daily limit
- `hydrateFromStorage()` - Load state from localStorage

**Persistence**: localStorage keys
- `snap-learn-access-token`
- `snap-learn-refresh-token`
- `snap-learn-child-id`
- `snap-learn-parent-id`
- `snap-learn-game-state` (main state)

---

## 8. iOS / MOBILE SPECIFIC CODE

### iOS Support Status: PARTIAL

**Currently Implemented**:
- ✅ PWA configuration (manifest.json, meta tags)
- ✅ Mobile viewport settings
- ✅ Apple mobile app capable meta tags
- ✅ Standalone display mode
- ✅ HTTPS via basicSsl plugin
- ✅ Responsive design (Tailwind)
- ✅ Touch-friendly UI
- ✅ Haptic feedback (if supported)

**iOS Considerations**:
- ⚠️ MediaRecorder audio format detection (may produce MP4 instead of WebM)
- ⚠️ Camera access permissions
- ⚠️ Microphone access permissions
- ⚠️ AudioContext unlock during gestures

**No Native Code**:
- No Capacitor / Cordova integration
- No React Native
- No platform-specific iOS code
- Pure web app (PWA model)

**Potential iOS Issues**:
1. MediaRecorder MIME type mismatch
2. Background audio limitations
3. Service worker limitations

### Recommended iOS Fixes
```typescript
// Detect iOS and adjust audio format
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
const mimeType = isIOS 
  ? 'audio/mp4;codecs=mp4a.40.2'
  : 'audio/webm;codecs=opus';
```

---

## 9. ENVIRONMENT VARIABLES & CONFIGURATION

### Required Variables
```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/snaplearn

# Redis
REDIS_URL=redis://host:6379

# Authentication
JWT_SECRET_KEY=<secret>

# AI APIs
OPENAI_API_KEY=sk-...
```

### Optional Variables
```bash
# TTS Providers
ELEVENLABS_API_KEY=<key>
ELEVENLABS_VOICE_ID=<voice>
OPENROUTER_API_KEY=sk-or-...

# Application
ENVIRONMENT=development|production
DEBUG=true|false
LOG_LEVEL=DEBUG|INFO|WARNING

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8000

# Rate Limiting
CAPTURES_PER_DAY_FREE=5
CAPTURES_PER_DAY_PREMIUM=50
PRONUNCIATIONS_PER_DAY_FREE=15
PRONUNCIATIONS_PER_DAY_PREMIUM=100
DAILY_TIME_LIMIT_MINUTES=30

# Directories
UPLOAD_DIR=./uploads
TTS_CACHE_DIR=./tts_cache
CHROMADB_DIR=./chromadb_data

# Frontend
VITE_API_BASE_URL=http://backend:8000/api
VITE_BACKEND_URL=http://localhost:8000
```

### Backend Settings (app/be/app/config.py)
- `ACCESS_TOKEN_EXPIRE_MINUTES`: 30
- `REFRESH_TOKEN_EXPIRE_DAYS`: 7
- `TTS_CACHE_TTL_DAYS`: 90

---

## 10. LIVEKIT INTEGRATION STATUS

### Summary: NOT INTEGRATED

**Where LiveKit Appears**:
- Only in ElevenLabs SDK types (`elevenlabs-1.50.0` package)
- Related to phone/conversational AI features in ElevenLabs
- Not used in SnapLearn codebase

**What's Actually Used for Real-Time**:
- **None** - No real-time features currently
- REST API only (HTTP requests/responses)
- Stateless backend (no persistent connections)
- No voice chat or peer connections

**If Real-Time Were Needed**:
- WebSocket (Python: `python-socketio`, JavaScript: `socket.io`)
- LiveKit (for peer-to-peer video/voice)
- gRPC (for low-latency)
- SSE (Server-Sent Events)

---

## 11. DATABASE SCHEMA & MODELS

### Core Models (SQLAlchemy)

1. **ChildProfile** - User profile
   - id, parent_id, name, avatar, language_preference
   - xp, level, streak, created_at

2. **CapturedVocab** - Captured word
   - id, child_id, word_en, word_vi, word_zh
   - phonetic_en, category, rarity_tier
   - photo_url, confidence, mastery, attempts
   - captured_at, description_vi

3. **Mission** - Quest/challenge
   - id, child_id, title, description, category
   - progress, target, reward_xp, status

4. **LeaderboardEntry** - Ranking
   - id, child_id, rank, points, updated_at

5. **ActivityLog** - User activity tracking
   - id, child_id, action, metadata, timestamp

6. **Badge** - Achievement system
   - id, child_id, name, awarded_at

### Data Management

**Async Database Connection**:
- SQLAlchemy with asyncpg
- Connection pooling
- Session management via dependency injection

**Redis Usage**:
- Session caching
- Rate limit tracking
- Deduplication checks

**Search Engine**:
- ChromaDB for vector similarity search
- Embeddings for vocab lookup
- Hybrid search (semantic + keyword)

---

## 12. KEY INSIGHTS & ARCHITECTURE PATTERNS

### Design Patterns Used

1. **Dependency Injection** (FastAPI)
   - Authentication checks
   - Database sessions
   - Settings/config

2. **Service Layer** (Backend)
   - Separation of concerns
   - Reusable business logic
   - Easy testing

3. **State Management** (Zustand)
   - Single source of truth
   - Immutable updates
   - Persist to localStorage

4. **Fallback Chains** (BAML)
   - Vision: GPT-4o → Gemini → Claude
   - TTS: ElevenLabs → OpenAI
   - Graceful degradation

5. **Component Composition** (React)
   - Modular UI components
   - Reusable hooks
   - Clear prop interfaces

6. **Async/Await** (Python & JavaScript)
   - Non-blocking I/O
   - Concurrent requests
   - Promise-based error handling

### Performance Optimizations

1. **Audio Context Singleton** - Prevents mobile audio blocking
2. **TTS Pre-Generation** - Background task, not blocking
3. **Blob URL Management** - Manual cleanup to prevent memory leaks
4. **Module-Level Caching** - Manifest, settings
5. **Request Debouncing** - No duplicate API calls
6. **Image Deduplication** - Hash-based check before processing

### Security Considerations

1. **JWT Authentication** - Tokens in localStorage + Bearer headers
2. **Token Refresh** - 401 interceptor with queue management
3. **CORS** - Configured origin allowlist
4. **Content Filtering** - AI-based safety checks (blocked/safe)
5. **Rate Limiting** - Per-child daily capture/pronunciation limits
6. **Input Validation** - Pydantic schemas on backend

---

## 13. TESTING & DEVELOPMENT

### Test Setup (app/be/tests/)
- Pytest with pytest-asyncio
- Async test fixtures
- Mock data for development

### Development Tools
- Makefile for common commands
- Docker Compose for local environment
- Hot reload (Vite frontend, uvicorn backend)
- Environment variable management (.env files)

### Mock Data
- `_docs/mock_data/` directory
- Reference vocabulary JSON
- Sample pronunciation results
- Activity feed examples

---

## 14. DEPLOYMENT & INFRASTRUCTURE

### Docker Setup
```bash
docker-compose up                    # Full stack
docker-compose -f docker-compose.dev.yml up  # Dev mode
```

### Services Deployed
- Frontend (Vite development server or production build)
- Backend (FastAPI + uvicorn)
- Database (PostgreSQL)
- Redis cache
- ChromaDB (vector DB)

### Environment Profiles
- Development (localhost:3000 & :8000)
- Production (env vars, HTTPS, optimizations)

---

## 15. KNOWN LIMITATIONS & FUTURE WORK

### Current Limitations
1. No real-time features (WebSocket)
2. No offline support (Service Worker commented out)
3. iOS audio format detection missing
4. Single-player only (no collaboration)
5. No video/streaming capabilities

### Future Roadmap (from README)
- 🇨🇳 Chinese language support (partial: zh_ZH vocabulary)
- 🎯 Daily/weekly missions (partially implemented)
- 👨‍👩‍👧 Parent dashboard (API exists, UI in progress)
- 🏫 School deployments
- 💬 Conversational AI (follow-up questions)
- 🧸 Hardware devices (SnapBear plush toy)
- 🌐 Multiplayer features
- 📊 Advanced analytics

---

## 16. SUMMARY TABLE

| Aspect | Technology | Status |
|--------|-----------|--------|
| **Frontend Framework** | React 19 + TypeScript | ✅ Active |
| **State Management** | Zustand | ✅ Active |
| **Animation** | Framer Motion | ✅ Active |
| **Styling** | Tailwind CSS | ✅ Active |
| **Build Tool** | Vite | ✅ Active |
| **PWA** | vite-plugin-pwa | ✅ Configured |
| **HTTP Client** | Axios | ✅ Active |
| **Backend Framework** | FastAPI | ✅ Active |
| **Database** | PostgreSQL (Supabase) | ✅ Active |
| **Cache** | Redis | ✅ Active |
| **ORM** | SQLAlchemy 2.0+ async | ✅ Active |
| **Vector DB** | ChromaDB | ✅ Active |
| **AI Orchestration** | BAML | ✅ Active |
| **Vision AI** | GPT-4o (fallback chain) | ✅ Active |
| **Speech-to-Text** | OpenAI gpt-4o-transcribe | ✅ Active |
| **Text-to-Speech** | ElevenLabs (OpenAI fallback) | ✅ Active |
| **Web Audio API** | AudioContext + MediaRecorder | ✅ Active |
| **WebSocket** | None | ❌ Not Implemented |
| **LiveKit** | None | ❌ Not Implemented |
| **iOS Support** | PWA (Web App) | ⚠️ Partial |
| **Real-Time Features** | None | ❌ Not Implemented |

---

## 17. REPOSITORY STRUCTURE QUICK REFERENCE

```
snap-learn-app/
├── app/
│   ├── be/                          # FastAPI Backend
│   │   ├── app/
│   │   │   ├── main.py             # Entry point
│   │   │   ├── config.py           # Settings
│   │   │   ├── api/                # Route handlers (capture, speech, etc.)
│   │   │   ├── services/           # Business logic (capture, speech, game, etc.)
│   │   │   ├── models/             # SQLAlchemy models
│   │   │   ├── schemas/            # Pydantic request/response schemas
│   │   │   ├── db/                 # Database setup
│   │   │   └── utils/              # Helpers (audio, image, errors, etc.)
│   │   ├── baml_src/               # BAML AI functions
│   │   ├── baml_client/            # Generated BAML Python client
│   │   ├── pyproject.toml          # Python dependencies
│   │   ├── Dockerfile             # Container image
│   │   └── README.md              # Backend docs
│   │
│   ├── fe/                         # React Frontend
│   │   ├── src/
│   │   │   ├── components/ui/      # 20+ UI screens
│   │   │   ├── services/           # API client services
│   │   │   ├── store/              # Zustand state
│   │   │   ├── utils/              # Helpers (audio, confetti, etc.)
│   │   │   ├── hooks/              # Custom hooks
│   │   │   ├── assets/             # Images, logos, fonts
│   │   │   ├── App.tsx             # Main component
│   │   │   ├── main.tsx            # Vite entry
│   │   │   └── index.css           # Global styles
│   │   ├── package.json            # npm dependencies
│   │   ├── vite.config.ts          # Vite + PWA config
│   │   ├── index.html              # PWA metadata
│   │   └── tailwind.config.js      # Tailwind theme
│   │
│   └── ai/                         # AI scripts
│       └── hybrid_search.py        # Vector search utilities
│
├── _docs/                          # Documentation & assets
│   ├── assets/                     # Screenshots, logos
│   ├── mockData/                   # Development data
│   └── scenario_samples/           # Usage examples
│
├── openspec/                       # Design documents
│   └── changes/                    # Feature specs
│
├── docker-compose*.yml             # Docker orchestration
├── Makefile                        # Build commands
└── README.md                       # Main docs
```

---

## CONCLUSION

SnapLearn is a **full-stack, production-ready web application** built with modern technologies:
- **Frontend**: React + TypeScript, Zustand state, Vite build
- **Backend**: FastAPI + SQLAlchemy, async/await throughout
- **AI**: BAML orchestration with fallback chains (vision, speech, TTS)
- **Audio**: Web Audio API (playback), MediaRecorder (recording), OpenAI + ElevenLabs (speech)
- **Database**: PostgreSQL + Redis + ChromaDB
- **Deployment**: Docker + Docker Compose

**Key Strengths**:
1. Comprehensive audio handling for pronunciation practice
2. Smart fallback chains for LLM robustness
3. Optimized for mobile (PWA, touch-friendly)
4. Clean architecture with service layer pattern
5. Type-safe throughout (TypeScript + Pydantic)

**Gaps for Future Enhancement**:
1. No real-time communication (WebSocket/LiveKit)
2. Limited iOS-specific optimizations
3. Service worker disabled (offline support)
4. No conversational AI features yet

