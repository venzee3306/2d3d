import hashlib
import hmac
import secrets
from datetime import datetime, timedelta
from typing import Annotated

from fastapi import Depends, HTTPException, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials, APIKeyHeader
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.models import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer(auto_error=False)
internal_api_key_header = APIKeyHeader(name="X-Internal-API-Key", auto_error=False)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(sub: str, role: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    to_encode = {"sub": sub, "role": role, "exp": expire}
    return jwt.encode(to_encode, settings.secret_key, algorithm="HS256")


def hash_refresh_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def create_refresh_token_plain() -> str:
    return secrets.token_urlsafe(32)


def decode_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, settings.secret_key, algorithms=["HS256"])
    except JWTError:
        return None


def _get_access_token(request: Request) -> str | None:
    """Cookie first; if auth_cookie_only=True, Bearer is ignored (copied token won't work)."""
    token = request.cookies.get(settings.cookie_access_token_name)
    if token:
        return token
    if getattr(settings, "auth_cookie_only", False):
        return None
    auth = request.headers.get("Authorization")
    if auth and auth.lower().startswith("bearer "):
        return auth[7:].strip()
    return None


def compute_token_bind(access_token: str, user_agent: str) -> str:
    key = (settings.secret_key + (user_agent or "")).encode()
    return hmac.new(key, access_token.encode(), hashlib.sha256).hexdigest()


def _verify_token_bind(request: Request, access_token: str) -> bool:
    if not getattr(settings, "auth_bind_user_agent", False):
        return True
    bind = request.cookies.get(settings.cookie_bind_name)
    if not bind:
        return False
    ua = request.headers.get("User-Agent") or ""
    expected = compute_token_bind(access_token, ua)
    return hmac.compare_digest(bind, expected)


async def get_current_user(
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> User:
    token = _get_access_token(request)
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    if not _verify_token_bind(request, token):
        raise HTTPException(status_code=401, detail="Invalid or copied token")
    payload = decode_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    result = await db.execute(select(User).where(User.id == payload["sub"]))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


def require_internal_api_key(
    api_key: Annotated[str | None, Depends(internal_api_key_header)],
) -> None:
    if api_key != settings.internal_api_key:
        raise HTTPException(status_code=403, detail="Invalid internal API key")
