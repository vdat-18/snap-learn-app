-- SnapLearn Database Schema
-- For Docker Postgres init (mounted via docker-compose)
-- This file is kept in sync with the Alembic migration.

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Grant permissions on public schema (required for PostgreSQL 15+)
GRANT ALL ON SCHEMA public TO PUBLIC;

-- =========================================================
-- 1. parent_account
-- =========================================================
CREATE TABLE IF NOT EXISTS parent_account (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    settings        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_parent_email ON parent_account (email);

-- =========================================================
-- 2. child_profile
-- =========================================================
CREATE TABLE IF NOT EXISTS child_profile (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id               UUID NOT NULL REFERENCES parent_account(id) ON DELETE CASCADE,
    name                    VARCHAR(100) NOT NULL,
    avatar_id               VARCHAR(50) DEFAULT 'default',
    target_language          VARCHAR(5) DEFAULT 'en',
    secondary_language       VARCHAR(5),
    total_xp                INTEGER NOT NULL DEFAULT 0,
    level                   INTEGER NOT NULL DEFAULT 1,
    current_streak          INTEGER NOT NULL DEFAULT 0,
    longest_streak          INTEGER NOT NULL DEFAULT 0,
    streak_date             DATE,
    daily_time_limit_minutes INTEGER NOT NULL DEFAULT 30,
    photo_storage_enabled   BOOLEAN NOT NULL DEFAULT false,
    leaderboard_visibility  VARCHAR(20) DEFAULT 'global',
    settings                JSONB DEFAULT '{}',
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================================
-- 3. captured_vocab
-- =========================================================
CREATE TABLE IF NOT EXISTS captured_vocab (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id            UUID NOT NULL REFERENCES child_profile(id) ON DELETE CASCADE,
    word_en             VARCHAR(200) NOT NULL,
    word_vi             VARCHAR(200) NOT NULL,
    word_zh             VARCHAR(200) NOT NULL,
    pinyin              VARCHAR(200),
    phonetic_en         VARCHAR(200),
    category            VARCHAR(50) NOT NULL,
    rarity_tier         VARCHAR(20) DEFAULT 'common',
    confidence          FLOAT,
    fun_fact_vi         VARCHAR(500),
    example_sentence_en VARCHAR(500),
    example_sentence_vi VARCHAR(500),
    example_sentence_zh VARCHAR(500),
    points_earned       INTEGER,
    mastery_en          INTEGER NOT NULL DEFAULT 0,
    mastery_vi          INTEGER NOT NULL DEFAULT 0,
    mastery_zh          INTEGER NOT NULL DEFAULT 0,
    evolved             BOOLEAN NOT NULL DEFAULT false,
    photo_url           VARCHAR(500),
    photo_hash          VARCHAR(64),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_child_word UNIQUE (child_id, word_en, word_vi)
);

CREATE INDEX IF NOT EXISTS idx_captured_vocab_child_word ON captured_vocab (child_id, word_en, word_vi);
CREATE INDEX IF NOT EXISTS idx_captured_vocab_child_cat ON captured_vocab (child_id, category);

-- =========================================================
-- 4. mission
-- =========================================================
CREATE TABLE IF NOT EXISTS mission (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id        UUID NOT NULL REFERENCES child_profile(id) ON DELETE CASCADE,
    type            VARCHAR(20) NOT NULL,
    description_vi  VARCHAR(300) NOT NULL,
    target_count    INTEGER NOT NULL,
    current_count   INTEGER NOT NULL DEFAULT 0,
    reward_xp       INTEGER NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'active',
    match_criteria  JSONB,
    expires_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mission_child_status ON mission (child_id, status, expires_at);

-- =========================================================
-- 5. badge
-- =========================================================
CREATE TABLE IF NOT EXISTS badge (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id        UUID NOT NULL REFERENCES child_profile(id) ON DELETE CASCADE,
    badge_type      VARCHAR(50) NOT NULL,
    badge_name_vi   VARCHAR(100) NOT NULL,
    description_vi  VARCHAR(300),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_child_badge_type UNIQUE (child_id, badge_type)
);

-- =========================================================
-- 6. leaderboard_snapshot
-- =========================================================
CREATE TABLE IF NOT EXISTS leaderboard_snapshot (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id        UUID NOT NULL REFERENCES child_profile(id) ON DELETE CASCADE,
    scope           VARCHAR(20) NOT NULL,
    period          VARCHAR(10) NOT NULL,
    total_points    INTEGER,
    final_rank      INTEGER,
    category_points JSONB,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_scope ON leaderboard_snapshot (scope, period, total_points DESC);

-- =========================================================
-- 7. activity_log
-- =========================================================
CREATE TABLE IF NOT EXISTS activity_log (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id    UUID NOT NULL REFERENCES child_profile(id) ON DELETE CASCADE,
    event_type  VARCHAR(50) NOT NULL,
    event_data  JSONB,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_child_time ON activity_log (child_id, created_at DESC);
