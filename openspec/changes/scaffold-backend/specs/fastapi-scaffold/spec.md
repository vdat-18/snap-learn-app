## ADDED Requirements

### Requirement: FastAPI application entrypoint
The system SHALL create a FastAPI application in `app/main.py` with lifespan events that initialize and tear down database and Redis connections.

#### Scenario: Application startup
- **WHEN** the application starts via `uvicorn app.main:app`
- **THEN** the system SHALL initialize the async SQLAlchemy engine, create the Redis connection pool, and register all API routers under the `/api` prefix

#### Scenario: Application shutdown
- **WHEN** the application shuts down
- **THEN** the system SHALL dispose of the SQLAlchemy engine and close the Redis connection pool

### Requirement: Application configuration via environment variables
The system SHALL load all configuration from environment variables using Pydantic `BaseSettings` in `app/config.py`. Required variables: `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET_KEY`, `OPENAI_API_KEY`. Optional variables with defaults: `ENVIRONMENT` (default: "development"), `DEBUG` (default: false), `LOG_LEVEL` (default: "INFO"), `ALLOWED_ORIGINS`, `UPLOAD_DIR`, `TTS_CACHE_DIR`, `LOG_DIR`.

#### Scenario: Missing required configuration
- **WHEN** a required environment variable (e.g., `DATABASE_URL`) is not set
- **THEN** the application SHALL fail to start with a clear validation error message

#### Scenario: Default configuration values
- **WHEN** optional environment variables are not set
- **THEN** the system SHALL use default values (e.g., `LOG_LEVEL=INFO`, `ENVIRONMENT=development`)

### Requirement: CORS middleware
The system SHALL configure CORS middleware allowing origins from the `ALLOWED_ORIGINS` configuration, supporting credentials, all HTTP methods, and all headers.

#### Scenario: Cross-origin request from allowed origin
- **WHEN** a request arrives from an origin in `ALLOWED_ORIGINS`
- **THEN** the system SHALL include appropriate CORS headers in the response

### Requirement: Global error handling
The system SHALL register a global exception handler that catches all `AppError` subclasses and returns JSON in the format: `{"error": {"code": "<CODE>", "message_vi": "<msg>", "message_en": "<msg>", "details": {}}}`.

#### Scenario: Application error raised
- **WHEN** any endpoint raises an `AppError` with code `CAPTURE_LOW_CONFIDENCE`
- **THEN** the response SHALL have the appropriate HTTP status code and the error JSON body with `code`, `message_vi`, `message_en` fields

#### Scenario: Unhandled exception
- **WHEN** an unexpected exception occurs
- **THEN** the response SHALL return HTTP 500 with code `INTERNAL_ERROR` and message_vi `"Có lỗi rồi! Thử lại nhé!"`

### Requirement: Health check endpoint
The system SHALL expose `GET /health` that checks both database and Redis connectivity.

#### Scenario: All services healthy
- **WHEN** both Postgres and Redis are reachable
- **THEN** the endpoint SHALL return HTTP 200 with `{"status": "healthy", "db": "ok", "redis": "ok"}`

#### Scenario: Service unhealthy
- **WHEN** either Postgres or Redis is unreachable
- **THEN** the endpoint SHALL return HTTP 503 with `{"status": "unhealthy", "error": "<details>"}`

### Requirement: Structured logging
The system SHALL configure Python `logging` with `structlog` for structured JSON output to both stdout and a local log file at `{LOG_DIR}/snaplearn.log`.

#### Scenario: Log output format
- **WHEN** a log event is emitted
- **THEN** the output SHALL include structured fields (timestamp, level, event name, and any bound context)

### Requirement: Root router aggregation
The system SHALL define a root router in `app/api/router.py` that includes all sub-routers (auth, children, capture, speech, collection, missions, leaderboard, profile, parent_gate, parent) with appropriate path prefixes and tags.

#### Scenario: All routes registered
- **WHEN** the application starts
- **THEN** all API endpoints from all sub-routers SHALL be accessible under the `/api` prefix
