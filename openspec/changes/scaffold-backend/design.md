## Context

The SnapLearn backend currently consists of 3 BAML-based AI service wrappers (`vision_service.py`, `speech_service.py`, `rarity_service.py`), 8 BAML definition files, a Dockerfile, and a README. The root `docker-compose.yml` already defines Postgres 16, Redis 7, and the backend container with correct volume mounts and environment variables. The `_docs/backend.md` provides a detailed specification for the full backend: SQL schema, API endpoints, service logic (including code samples), error codes, rate limits, and background jobs.

The existing BAML services generate Pydantic types via `baml_client/` and use a declarative fallback chain (GPT-4o → Gemini Flash → Claude Sonnet). This is a higher-quality abstraction than the raw OpenAI calls described in the doc. The new scaffold must integrate with this layer, not replace it.

**Constraints:**
- Python 3.12, FastAPI, async-first (`async/await` everywhere)
- SQLAlchemy 2.0 async ORM (not sync)
- All game state (XP, levels, streaks, missions) is server-authoritative
- Vietnamese is the UI language for child-facing messages
- Local filesystem for photo/TTS storage (no cloud storage)
- The `app/be/` directory is mounted at `/app` inside Docker

## Goals / Non-Goals

**Goals:**
- Scaffold all files specified in `_docs/backend.md` so the backend is structurally complete
- Every file should contain real, functional implementation — not stubs or placeholders
- Preserve existing BAML-based services unchanged; new services call into them
- Backend should boot (`uvicorn app.main:app`) and pass a health check after scaffolding
- Alembic migration generates the full DB schema
- All endpoint routes are wired and return proper responses
- Auth flow (register → login → JWT → protected routes) works end-to-end

**Non-Goals:**
- Frontend integration testing (that's a separate effort)
- Production deployment hardening (TLS, secrets management, monitoring dashboards)
- Premium tier billing/payment integration
- Full test suite (test scaffolding only — `conftest.py` + one example test)
- Background job scheduler (APScheduler) wiring — logic exists in services, scheduler integration is Sprint 6
- OpenAPI doc customization beyond FastAPI defaults

## Decisions

### 1. Keep BAML services, adapt service layer around them

**Decision:** The new `capture_service.py` and other orchestration services call the existing BAML-based `vision_service.py`, `speech_service.py`, and `rarity_service.py` as-is. We do NOT rewrite them to use raw OpenAI SDK.

**Rationale:** BAML provides type-safe LLM interfaces, declarative fallback chains, and generated Pydantic models. This is strictly better than the hand-rolled approach in the doc. The doc's code samples serve as behavioral spec, not literal implementation.

**Alternative considered:** Rewrite services to match doc exactly (raw OpenAI calls). Rejected — would lose BAML benefits and discard working code.

### 2. Functional module pattern for services (not classes)

**Decision:** Follow the existing pattern in `vision_service.py` / `speech_service.py` — services are modules with async functions, not classes. Dependencies (DB session, Redis, config) are passed as function parameters or injected via FastAPI's `Depends()`.

**Rationale:** The existing code already uses this pattern. Class-based services (as shown in the doc) would require restructuring the BAML wrappers. Functional modules are simpler, more testable, and align with FastAPI's dependency injection.

**Alternative considered:** Class-based services with `__init__` injection (as in doc). Rejected for consistency with existing code.

### 3. SQLAlchemy 2.0 async with mapped_column

**Decision:** Use SQLAlchemy 2.0 `DeclarativeBase` with `Mapped[]` / `mapped_column()` type annotations. Async sessions via `create_async_engine` + `async_sessionmaker`.

**Rationale:** Modern SQLAlchemy 2.0 pattern with full type checking. The doc's SQL schema maps directly to these models.

### 4. Alembic with async support

**Decision:** Configure Alembic with `asyncpg` driver and `run_async` in `env.py`. Initial migration creates all 7 tables + indexes from the doc's SQL schema.

**Rationale:** Standard approach for async SQLAlchemy. Single initial migration for the full schema (no incremental migrations needed since this is greenfield).

### 5. JWT auth with Redis-backed refresh tokens

**Decision:** Access tokens (30min, stateless) + refresh tokens (7 days, stored as hash in Redis). Auth dependency extracts `parent_id` from JWT; child selection via `X-Child-Id` header validated against parent's children.

**Rationale:** Matches the doc's auth spec. Redis-backed refresh tokens allow revocation. The `X-Child-Id` header pattern avoids bloating JWTs while keeping child context per-request.

### 6. Error handling via custom exception classes + global handler

**Decision:** Define `AppError` base exception with `code`, `message_vi`, `message_en`, `status_code`. Register a global exception handler in FastAPI that formats all errors per the doc's error response spec.

**Rationale:** Consistent error format across all endpoints. Child-facing Vietnamese messages are defined alongside error codes, not scattered across route handlers.

### 7. Project dependencies managed via pyproject.toml + uv

**Decision:** Single `pyproject.toml` at `app/be/pyproject.toml` with all dependencies. Use `uv` as the package manager (already referenced in Dockerfile and docker-compose).

### 8. Rate limiting via Redis counters (not slowapi initially)

**Decision:** Implement rate limiting as a lightweight middleware/dependency using Redis `INCR` with TTL, matching the doc's per-child daily counters. Defer `slowapi` (per-IP general throttling) to Sprint 6.

**Rationale:** The critical rate limits are per-child (captures/day, pronunciations/day), which need child context from the auth layer. Generic IP-based throttling is a production hardening concern.

## Risks / Trade-offs

**[Risk] Large scaffold may have integration issues** → Mitigation: Structure tasks so the app boots incrementally. Core scaffold (main.py, config, DB) first, then layer-by-layer additions. Each task group should leave the app bootable.

**[Risk] BAML client types may conflict with hand-written Pydantic schemas** → Mitigation: API schemas (in `schemas/`) are separate from BAML-generated types. Services translate between them at the boundary. No direct exposure of BAML types in API responses.

**[Risk] Async SQLAlchemy + Alembic configuration can be tricky** → Mitigation: Use well-tested `asyncpg` driver pattern. The `env.py` async template is documented in Alembic docs.

**[Risk] The doc's code samples use `datetime.utcnow()` (deprecated in 3.12)** → Mitigation: Use `datetime.now(UTC)` throughout. This is a minor but important modernization.

**[Trade-off] Full scaffold vs. incremental sprints** → We're doing the full scaffold because having a structurally complete codebase makes subsequent sprint work much faster (no more "where does this go?" questions). The risk is that early files may need revision as later services reveal integration needs.

**[Trade-off] Functional services vs. class-based** → We gain consistency with existing BAML code and simpler testing, but lose the self-documenting class structure shown in the doc. This is acceptable for a backend of this size.

## Open Questions

- **BAML client generation**: Is `baml_client/` already generated or does it need a build step? The services import from it but the generated code isn't in the tree. Need to verify `baml_src/generators.baml` output config.
- **Schema.sql**: The docker-compose mounts `./app/be/data/schema.sql` for Postgres init. Should we generate this file alongside Alembic, or let Alembic be the sole schema source?
- **Seed data**: The docker-compose command runs `scripts/seed_reference_vocab.py` on startup. What reference vocab data should be seeded?
