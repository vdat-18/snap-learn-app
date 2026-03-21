## Phase 1: Foundation (API client + Auth + Vite proxy)

Everything else depends on auth working first. No API call succeeds without a JWT token.

- [x] 1.1 Install axios: `npm install axios` in `app/fe/`
- [x] 1.2 Create `app/fe/src/services/api.ts` — axios instance with base URL from `VITE_API_BASE_URL` env var (default: `/api`), request interceptor that attaches `Authorization: Bearer {token}` and `X-Child-Id` headers from gameStore, response interceptor that catches 401 and attempts token refresh with retry queue, error interceptor that parses backend `AppError` format `{ error: { code, message_vi, message_en } }` into typed `ApiError` objects
- [x] 1.3 Create `app/fe/src/services/authApi.ts` — `register(email, password)` → POST /auth/register, `login(email, password)` → POST /auth/login, `refreshToken(token)` → POST /auth/refresh, `createChild(name, avatar_id, target_language)` → POST /children. Each function returns typed response matching backend schemas.
- [x] 1.4 Add auth state to `gameStore.ts` — new fields: `accessToken`, `refreshToken`, `parentId`, `childId`, `childProfile` (name, avatar, level, xp). Actions: `setAuth(tokens, parentId)`, `setChild(childId, profile)`, `clearAuth()`, `hydrateFromStorage()`. On `setAuth`: persist tokens + parentId to localStorage. On app mount: call `hydrateFromStorage()` to restore session.
- [x] 1.5 Refactor `LoginScreen.tsx` — add email + password fields for registration/login (toggle between modes). On submit: call `authApi.register()` or `authApi.login()`. On success: store tokens via `gameStore.setAuth()`, if `children[]` is non-empty select first child and call `gameStore.setChild()`, if no children show child-creation form (name + avatar + language picker → `authApi.createChild()`). Remove the old `setUserName`/`setUserAvatar` direct calls.
- [x] 1.6 Update `app/fe/vite.config.ts` — add dev server proxy: `server.proxy['/api'] = { target: 'http://localhost:8000', changeOrigin: true }`. Also update CORS: add `http://localhost:5173` to backend's `ALLOWED_ORIGINS` in `.env` (or document it).
- [x] 1.7 Update `App.tsx` auth guard — on mount, check if `gameStore.accessToken` exists + is not expired. If expired, attempt refresh. If no token, show LoginScreen. Replace the `!userName` check with `!accessToken || !childId` check.

## Phase 2: Core Capture Flow (the heart of the app)

This is the primary user experience — camera snap → real AI → real vocab card.

- [x] 2.1 Create `app/fe/src/services/captureApi.ts` — `capture(image_base64: string)` → POST /capture with `{ image_base64 }` body. Returns typed `CaptureResponse`. Handle loading state in caller.
- [x] 2.2 Refactor `handleCaptureClick()` in `App.tsx` — remove the `setTimeout` + `MOCK_AI_RESPONSES` block entirely. Replace with: set `isAIProcessing=true`, call `captureApi.capture(imageData)`, on success: map `CaptureResponse` to `capturedResult` state (map `rarity_tier` → capitalized rarity, `category` → capitalized category), set `isAIProcessing=false`, open RevealCard. On "low_confidence": show error overlay with `message_vi`. On network error: show "AI buồn ngủ" overlay. Remove local `addXP()` and `recordCapture()` calls — XP now comes from server response.
- [x] 2.3 Add `setFromCaptureResponse(response)` to `gameStore.ts` — updates `xp` from `response.total_xp`, `level` from `response.level`, detects level-up from `response.level_up` and sets `levelUpMessage`, pushes `response.vocab_card` to `collections[]` cache (if status is "new_capture").
- [x] 2.4 Remove mock data imports from `App.tsx` — delete `import { MOCK_AI_RESPONSES } from './store/mockData'`. The component should no longer reference mock data.

## Phase 3: Speech & Pronunciation

Wire real speech-to-text and text-to-speech for the pronunciation practice flow.

- [x] 3.1 Create `app/fe/src/services/speechApi.ts` — `pronounce(vocab_id: string, language: string, audio_base64: string)` → POST /pronounce. `getTTSAudio(vocab_id: string, language: string)` → GET /tts/{vocab_id}/{language} (returns blob URL).
- [x] 3.2 Refactor `RevealCard.tsx` pronunciation flow — replace `MOCK_PRON_RESULTS` random selection with real API call. On PTT release: convert MediaRecorder blob to base64, call `speechApi.pronounce(vocabId, language, audioBase64)`. Map response `stars` to star display. Show `feedback_vi` as encouragement text. Update `attemptCount` from response. On `evolved=true`: trigger evolution animation + celebration. Remove `MOCK_PRON_RESULTS` import.
- [x] 3.3 Refactor `RevealCard.tsx` TTS playback — replace Web Speech API `speechSynthesis` calls with `speechApi.getTTSAudio()` for word pronunciation. Use the `tts_urls` from capture response for initial playback. Fall back to Web Speech API if TTS endpoint fails.
- [x] 3.4 Refactor `VocabDetail.tsx` practice flow — replace `gameStore.practiceWord()` local call with `speechApi.pronounce()` API call. Update mastery display from server response. Remove local XP calculation.

