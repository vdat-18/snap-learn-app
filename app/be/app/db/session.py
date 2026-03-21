"""Async SQLAlchemy engine and session factory."""

from __future__ import annotations

from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

_engine: AsyncEngine | None = None
_session_factory: async_sessionmaker[AsyncSession] | None = None


async def init_engine(database_url: str) -> None:
    """Create the async engine and session factory.

    Called once at application startup.
    """
    global _engine, _session_factory
    _engine = create_async_engine(
        database_url,
        pool_size=5,
        max_overflow=10,
        echo=False,
    )
    _session_factory = async_sessionmaker(
        bind=_engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )


def get_engine() -> AsyncEngine:
    """Return the shared async engine (must be initialised first)."""
    assert _engine is not None, "Engine not initialised — call init_engine() first."
    return _engine


def async_session_factory() -> async_sessionmaker[AsyncSession]:
    """Return the session factory (must be initialised first)."""
    assert (
        _session_factory is not None
    ), "Session factory not initialised — call init_engine() first."
    return _session_factory


async def dispose_engine() -> None:
    """Dispose engine and release connection pool.

    Called at application shutdown.
    """
    global _engine, _session_factory
    if _engine is not None:
        await _engine.dispose()
        _engine = None
        _session_factory = None
