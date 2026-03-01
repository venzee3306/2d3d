import os
from urllib.parse import parse_qs, urlencode, urlparse, urlunparse

from pydantic_settings import BaseSettings


def _sanitize_db_url(url: str) -> str:
    """Remove channel_binding from URL; asyncpg does not accept it."""
    parsed = urlparse(url)
    if not parsed.query:
        return url
    q = parse_qs(parsed.query, keep_blank_values=True)
    q.pop("channel_binding", None)
    new_query = urlencode(q, doseq=True)
    return urlunparse((parsed.scheme, parsed.netloc, parsed.path, parsed.params, new_query, parsed.fragment))


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://user:password@localhost:5432/agent_db"

    @property
    def database_url_safe(self) -> str:
        return _sanitize_db_url(self.database_url)

    secret_key: str = "change-me-in-production"
    user_backend_url: str = "http://localhost:8001"
    internal_api_key: str = "shared-internal-api-key"
    port: int = 8000  # Override with PORT in production
    access_token_expire_minutes: int = 60
    refresh_token_expire_days: int = 7
    cookie_access_token_name: str = "agent_access_token"
    cookie_refresh_token_name: str = "agent_refresh_token"
    cookie_secure: bool = False
    cookie_samesite: str = "lax"
    cookie_path: str = "/"
    auth_cookie_only: bool = True
    auth_bind_user_agent: bool = True
    cookie_bind_name: str = "agent_access_token_bind"
    cors_origins: str = ""

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
if "PORT" in os.environ:
    settings.port = int(os.environ["PORT"])
