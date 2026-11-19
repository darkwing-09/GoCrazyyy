import os
from functools import lru_cache
from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # development | production. Vercel production and preview deployments always count as production.
    app_env: str = "development"

    # Neon / Vercel Postgres expose DATABASE_URL or POSTGRES_URL.
    database_url: str = Field("sqlite:///./gocrazy.db", validation_alias=AliasChoices("DATABASE_URL", "POSTGRES_URL"))
    # Turso libSQL remote database credentials
    turso_database_url: str = Field("", validation_alias=AliasChoices("TURSO_DATABASE_URL", "LIBSQL_URL"))
    turso_auth_token: str = Field("", validation_alias=AliasChoices("TURSO_AUTH_TOKEN", "LIBSQL_AUTH_TOKEN"))
    site_url: str = "http://localhost:5173"
    frontend_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    # Business details shown on Contact, Terms and in the footer (required for Razorpay activation).
    business_name: str = "GoCrazy"
    contact_email: str = ""
    business_address: str = ""
    jurisdiction: str = ""
    launched_at: str = ""            # YYYY-MM-DD, shown as "since launch"
    deals_closes_at: str = ""        # ISO timestamp; Deals board countdown is hidden when empty

    razorpay_key_id: str = ""
    razorpay_key_secret: str = ""
    razorpay_webhook_secret: str = ""

    # Self-hosted UPI Gateway (https://github.com/mynkdev-21/upi-gateway)
    upi_gateway_url: str = ""
    upi_gateway_key: str = ""
    upi_gateway_secret: str = ""
    upi_gateway_webhook_secret: str = ""
    payment_provider: str = ""  # "upi" | "razorpay" | "mock"

    # Server-side only; never shipped to the browser.
    datafast_api_key: str = ""
    datafast_website_id: str = ""
    datafast_domain: str = ""
    datafast_public_stats_url: str = ""
    stats_cache_seconds: int = 60

    @property
    def is_production(self) -> bool:
        return self.app_env == "production" or os.getenv("VERCEL_ENV") in ("production", "preview")

    @property
    def is_serverless(self) -> bool:
        return bool(os.getenv("VERCEL"))

    @property
    def payments_mode(self) -> str:
        if self.payment_provider == "upi" and self.upi_gateway_url and self.upi_gateway_key:
            return "upi_gateway"
        if self.payment_provider == "razorpay" and self.razorpay_key_id and self.razorpay_key_secret:
            return "razorpay"
        if self.upi_gateway_url and self.upi_gateway_key and self.upi_gateway_secret:
            return "upi_gateway"
        if self.razorpay_key_id and self.razorpay_key_secret:
            return "razorpay"
        return "mock"

    @property
    def mock_payments_allowed(self) -> bool:
        return self.payments_mode == "mock" and not self.is_production

    @property
    def is_turso(self) -> bool:
        return bool(self.turso_database_url) or "libsql" in self.database_url or "turso.io" in self.database_url

    @property
    def sqlalchemy_url(self) -> str:
        if self.turso_database_url:
            raw = self.turso_database_url.strip()
            if raw.startswith("libsql://"):
                base = "sqlite+" + raw
            elif raw.startswith("sqlite+libsql://"):
                base = raw
            elif raw.startswith("https://"):
                base = "sqlite+https://" + raw[8:]
            else:
                base = f"sqlite+libsql://{raw}"
            if "?" not in base:
                base = f"{base}?secure=true"
            elif "secure=" not in base:
                base = f"{base}&secure=true"
            return base

        url = self.database_url.strip()
        if "libsql://" in url or "turso.io" in url:
            if url.startswith("libsql://"):
                url = "sqlite+" + url
            if "?" not in url:
                url = f"{url}?secure=true"
            return url

        for prefix in ("postgres://", "postgresql://"):
            if url.startswith(prefix):
                return "postgresql+psycopg://" + url[len(prefix):]
        return url

    @property
    def origins(self) -> list[str]:
        out = [o.strip() for o in self.frontend_origins.split(",") if o.strip()]
        if self.site_url and self.site_url not in out:
            out.append(self.site_url)
        return out


@lru_cache
def get_settings() -> Settings:
    return Settings()
