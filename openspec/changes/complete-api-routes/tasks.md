## 1. Core API Route Handlers

- [x] 1.1 Create `app/be/app/api/capture.py` — `POST /capture` route: inject auth (parent + child), db, redis, settings; load `ChildProfile` from db; call `capture_service.process_capture()`; return `CaptureResponse`
- [x] 1.2 Create `app/be/app/api/speech.py` — `POST /pronounce` route: validate vocab ownership, decode audio base64, call `speech_service.judge_pronunciation()`, call `game_service.on_pronunciation()`, return `PronounceResponse`. `GET /tts/{vocab_id}/{language}` route: check cache, generate on miss via `speech_service.synthesize_speech()`, return `FileResponse` with audio/mpeg
- [x] 1.3 Create `app/be/app/api/collection.py` — `GET /collection`: query `CapturedVocab` grouped by category, compute progress using `CATEGORY_TOTALS` and `CATEGORY_ICONS`, return `CollectionResponse`. `GET /collection/{category}`: query vocab for category, return `CategoryDetailResponse`. `GET /vocab/{vocab_id}`: query single vocab with ownership check, return `VocabDetailResponse`
- [x] 1.4 Create `app/be/app/api/missions.py` — `GET /missions`: call `generate_daily_missions()` if needed, query all active/completed missions, group by type, return `MissionsListResponse`. `POST /missions/{mission_id}/claim`: call `mission_service.claim_mission()`, award XP via `game_service`, return `MissionClaimResponse`
- [x] 1.5 Create `app/be/app/api/leaderboard.py` — `GET /leaderboard/{scope}`: validate scope (global/class/friends), call `leaderboard_service.get_rankings()`, return `LeaderboardResponse`

## 2. Profile & Parent Routes

- [x] 2.1 Create `app/be/app/api/profile.py` — `GET /profile`: query child profile, badges, compute stats (total_words, total_categories, words_this_week, pronunciations_total, missions_completed), get level_name from constants, return `ProfileResponse`
- [x] 2.2 Create `app/be/app/api/parent_gate.py` — `POST /parent-gate/challenge`: generate random math problem (2 operands 10-99, operator +/-/*), store answer in Redis with 2-min TTL keyed by challenge_id UUID. `POST /parent-gate/verify`: lookup answer in Redis, compare, return `verified` + short-lived JWT (`type: parent_gate`, 5-min exp) on success, raise `ParentGateFailed` on failure
- [x] 2.3 Create `app/be/app/api/parent.py` — `GET /parent/dashboard?child_id=UUID`: verify parent gate token, query aggregated stats from `CapturedVocab`, `Mission`, `ActivityLog`, `ChildProfile`, return `DashboardResponse`. `GET /parent/activity-feed?child_id=UUID&limit=50&offset=0`: paginated query on `ActivityLog`, return `ActivityFeedResponse`. `PATCH /parent/controls`: validate parent gate token, update `ChildProfile` fields, return updated profile. `GET /parent/export?child_id=UUID`: query all vocab for child, stream CSV via `StreamingResponse`

## 3. Router Aggregation

- [x] 3.1 Create `app/be/app/api/router.py` — import all 11 sub-routers (auth, children, capture, speech, collection, missions, leaderboard, profile, parent_gate, parent), include each with appropriate prefix and OpenAPI tags

## 4. Test Scaffolding

- [x] 4.1 Create `app/be/tests/__init__.py` and `app/be/tests/conftest.py` — async fixtures: `db` (aiosqlite in-memory with all models created, auto-rollback), `redis` (fakeredis or mock), `client` (httpx.AsyncClient with app dependency overrides), mock fixtures for AI services
- [x] 4.2 Create `app/be/tests/test_health.py` — smoke test: GET /health returns 200 with `status: "healthy"`

## 5. Scripts & Data

- [x] 5.1 Create `app/be/scripts/seed_test_data.py` — create 1 parent (test@snaplearn.com), 2 children, 10 captured vocab across categories, 3 active missions
- [x] 5.2 Create `app/be/scripts/reset_leaderboard.py` — snapshot Redis leaderboard to `LeaderboardSnapshot` table, clear sorted sets for previous period
- [x] 5.3 Create `app/be/scripts/seed_reference_vocab.py` — no-op for now (CATEGORY_TOTALS already in constants.py). Prints confirmation message.
- [x] 5.4 Create `app/be/data/schema.sql` — full SQL schema (7 tables + `activity_log` + all indexes) matching `_docs/backend.md` section 4
