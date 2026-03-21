## ADDED Requirements

### Requirement: Parent registration
The system SHALL allow new parent accounts to be created via `POST /api/auth/register` with email and password. No email verification is required. Passwords SHALL be hashed with bcrypt before storage.

#### Scenario: Successful registration
- **WHEN** a valid email and password (min 8 characters) are provided
- **THEN** the system SHALL create a `parent_account` record, return HTTP 200 with `parent_id`, `email`, `access_token`, `refresh_token`, and `token_type: "bearer"`

#### Scenario: Duplicate email
- **WHEN** the email is already registered (case-insensitive comparison)
- **THEN** the system SHALL return HTTP 409 with error code `AUTH_EMAIL_EXISTS`

### Requirement: Parent login
The system SHALL authenticate parents via `POST /api/auth/login` with email and password, returning JWT tokens and the parent's child profiles.

#### Scenario: Successful login
- **WHEN** valid email and password are provided
- **THEN** the system SHALL return `parent_id`, `email`, `access_token`, `refresh_token`, `token_type`, and `children` array

#### Scenario: Invalid credentials
- **WHEN** email does not exist or password does not match
- **THEN** the system SHALL return HTTP 401 with error code `AUTH_CREDENTIALS_INVALID`

### Requirement: Token refresh
The system SHALL allow refreshing access tokens via `POST /api/auth/refresh` using a valid refresh token.

#### Scenario: Valid refresh token
- **WHEN** a valid, non-expired refresh token is provided
- **THEN** the system SHALL return a new `access_token` and `refresh_token`, and invalidate the old refresh token in Redis

#### Scenario: Invalid or expired refresh token
- **WHEN** an invalid, expired, or already-used refresh token is provided
- **THEN** the system SHALL return HTTP 401 with error code `AUTH_INVALID`

### Requirement: JWT access tokens
Access tokens SHALL be JWTs with `sub` (parent_id), `type: "access"`, and `exp` (30 minutes). They SHALL be signed with HS256 using the `JWT_SECRET_KEY`.

#### Scenario: Access token structure
- **WHEN** an access token is generated
- **THEN** it SHALL contain `sub`, `type`, and `exp` claims, be signed with HS256, and expire in 30 minutes

### Requirement: Refresh tokens stored in Redis
Refresh tokens SHALL be JWTs with 7-day expiry. Their hashes SHALL be stored in Redis with key `refresh:{parent_id}` and TTL matching the token expiry.

#### Scenario: Refresh token storage
- **WHEN** a refresh token is created
- **THEN** its SHA256 hash SHALL be stored in Redis with a 7-day TTL

### Requirement: Auth dependency for protected routes
The system SHALL provide a FastAPI dependency (`get_current_parent`) that extracts and validates the JWT from the `Authorization: Bearer <token>` header, returning the `parent_id`.

#### Scenario: Valid token on protected route
- **WHEN** a request includes a valid Bearer token
- **THEN** the dependency SHALL resolve to the parent's UUID

#### Scenario: Missing or invalid token
- **WHEN** the Authorization header is missing or the token is invalid/expired
- **THEN** the dependency SHALL raise HTTP 401 with error code `AUTH_INVALID`

### Requirement: Child context dependency
The system SHALL provide a dependency (`get_current_child`) that reads the `X-Child-Id` header and validates that the child belongs to the authenticated parent.

#### Scenario: Valid child selection
- **WHEN** `X-Child-Id` header contains a UUID of a child belonging to the authenticated parent
- **THEN** the dependency SHALL resolve to the child's UUID

#### Scenario: Invalid child selection
- **WHEN** `X-Child-Id` references a child not belonging to the parent, or is missing
- **THEN** the dependency SHALL raise HTTP 403
