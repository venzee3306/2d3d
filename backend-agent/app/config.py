import os
import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://user:password@localhost:5432/agent_db"
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
