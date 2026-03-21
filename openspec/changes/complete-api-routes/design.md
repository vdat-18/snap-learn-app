## Context

The SnapLearn backend has all foundational layers built: config, DB models (7 tables), Pydantic schemas (8 modules), services (auth, capture, game, mission, leaderboard, dedup, storage, TTS, plus BAML-based vision/speech/rarity), utilities (security, image, audio, errors, constants), and two route modules (auth, children). The `main.py` already includes a root router from `app.api.router` but that module doesn't exist yet.

All services follow a functional module pattern — async functions that receive dependencies (db, redis, settings) as keyword arguments. Route handlers need to bridge FastAPI's dependency injection to these service functions.

**What exists:**
- `app/api/auth.py` — 3 routes (register, login, refresh)
- `app/api/children.py` — 3 routes (create, get, update child)
- `app/api/__init__.py` — empty

**What's missing:**
- 8 more route modules + root router aggregator
- Rate limiting service
- Test infrastructure + scripts + SQL schema

## Goals / Non-Goals

**Goals:**
- Every endpoint from `_docs/backend.md` section 5 has a working route handler
- Route handlers are thin — they validate input, call services, and return schemas
- Rate limiting is enforced on capture and pronunciation endpoints
- After this change, `docker compose up` boots a fully functional API
- Basic test infrastructure allows running `pytest` with mocked external services

**Non-Goals:**
- Comprehensive test coverage (only scaffolding + 1 smoke test)
- Background job scheduler wiring (APScheduler) — mission generation is triggered on-demand
- WebSocket or real-time features
- OpenAPI documentation customization
- File upload via multipart (images are base64 in JSON body, per existing schema)

## Decisions

### 1. Route handlers call services directly — no repository layer

**Decision:** Routes import service modules directly (e.g., `from app.services import capture_service`) and call their functions with injected dependencies. No intermediate repository abstraction.

**Rationale:** This matches the pattern already established in `auth.py` and `children.py`. The service layer already handles all DB queries internally. Adding a repo layer would be premature abstraction for a POC.

### 2. Rate limiting as a reusable dependency, not middleware

**Decision:** Implement rate limiting as a FastAPI `Depends()` function (`check_capture_rate_limit`, `check_pronunciation_rate_limit`) rather than global middleware.

**Rationale:** Rate limits are per-child, requiring auth context (child_id from JWT + X-Child-Id). Middleware runs before dependencies are resolved, so it can't access child context. A dependency runs after auth, has the child_id, and can enforce limits per-endpoint.

**Implementation:** Redis `INCR` with `EXPIRE` (TTL to midnight UTC+7). Key: `ratelimit:{type}:{child_id}:{date}`. Returns remaining count in response headers.

### 3. Parent gate tokens as short-lived JWTs

**Decision:** The parent gate generates a 5-minute JWT with `type: "parent_gate"` and `sub: parent_id`. Parent dashboard routes validate this token separately from the child-session access token.

**Rationale:** Keeps the parent gate stateless (no Redis storage for gate tokens). The 5-minute TTL is short enough that revocation isn't needed.

### 4. Router aggregation in `router.py` with consistent prefix/tags

**Decision:** Single `router.py` that imports all 11 sub-routers and includes them with consistent `/api/{domain}` prefixes and OpenAPI tags matching the domain name.

**Rationale:** Already referenced in `main.py`. Standard FastAPI pattern. Tags enable nice grouping in the auto-generated Swagger UI.

### 5. Collection endpoints query DB directly (no service layer)

**Decision:** The collection routes (`GET /collection`, `GET /collection/{category}`, `GET /vocab/{id}`) query the `CapturedVocab` model directly in the route handler, since there's no complex business logic — just filtering and aggregation.

**Rationale:** Creating a dedicated collection_service for simple SELECT queries adds indirection without value. If collection logic grows (e.g., recommendation engine), extract to a service then.

### 6. CSV export via streaming response

**Decision:** `GET /parent/export` uses `StreamingResponse` with `text/csv` content type, generating CSV rows from a DB query iterator.

**Rationale:** Avoids loading entire vocab collection into memory. Standard approach for file downloads in FastAPI.

## Risks / Trade-offs

**[Risk] Router import may fail if any route module has import errors** → Mitigation: Each route module should be independently importable. Services are imported at call time, not module level, where feasible.

**[Risk] Rate limit clock skew between Redis TTL and UTC+7 midnight** → Mitigation: Calculate seconds until next midnight in UTC+7 and set that as the TTL, rather than using a fixed 86400s TTL.

**[Trade-off] Collection queries in route handlers vs. service module** → We gain simplicity but lose consistency with the service-per-domain pattern. Acceptable for POC scope.

**[Trade-off] Parent gate as JWT vs. Redis-stored token** → JWT is stateless (can't revoke a gate token once issued), but 5-minute TTL makes this negligible risk.
