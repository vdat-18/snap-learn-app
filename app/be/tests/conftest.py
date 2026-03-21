"""Pytest fixtures for SnapLearn backend tests.

Provides:
- Async SQLite in-memory database session
- Mock Redis
- Mock AI services (BAML)
- httpx.AsyncClient test client
"""

from __future__ import annotations

import asyncio
from typing import AsyncIterator
from unittest.mock import AsyncMock, MagicMock

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.models.base import Base


# ---------------------------------------------------------------------------
# Event loop
# ---------------------------------------------------------------------------

@pytest.fixture(scope="session")
def event_loop():
    """Create a single event loop for all tests."""
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


# ---------------------------------------------------------------------------
# Async SQLite in-memory database
# ---------------------------------------------------------------------------

@pytest_asyncio.fixture
async def db_engine():
    """Create an async SQLite engine for testing."""
    engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:",
        echo=False,
    )
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield engine

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest_asyncio.fixture
async def db_session(db_engine) -> AsyncIterator[AsyncSession]:
    """Yield a test database session."""
    factory = async_sessionmaker(bind=db_engine, class_=AsyncSession, expire_on_commit=False)
    async with factory() as session:
        yield session


# ---------------------------------------------------------------------------
# Mock Redis
# ---------------------------------------------------------------------------

@pytest.fixture
def mock_redis() -> MagicMock:
    """Return a mock Redis client with common methods."""
    redis = AsyncMock()
    redis.get = AsyncMock(return_value=None)
    redis.set = AsyncMock()
    redis.incr = AsyncMock(return_value=1)
    redis.expire = AsyncMock()
    redis.ping = AsyncMock()
    redis.zincrby = AsyncMock()
    redis.zrevrange = AsyncMock(return_value=[])
    redis.zrevrank = AsyncMock(return_value=None)
    redis.zscore = AsyncMock(return_value=None)
    redis.ttl = AsyncMock(return_value=-1)
    redis.pipeline = MagicMock(return_value=AsyncMock())
    return redis


# ---------------------------------------------------------------------------
# Mock AI services
# ---------------------------------------------------------------------------

@pytest.fixture
def mock_vision_service(monkeypatch):
    """Mock the BAML vision service."""
    mock_result = MagicMock()
    mock_result.object_en = "cat"
    mock_result.object_vi = "con mèo"
    mock_result.object_zh = "猫"
    mock_result.pinyin = "māo"
    mock_result.phonetic_en = "/kæt/"
    mock_result.category = MagicMock(value="animals")
    mock_result.confidence = 0.95
    mock_result.fun_fact_vi = "Mèo có thể ngủ 16 giờ mỗi ngày!"
    mock_result.example_sentence_en = "The cat is sleeping."
    mock_result.example_sentence_vi = "Con mèo đang ngủ."
    mock_result.example_sentence_zh = "猫在睡觉。"
    mock_result.difficulty_en = 1
    mock_result.difficulty_vi = 1
    mock_result.difficulty_zh = 2

    mock_identify = AsyncMock(return_value=mock_result)
    monkeypatch.setattr("app.services.vision_service.identify_object", mock_identify)
    return mock_identify


# ---------------------------------------------------------------------------
# Test client
# ---------------------------------------------------------------------------

@pytest_asyncio.fixture
async def client(db_session, mock_redis, monkeypatch) -> AsyncIterator[AsyncClient]:
    """Create an httpx test client with mocked dependencies."""
    # Override dependencies
    from app.dependencies import get_db, get_redis

    async def _override_get_db():
        yield db_session

    async def _override_get_redis():
        return mock_redis

    from app.main import app

    app.dependency_overrides[get_db] = _override_get_db
    app.dependency_overrides[get_redis] = _override_get_redis

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()
