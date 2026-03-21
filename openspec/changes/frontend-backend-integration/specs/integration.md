## API Client

The HTTP client must:
- Use axios with a pre-configured base URL (`/api` in dev, configurable for production)
- Attach `Authorization: Bearer {access_token}` to every request via request interceptor
- Attach `X-Child-Id: {child_id}` header to every authenticated request
- On 401 response: attempt token refresh via `POST /api/auth/refresh`, retry the original request, redirect to login on refresh failure
- Queue concurrent requests during token refresh (prevent multiple refresh calls)
- Parse error responses into `{ code: string, message_vi: string, message_en: string }` format
- Expose typed service functions (not raw axios calls) to components

## Auth Service

Must support:
- `register(email, password)` → `POST /api/auth/register` → returns `TokenResponse` with `parent_id`, tokens, empty children list
- `login(email, password)` → `POST /api/auth/login` → returns `TokenResponse` with `parent_id`, tokens, `children[]` with `{ id, name, avatar_id, level, total_xp }`
- `refreshToken(refresh_token)` → `POST /api/auth/refresh` → returns new `TokenResponse`
- `createChild(name, avatar_id, target_language)` → `POST /api/children` → returns child profile
- Token persistence: store access_token, refresh_token, parent_id, child_id in localStorage; hydrate on app load
- Logout: clear all stored tokens and redirect to login

## Capture Service

Must support:
- `capture(image_base64)` → `POST /api/capture` → returns `CaptureResponse`:
  - `status`: "new_capture" | "duplicate" | "low_confidence"
  - `vocab_card`: object with `id`, `word_en`, `word_vi`, `word_zh`, `pinyin`, `phonetic_en`, `category`, `rarity_tier`, `fun_fact_vi`, `confidence`, `photo_url`
  - `xp_earned`, `total_xp`, `level`, `level_up` (boolean)
  - `mission_updates[]`: array of `{ mission_id, description_vi, current_count, target_count, completed }`
  - `tts_urls`: `{ en, vi, zh }` — URLs for pre-generated audio
  - `message_vi`: feedback message (for low_confidence or blocked)
- Component must show loading state during the real API call (replace the fake 2500ms setTimeout)
- On "low_confidence": show child-friendly retry message
- On "duplicate": show duplicate modal with reduced XP
- On network error: show "AI buồn ngủ" error overlay

## Speech Service

Must support:
- `pronounce(vocab_id, language, audio_base64)` → `POST /api/pronounce` → returns:
  - `stars`: 1 or 3
  - `match_type`: "exact" | "contains" | "no_match"
  - `transcript`: what Whisper heard
  - `feedback_vi`: Vietnamese encouragement message
  - `mastery`: updated mastery level (0-5)
  - `evolved`: boolean (card just evolved)
  - `xp_earned`, `total_xp`
- `getTTSAudio(vocab_id, language)` → `GET /api/tts/{vocab_id}/{language}` → returns audio blob (MP3)
- Audio recording: capture from MediaRecorder as base64, send to backend
- TTS playback: fetch audio URL from capture response or on-demand, play via Audio API

## Collection Service

Must support:
- `getCollection()` → `GET /api/collection` → returns `{ total_words, categories[] }` where each category has `{ name, icon, captured, total, progress }`
- `getCategoryDetail(category)` → `GET /api/collection/{category}` → returns `{ category, captured_words[], undiscovered_count }`
- `getVocabDetail(vocab_id)` → `GET /api/vocab/{vocab_id}` → returns full vocab card with mastery, evolution status, fun facts, example sentences

## Mission Service

Must support:
- `getMissions()` → `GET /api/missions` → returns `{ daily[], weekly[], category_challenges[] }` where each mission has `{ id, type, description_vi, target_count, current_count, reward_xp, status, expires_at }`
- `claimMission(mission_id)` → `POST /api/missions/{mission_id}/claim` → returns `{ mission_id, xp_earned, total_xp, level, level_up, badge_earned }`

## Leaderboard Service

Must support:
- `getLeaderboard(scope, limit?)` → `GET /api/leaderboard/{scope}?limit=50` → returns `{ scope, period, entries[], my_rank, my_score, reset_date }`
  - Each entry: `{ rank, child_id, name, avatar_id, points }`
  - Scope: "global" | "class" | "friends"

## Profile Service

Must support:
- `getProfile()` → `GET /api/profile` → returns `{ id, name, avatar_id, target_language, secondary_language, total_xp, level, level_name, current_streak, longest_streak, badges[], stats }` where stats has `{ total_words, total_categories, words_this_week, pronunciations_total, missions_completed }`

## Parent Service

Must support:
- `getChallenge()` → `POST /api/parent-gate/challenge` → returns `{ challenge_id, question }`
- `verifyChallenge(challenge_id, answer)` → `POST /api/parent-gate/verify` → returns `{ verified, parent_token }`
- `getDashboard(child_id)` → `GET /api/parent/dashboard?child_id={id}` → returns full dashboard stats
- `getActivityFeed(child_id, limit, offset)` → `GET /api/parent/activity-feed?child_id={id}&limit=50&offset=0`
- `updateControls(child_id, updates)` → `PATCH /api/parent/controls` → updates parental settings
- `exportCSV(child_id)` → `GET /api/parent/export?child_id={id}` → returns CSV file download

## Vite Proxy

- Dev server proxies `/api` requests to `http://localhost:8000`
- Environment variable `VITE_API_BASE_URL` for production override (defaults to `/api`)

## gameStore Refactor

- Remove all client-side game logic: `addXP`, `addXPByRarity`, `syncLevel`, `LEVEL_REQUIREMENTS`, `checkAndUpdateStreak`, `recordCapture` (XP part), `isDuplicate`, `updateQuestProgress`, `completeQuest`
- Add auth state: `accessToken`, `refreshToken`, `parentId`, `childId`
- Add `setFromCaptureResponse(response)`: updates xp, level, streak, collections, missions from a single capture response
- Add `setFromProfileResponse(response)`: bulk-set profile data from server
- Keep UI-only state: `hasSeenOnboarding`, screen toggles, `dailyLimitMinutes` (mirrored from server), `todayUsageSeconds` (local timer)
- `collections[]` becomes a cache populated from API responses, not built from local captures
- `quests[]` fetched from API, not from MOCK_QUESTS
