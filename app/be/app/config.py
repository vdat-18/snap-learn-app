"""Application configuration loaded from environment variables."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """All configuration loaded via Pydantic BaseSettings.

    Required vars must be set in the environment or .env file.
    Optional vars have sensible defaults for local development.
    """

    # --- Required ---
    DATABASE_URL: str
    REDIS_URL: str
    JWT_SECRET_KEY: str
    OPENAI_API_KEY: str

    # --- Optional: general ---
    ENVIRONMENT: str = "development"
    DEBUG: bool = False
    LOG_LEVEL: str = "INFO"
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:8000"
    UPLOAD_DIR: str = "./uploads"
    TTS_CACHE_DIR: str = "./tts_cache"
    LOG_DIR: str = "./logs"
    CHROMADB_DIR: str = "./chromadb_data"

    # --- Optional: JWT ---
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # --- Optional: rate limits ---
    CAPTURES_PER_DAY_FREE: int = 5
    CAPTURES_PER_DAY_PREMIUM: int = 50
    PRONUNCIATIONS_PER_DAY_FREE: int = 15
    PRONUNCIATIONS_PER_DAY_PREMIUM: int = 100
    DAILY_TIME_LIMIT_MINUTES: int = 30

    # --- Optional: ElevenLabs TTS (primary provider) ---
    # If not set, the service will skip ElevenLabs and use OpenAI TTS as primary
    ELEVENLABS_API_KEY: str | None = None
    ELEVENLABS_VOICE_ID: str | None = None

    # --- Optional: OpenRouter (for BAML fallback) ---
    OPENROUTER_API_KEY: str | None = None

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}

    @property
    def ASYNC_DATABASE_URL(self) -> str:
        url = self.DATABASE_URL
        if url.startswith("postgresql://"):
            return url.replace("postgresql://", "postgresql+asyncpg://", 1)
        if url.startswith("postgresql+psycopg2://"):
            return url.replace("postgresql+psycopg2://", "postgresql+asyncpg://", 1)
        return url

    @property
    def allowed_origins_list(self) -> list[str]:
        """Parse comma-separated ALLOWED_ORIGINS into a list."""
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]


def get_settings() -> Settings:
    """Construct and return a cached Settings instance."""
    return Settings()  # type: ignore[call-arg]
