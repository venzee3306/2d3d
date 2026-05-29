import os
from pathlib import Path
from urllib.parse import parse_qs, urlencode, urlparse, urlunparse

from pydantic_settings import BaseSettings

# App root (backend-agent) so upload paths are consistent regardless of cwd
_APP_ROOT = Path(__file__).resolve().parent.parent


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
    database_url: str = "postgresql+asyncpg://user:password@localhost:5432/agent_db"

    @property
    def database_url_safe(self) -> str:
        return _sanitize_db_url(self.database_url)

    secret_key: str = "change-me-in-production"
    user_backend_url: str = "http://localhost:8001"
    twod_upstream_url: str = "https://luke.2dboss.com/api/luke/twod-result-live"
    timezone: str = "Asia/Yangon"
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
    # Base URL for serving uploaded files (e.g. http://localhost:8000)
    base_url: str = "http://localhost:8000"
    # Directory for QR images (relative to backend-agent app root)
    upload_dir: str = "uploads/bank-qr"

    @property
    def upload_dir_resolved(self) -> Path:
        """Absolute path for uploads so static files are found regardless of cwd."""
        return (_APP_ROOT / self.upload_dir).resolve()

    @property
    def uploads_parent_resolved(self) -> Path:
        """Parent of upload_dir for StaticFiles mount (e.g. .../uploads)."""
        return self.upload_dir_resolved.parent

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
if "PORT" in os.environ:
    settings.port = int(os.environ["PORT"])
