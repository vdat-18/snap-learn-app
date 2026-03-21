## Why

The SnapLearn frontend and backend are **completely disconnected**. The backend has a fully implemented FastAPI server with 10 API route modules, JWT auth, BAML AI integration, Postgres, and Redis. The frontend is a polished Vite + React UI prototype running **entirely on mock data** — no `fetch()` calls, no HTTP client, no `services/` layer, no auth tokens. The core capture flow selects a random mock JSON response instead of calling the real AI vision pipeline.

Without this integration, the app cannot:
- Authenticate real users (login just sets a local name)
- Recognize real objects (capture returns random mock words)
- Persist any data across sessions (Zustand resets on reload)
- Practice pronunciation with real speech-to-text
- Show real leaderboard rankings
- Track progress server-side (XP, levels, streaks all computed client-side)

This change bridges the gap — creating the HTTP service layer, wiring real auth, and replacing every mock data path with live backend API calls.

## What Changes

1. **API client foundation** (`services/api.ts`) — Axios/fetch wrapper with base URL config, JWT Bearer header injection, automatic token refresh on 401, and structured error handling matching the backend's `AppError` format.

2. **Auth integration** — Replace the local-only `LoginScreen` (which just sets `userName` in Zustand) with real `POST /auth/register`, `POST /auth/login`, and `POST /auth/refresh`. Store tokens in memory + localStorage. Add a registration flow with email/password. Add child profile creation via `POST /children`.

3. **Capture flow integration** — Replace `MOCK_AI_RESPONSES` random selection in `App.tsx` with real `POST /api/capture` call. Send base64 camera image, receive `CaptureResponse` with vocab card, XP, level, mission updates, and TTS URLs — all from the server.

4. **Speech integration** — Replace `MOCK_PRON_RESULTS` in `RevealCard.tsx` with real `POST /api/pronounce` (sends audio to OpenAI Whisper) and `GET /api/tts/{vocab_id}/{lang}` for word playback.

5. **Collection integration** — Replace `gameStore.collections` local array with `GET /api/collection` and `GET /api/collection/{category}`. Vocab detail via `GET /api/vocab/{id}`.

6. **Mission integration** — Replace `MOCK_QUESTS` with `GET /api/missions`. Claim rewards via `POST /api/missions/{id}/claim`.

7. **Leaderboard integration** — Replace `MOCK_LEADERBOARD` with `GET /api/leaderboard/{scope}`.

8. **Profile integration** — Replace local Zustand stats with `GET /api/profile`.

9. **Parent gate & dashboard** — Wire `POST /api/parent-gate/challenge` and `/verify`. Connect parent dashboard to `GET /api/parent/dashboard`, activity feed, controls, and CSV export.

10. **gameStore refactor** — Transform from source-of-truth to server-state cache. Remove client-side XP/level/streak computation. Store receives server responses and mirrors them for reactive UI updates.

11. **Vite proxy config** — Add `/api` proxy to `vite.config.ts` pointing to `http://localhost:8000`.

## What Doesn't Change

- Backend API routes, services, models, schemas (all stay as-is)
- BAML AI service definitions
- Frontend visual design, animations, sound effects
- Component layout and styling (Tailwind classes untouched)
- PWA configuration
- Camera/audio Web API usage patterns (capture method stays the same)

## Scope

- **In scope**: All 10 frontend ↔ backend API integration points, auth flow, gameStore refactor, Vite proxy, error handling
- **Out of scope**: Offline/IndexedDB caching, Next.js migration, new UI features, backend code changes, deployment/Docker
- **Decision**: Continue with Vite (not migrate to Next.js)
- **Decision**: No IndexedDB offline storage — always online required
- **Decision**: Backend is already complete — this is purely a frontend integration effort
