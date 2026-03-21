## Architecture

### Integration Layer Design

The integration follows a **3-layer architecture** between components and the backend:

```
┌─────────────────────────────────────────────────────────────────┐
│                     REACT COMPONENTS                            │
│  App.tsx, LoginScreen, RevealCard, CollectionBook, etc.         │
│  (UI logic, event handlers, rendering)                          │
└─────────────────┬──────────────────────────────┬────────────────┘
                  │ read state                   │ dispatch actions
                  ▼                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     ZUSTAND STORE (gameStore.ts)                │
│  Role: SERVER STATE CACHE (not source of truth)                 │
│                                                                 │
│  ┌─────────────┐ ┌────────────┐ ┌──────────┐ ┌─────────────┐  │
│  │ auth state  │ │ child      │ │ game     │ │ UI state    │  │
│  │ tokens      │ │ profile    │ │ xp,level │ │ onboarding  │  │
│  │ parent_id   │ │ name,avatar│ │ streak   │ │ daily limit │  │
│  │ child_id    │ │ language   │ │ missions │ │             │  │
│  └─────────────┘ └────────────┘ └──────────┘ └─────────────┘  │
└─────────────────────────┬───────────────────────────────────────┘
                          │ calls
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                     SERVICES LAYER (NEW)                        │
│                                                                 │
│  ┌──────────┐  ┌──────────────┐  ┌─────────────────────────┐  │
│  │ api.ts   │  │ authApi.ts   │  │ captureApi.ts           │  │
│  │          │  │              │  │ speechApi.ts            │  │
│  │ • axios  │  │ • register   │  │ collectionApi.ts        │  │
│  │ • JWT    │  │ • login      │  │ missionApi.ts           │  │
│  │ • refresh│  │ • refresh    │  │ leaderboardApi.ts       │  │
│  │ • errors │  │ • logout     │  │ profileApi.ts           │  │
│  │          │  │              │  │ parentApi.ts            │  │
│  └────┬─────┘  └──────┬───────┘  └────────────┬────────────┘  │
│       │               │                        │               │
└───────┼───────────────┼────────────────────────┼───────────────┘
        │               │                        │
        ▼               ▼                        ▼
┌─────────────────────────────────────────────────────────────────┐
│              VITE DEV PROXY → http://localhost:8000              │
│              (Production: direct CORS or reverse proxy)         │
└─────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────┐
│                     FASTAPI BACKEND (existing)                   │
│  /api/auth/* · /api/capture · /api/pronounce · /api/collection  │
│  /api/missions · /api/leaderboard · /api/profile · /api/parent  │
└─────────────────────────────────────────────────────────────────┘
```

### Auth Token Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  LOGIN/REGISTER                                                  │
│  ┌──────────┐    POST /auth/login     ┌──────────────────────┐  │
│  │  Login   │ ───────────────────────► │  Backend             │  │
│  │  Screen  │                          │  Returns:            │  │
│  │          │ ◄─────────────────────── │  • access_token      │  │
│  └──────────┘    TokenResponse         │  • refresh_token     │  │
│       │                                │  • children[]        │  │
│       ▼                                └──────────────────────┘  │
│  Store tokens in:                                                │
│  • Zustand (in-memory, for reactive UI)                          │
│  • localStorage (for page reload persistence)                    │
│                                                                  │
│  EVERY API REQUEST                                               │
│  ┌──────────┐    Authorization: Bearer {access_token}            │
│  │  api.ts  │ ──────────────────────────────────────────────►    │
│  │ request  │    X-Child-Id: {child_id}                          │
│  │ intercep │                                                    │
│  └──────────┘                                                    │
│                                                                  │
│  ON 401 RESPONSE                                                 │
│  ┌──────────┐    POST /auth/refresh    ┌──────────────────────┐  │
│  │ response │ ───────────────────────► │  Backend             │  │
│  │ intercep │    { refresh_token }     │  Returns new tokens  │  │
│  │          │ ◄─────────────────────── │  or 401 (re-login)   │  │
│  └──────────┘                          └──────────────────────┘  │
│       │                                                          │
│       ├── Success: retry original request with new token         │
│       └── Failure: redirect to LoginScreen                       │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Capture Flow (Before → After)

```
BEFORE (mock):
  Camera capture → canvas.toDataURL() → setTimeout(2500ms)
    → random MOCK_AI_RESPONSES pick → setCapturedResult → addXP locally

AFTER (real):
  Camera capture → canvas.toDataURL() → POST /api/capture { image_base64 }
    → Backend: validate → dedup → BAML vision → rarity → save → XP
    → CaptureResponse { vocab_card, xp_earned, total_xp, level, missions, tts_urls }
    → Update gameStore with server state
    → Show RevealCard with real data
```

### gameStore Refactor Strategy

The store transforms from **computing state** to **caching server state**:

```
REMOVED (server does this now):        KEPT (UI-only state):
─────────────────────────               ──────────────────────
addXP() with local calc                hasSeenOnboarding
addXPByRarity()                        showSplash / screen toggles
syncLevel() / LEVEL_REQUIREMENTS       dailyLimitMinutes (mirror of server)
checkAndUpdateStreak()                  todayUsageSeconds (local timer)
isDuplicate() local check              isOnline
updateQuestProgress() local
recordCapture() local count

ADDED:                                  CHANGED:
──────                                  ────────
auth state (tokens, parent_id)          collections[] → fetched, not built locally
child state (child_id, profile)         quests[] → fetched from /api/missions
setServerState() bulk update            xp/level/streak → set from server response
```

## Key Decisions

1. **Axios over native fetch** — Interceptors for JWT injection and token refresh are cleaner with axios. Bundle size impact is negligible for a PWA.

2. **Token storage: localStorage + Zustand** — localStorage survives page reloads; Zustand provides reactive updates. On app load, hydrate Zustand from localStorage.

3. **No React Query / SWR** — For a POC, direct axios calls in services keep complexity low. The app has few data-fetching screens and no complex cache invalidation needs.

4. **Incremental integration, not big-bang** — Each service file is independent. Auth must come first (everything needs tokens), then capture (core loop), then remaining screens. Components can fall back to mock data while their service isn't wired yet.

5. **Error mapping** — Backend returns `{ error: { code, message_vi, message_en } }`. The API client maps these to typed error objects. Components show `message_vi` to children (the primary audience).

6. **Child selection** — After login, if the parent has children, auto-select the first one. If no children exist, prompt to create one. The `X-Child-Id` header is set globally in axios defaults after selection.

## Risks

- **Backend API untested end-to-end** — Routes are built but may have bugs when hit with real data. Need to test capture flow with actual images.
- **CORS configuration** — Backend allows `localhost:3000` but frontend runs on `localhost:5173`. The Vite proxy handles dev, but CORS config may need updating for non-proxied requests.
- **Token refresh race conditions** — Multiple concurrent requests hitting 401 could trigger multiple refresh attempts. The interceptor needs a queue/lock mechanism.
- **Audio format compatibility** — `MediaRecorder` produces WebM in Chrome, different formats in Safari. Backend `speech_service` may need format handling.
- **No child creation UI** — Current `LoginScreen` has name + avatar but no email/password. Need to add registration fields or a separate registration screen.
