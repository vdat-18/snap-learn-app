## Why

The SnapLearn backend scaffold (change: `scaffold-backend`) is 70% complete — all models, schemas, services, utilities, auth routes, and child routes are implemented. However, the API route handlers for the core features (capture, speech, collection, missions, leaderboard, profile, parent dashboard) are missing. Without these routes, the services are unreachable from the frontend. This change completes the remaining tasks: 9 API route modules, rate limiting, test scaffolding, seed scripts, and the SQL schema file.

## What Changes

- **9 API route handlers**: `capture.py`, `speech.py`, `collection.py`, `missions.py`, `leaderboard.py`, `profile.py`, `parent_gate.py`, `parent.py` — each wiring existing services to HTTP endpoints
- **Root router aggregation**: `router.py` combining all 11 sub-routers (auth, children + 9 new) under `/api`
- **Rate limiting service**: Redis-based per-child daily counters for captures and pronunciations, wired into capture and speech routes
- **Test scaffolding**: `conftest.py` with async DB/Redis fixtures, `test_health.py` smoke test
- **Scripts**: `seed_test_data.py`, `reset_leaderboard.py`, `seed_reference_vocab.py`
- **Data**: `schema.sql` for Docker Postgres init

## Capabilities

### New Capabilities
- `api-route-handlers`: All 9 remaining FastAPI route modules (capture, speech, collection, missions, leaderboard, profile, parent-gate, parent) plus the root router aggregator
- `rate-limit-service`: Redis-based per-child rate limiting for captures and pronunciation attempts, integrated as FastAPI dependencies
- `test-scaffold`: Test infrastructure (conftest.py, smoke tests) and developer scripts (seed data, leaderboard reset)

### Modified Capabilities
_(none — no existing spec requirements are changing, only adding route layer on top of existing services)_

## Impact

- **New files**: ~15 Python files in `app/be/app/api/`, `app/be/app/services/rate_limit_service.py`, `app/be/tests/`, `app/be/scripts/`, `app/be/data/`
- **Modified files**: `app/be/app/main.py` (router import update — may already be wired to `api.router`)
- **No service changes**: All existing services, models, schemas, and utils remain untouched
- **After completion**: The backend will be fully functional — all endpoints from `_docs/backend.md` section 5 will be reachable, the app will boot via `docker compose up`, and basic tests will pass
