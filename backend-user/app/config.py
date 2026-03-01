import os
from urllib.parse import parse_qs, urlencode, urlparse, urlunparse

from pydantic_settings import BaseSettings


def _sanitize_db_url(url: str) -> str:
    """Neon/asyncpg: remove channel_binding; use ssl not sslmode (asyncpg rejects sslmode)."""
    parsed = urlparse(url)
    if not parsed.query:
        return url
    q = parse_qs(parsed.query, keep_blank_values=True)
    q.pop("channel_binding", None)
    # asyncpg expects 'ssl', not 'sslmode' - remove sslmode and set ssl if missing
    sslmode_val = q.pop("sslmode", None)
    if sslmode_val is not None and "ssl" not in q:
        q["ssl"] = sslmode_val
    new_query = urlencode(q, doseq=True)
    return urlunparse((parsed.scheme, parsed.netloc, parsed.path, parsed.params, new_query, parsed.fragment))


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://user:password@localhost:5432/user_db"

    @property
    def database_url_safe(self) -> str:
        return _sanitize_db_url(self.database_url)

    secret_key: str = "change-me-in-production"
    agent_backend_url: str = "http://localhost:8000"
    internal_api_key: str = "shared-internal-api-key"
    port: int = 8001  # Override with PORT in production (Render, Railway, etc.)
    default_agent_id: str | None = None
    callback_retry_attempts: int = 3
    public_api_key: str | None = None  # Required for /public routes; set in .env
    access_token_expire_minutes: int = 60  # 1 hour
    refresh_token_expire_days: int = 7
    # Secure cookies (tokens in HttpOnly cookies instead of response body)
    cookie_access_token_name: str = "user_access_token"
    cookie_refresh_token_name: str = "user_refresh_token"
    cookie_secure: bool = False  # Set True in production (HTTPS only); False for localhost
    cookie_samesite: str = "lax"  # lax | strict | none
    cookie_path: str = "/"
    # Anti-copy: only accept token from cookie (reject Bearer); bind token to User-Agent
    auth_cookie_only: bool = True  # If True, Authorization: Bearer is ignored (copied token won't work)
    auth_bind_user_agent: bool = True  # Token only valid with same User-Agent (copy to other browser fails)
    cookie_bind_name: str = "user_access_token_bind"  # Cookie storing HMAC(token, secret+User-Agent)
    # Comma-separated origins for CORS (required when using cookies; * not allowed with credentials)
    cors_origins: str = ""  # e.g. "https://yourapp.vercel.app,https://www.yourapp.com"

    class Config:
        env_file = ".env"
        extra = "ignore"


def _get_port() -> int:
    return int(os.environ.get("PORT", "8001"))


settings = Settings()
# Use PORT from environment in production (Render, Railway, Fly.io set this)
if "PORT" in os.environ:
    settings.port = _get_port()
