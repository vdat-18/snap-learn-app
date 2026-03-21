"""SnapLearn FastAPI application entry-point."""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from typing import AsyncIterator

import structlog
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import get_settings
from app.db.redis import close_redis_pool, init_redis_pool
from app.db.session import dispose_engine, init_engine
from app.utils.errors import AppError

logger = structlog.get_logger(__name__)


# ---------------------------------------------------------------------------
# Lifespan – initialise & tear down shared resources
# ---------------------------------------------------------------------------


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
    settings = get_settings()

    # --- Startup ---
    await init_engine(settings.ASYNC_DATABASE_URL)
    await init_redis_pool(settings.REDIS_URL)
    logger.info("startup_complete", environment=settings.ENVIRONMENT)

    yield

    # --- Shutdown ---
    await close_redis_pool()
    await dispose_engine()
    logger.info("shutdown_complete")


# ---------------------------------------------------------------------------
# Application factory
# ---------------------------------------------------------------------------


def create_app() -> FastAPI:
    settings = get_settings()

    _configure_logging(settings.LOG_LEVEL)

    application = FastAPI(
        title="SnapLearn API",
        version="0.1.0",
        lifespan=lifespan,
    )

    # -- CORS --
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # -- Global error handler --
    @application.exception_handler(AppError)
    async def app_error_handler(_request: Request, exc: AppError) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": {
                    "code": exc.code,
                    "message_vi": exc.message_vi,
                    "message_en": exc.message_en,
                    "details": exc.details,
                }
            },
        )

    @application.exception_handler(Exception)
    async def unhandled_error_handler(
        _request: Request, exc: Exception
    ) -> JSONResponse:
        logger.exception("unhandled_exception", error=str(exc))
        return JSONResponse(
            status_code=500,
            content={
                "error": {
                    "code": "INTERNAL_ERROR",
                    "message_vi": "Có lỗi rồi! Thử lại nhé!",
                    "message_en": "Something went wrong. Please try again.",
                    "details": None,
                }
            },
        )

    # -- Health check --
    @application.get("/health", tags=["health"])
    async def health_check() -> dict:
        from app.db.redis import get_redis_pool
        from app.db.session import get_engine

        status = "healthy"
        http_status = 200

        try:
            # Check Postgres
            engine = get_engine()
            async with engine.connect() as conn:
                await conn.execute(__import__("sqlalchemy").text("SELECT 1"))
        except Exception:
            status = "unhealthy"
            http_status = 503

        try:
            # Check Redis
            redis = get_redis_pool()
            await redis.ping()
        except Exception:
            status = "unhealthy"
            http_status = 503

        return JSONResponse(  # type: ignore[return-value]
            status_code=http_status,
            content={"status": status},
        )

    # -- Include routers --
    from app.api.router import api_router

    application.include_router(api_router, prefix="/api")

    return application


# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------


def _configure_logging(level: str) -> None:
    """Set up structlog + stdlib logging."""
    numeric_level = getattr(logging, level.upper(), logging.INFO)
    logging.basicConfig(format="%(message)s", level=numeric_level)
    structlog.configure(
        processors=[
            structlog.contextvars.merge_contextvars,
            structlog.stdlib.add_log_level,
            structlog.stdlib.add_logger_name,
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.dev.ConsoleRenderer(),
        ],
        wrapper_class=structlog.stdlib.BoundLogger,
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
    )


app = create_app()