## Phase 4: Collection, Missions, Leaderboard, Profile

Wire the remaining read-heavy screens to their backend endpoints.

- [x] 4.1 Create `app/fe/src/services/collectionApi.ts` — `getCollection()` → GET /collection. `getCategoryDetail(category)` → GET /collection/{category}. `getVocabDetail(vocabId)` → GET /vocab/{vocabId}.
- [x] 4.2 Refactor `CollectionBook.tsx` — on open: call `collectionApi.getCollection()` to fetch categories with progress. On category tap: call `collectionApi.getCategoryDetail(category)` to fetch captured words + undiscovered count. Remove dependency on `gameStore.collections` for display. Remove `MOCK_REFERENCE_VOCAB` import. Add loading states for each fetch.
- [x] 4.3 Create `app/fe/src/services/missionApi.ts` — `getMissions()` → GET /missions. `claimMission(missionId)` → POST /missions/{missionId}/claim.
- [x] 4.4 Refactor `QuestScreen.tsx` — on open: call `missionApi.getMissions()` to fetch `{ daily, weekly, category_challenges }`. Map `MissionResponse` to existing Quest UI format. On "Claim Reward" tap: call `missionApi.claimMission(id)`, update gameStore XP/level from response. Remove `MOCK_QUESTS` dependency. Add loading state.
- [x] 4.5 Create `app/fe/src/services/leaderboardApi.ts` — `getLeaderboard(scope, limit?)` → GET /leaderboard/{scope}.
- [x] 4.6 Refactor `LeaderboardScreen.tsx` — on open + on tab change: call `leaderboardApi.getLeaderboard(scope)`. Map `RankEntry[]` to existing UI format (top3 podium + ranked list). Show `my_rank` and `my_score` in sticky bar. Show `reset_date` in countdown timer. Remove `MOCK_LEADERBOARD` import. Add loading state.
- [x] 4.7 Create `app/fe/src/services/profileApi.ts` — `getProfile()` → GET /profile.
- [x] 4.8 Refactor `ProfileScreen.tsx` — on open: call `profileApi.getProfile()`. Display `level_name`, `badges[]`, `stats` from server. Remove local badge evaluation logic (`evaluateBadge` function). Remove `MOCK_BADGES` import. Add loading state.

## Phase 5: Parent Gate & Dashboard

Wire parental controls — lower priority since it's behind the parent gate.

- [x] 5.1 Create `app/fe/src/services/parentApi.ts` — `getChallenge()` → POST /parent-gate/challenge. `verifyChallenge(challenge_id, answer)` → POST /parent-gate/verify. `getDashboard(child_id)` → GET /parent/dashboard. `getActivityFeed(child_id, limit, offset)` → GET /parent/activity-feed. `updateControls(child_id, updates)` → PATCH /parent/controls. `exportCSV(child_id)` → GET /parent/export (file download).
- [x] 5.2 Refactor parent gate in `ProfileScreen.tsx` — replace hardcoded math problem (7 + 8 = 15) with `parentApi.getChallenge()` which returns a random server-generated problem. On answer submit: call `parentApi.verifyChallenge()`. On success: store `parent_token` and navigate to parent dashboard.
- [x] 5.3 Wire parent dashboard (if ParentDashboard component exists, or create minimal version) — fetch `parentApi.getDashboard(childId)` for overview stats, word trends, language breakdown, pronunciation mastery. Fetch `parentApi.getActivityFeed()` for activity log. Wire `parentApi.updateControls()` for parental settings (time limit, language, photo storage). Wire `parentApi.exportCSV()` for CSV download button.

## Phase 6: Cleanup & Hardening

Remove all mock data dependencies and polish error handling.

- [ ] 6.1 Refactor `gameStore.ts` final cleanup — remove all client-side game computation: `addXP()`, `addXPByRarity()`, `syncLevel()`, `LEVEL_REQUIREMENTS` calculation, `checkAndUpdateStreak()`, `isDuplicate()`, `updateQuestProgress()` local logic, `completeQuest()` local XP award. These are now server-side operations. Keep: `hasSeenOnboarding`, `todayUsageSeconds`, `isOnline`, screen toggle states, `setFromCaptureResponse()`, `setFromProfileResponse()`, auth state.
- [ ] 6.2 Remove or deprecate `app/fe/src/store/mockData.ts` — once all components use real APIs, this file should be removed (or kept with a `// DEPRECATED` comment for reference only). Delete all `MOCK_*` imports from components.
- [ ] 6.3 Add network error handling to all screens — use the `ErrorOverlay` component for connection failures. Show child-friendly Vietnamese messages. Add retry buttons. Detect offline state via `navigator.onLine` and show "📡 Mất kết nối!" overlay.
- [ ] 6.4 Add loading skeletons to data-fetching screens — Collection, Quests, Leaderboard, Profile should show skeleton/shimmer UI while fetching. Camera screen already has `AIProcessingLoading` component.
- [ ] 6.5 Test end-to-end flow — register parent → create child → capture photo → see real AI result → practice pronunciation → check collection → view missions → check leaderboard → view profile → parent gate → parent dashboard.
