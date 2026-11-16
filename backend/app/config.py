import os
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "sqlite:///./gocrazy.db"
    site_url: str = "http://localhost:5173"
    frontend_origins: str = "*"

    # Razorpay. Leave empty to run in mock mode (local dev only).
    razorpay_key_id: str = ""
    razorpay_key_secret: str = ""
    razorpay_webhook_secret: str = ""

    # DataFast. Server-side only; never ship to the browser.
    datafast_api_key: str = ""
    datafast_website_id: str = ""
    datafast_domain: str = ""
    datafast_public_stats_url: str = ""
    stats_cache_seconds: int = 60

    seed_demo: bool = True

    @property
    def resolved_database_url(self) -> str:
        url = self.database_url
        # If deploying to Vercel/Serverless and using default SQLite, use writable /tmp
        if os.environ.get("VERCEL") and ("./gocrazy.db" in url or url == "sqlite:///./gocrazy.db"):
            return "sqlite:////tmp/gocrazy.db"
        # Fix legacy postgres:// dialect from Neon / Supabase / Heroku for SQLAlchemy
        if url.startswith("postgres://"):
            return url.replace("postgres://", "postgresql://", 1)
        return url

    @property
    def payments_mode(self) -> str:
        return "razorpay" if self.razorpay_key_id and self.razorpay_key_secret else "mock"

    @property
    def origins(self) -> list[str]:
        if not self.frontend_origins or self.frontend_origins.strip() == "*":
            return ["*"]
        return [o.strip() for o in self.frontend_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
