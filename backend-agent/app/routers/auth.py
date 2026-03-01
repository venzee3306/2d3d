from datetime import datetime, timedelta
from typing import Annotated
import uuid

from fastapi import APIRouter, Body, Depends, HTTPException, Request, Response
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import (
    verify_password,
    create_access_token,
    hash_password,
    hash_refresh_token,
    create_refresh_token_plain,
    compute_token_bind,
)
from app.config import settings
from app.database import get_db
from app.models import User, RefreshToken
from app.schemas.user import (
    LoginRequest,
    LoginResponse,
    UserResponse,
    RefreshRequest,
    RefreshResponse,
)

router = APIRouter(prefix="/auth", tags=["auth"])

ACCESS_TOKEN_MAX_AGE = settings.access_token_expire_minutes * 60
REFRESH_TOKEN_MAX_AGE = settings.refresh_token_expire_days * 24 * 3600


def _set_auth_cookies(response: Response, access_token: str, refresh_token: str) -> None:
    kwargs = {
        "path": settings.cookie_path,
        "httponly": True,
        "secure": settings.cookie_secure,
        "samesite": settings.cookie_samesite,
    }
    response.set_cookie(
        settings.cookie_access_token_name,
        access_token,
        max_age=ACCESS_TOKEN_MAX_AGE,
        **kwargs,
    )
    response.set_cookie(
        settings.cookie_refresh_token_name,
        refresh_token,
        max_age=REFRESH_TOKEN_MAX_AGE,
        **kwargs,
    )


def _set_access_cookie(
    response: Response,
    access_token: str,
    user_agent: str | None = None,
) -> None:
    kwargs = {
        "path": settings.cookie_path,
        "httponly": True,
        "secure": settings.cookie_secure,
        "samesite": settings.cookie_samesite,
    }
    response.set_cookie(
        settings.cookie_access_token_name,
        access_token,
        max_age=ACCESS_TOKEN_MAX_AGE,
        **kwargs,
    )
    if getattr(settings, "auth_bind_user_agent", False) and user_agent:
        bind = compute_token_bind(access_token, user_agent)
        response.set_cookie(settings.cookie_bind_name, bind, max_age=ACCESS_TOKEN_MAX_AGE, **kwargs)


def _clear_auth_cookies(response: Response) -> None:
    response.delete_cookie(settings.cookie_access_token_name, path=settings.cookie_path)
    response.delete_cookie(settings.cookie_refresh_token_name, path=settings.cookie_path)
    if getattr(settings, "cookie_bind_name", None):
        response.delete_cookie(settings.cookie_bind_name, path=settings.cookie_path)


def _user_to_response(user: User) -> UserResponse:
    return UserResponse(
        id=user.id,
        name=user.name,
        username=user.username,
        role=user.role,
        parent_id=user.parent_id,
    )


async def _issue_tokens(db: AsyncSession, user: User):
    """Create access token and refresh token. Returns (access_token, refresh_token, refresh_expires_at)."""
    access_token = create_access_token(str(user.id), user.role.value)
    refresh_plain = create_refresh_token_plain()
    refresh_hash = hash_refresh_token(refresh_plain)
    expires_at = datetime.utcnow() + timedelta(days=settings.refresh_token_expire_days)
    rt = RefreshToken(
        id=str(uuid.uuid4()),
        user_id=user.id,
        token_hash=refresh_hash,
        expires_at=expires_at,
    )
    db.add(rt)
    await db.flush()
    return access_token, refresh_plain, expires_at


@router.post("/login", response_model=LoginResponse)
async def login(
    request: Request,
    data: LoginRequest,
    response: Response,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    result = await db.execute(select(User).where(User.username == data.username))
    user = result.scalar_one_or_none()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    access_token, refresh_token, _ = await _issue_tokens(db, user)
    _set_auth_cookies(response, access_token, refresh_token, request.headers.get("User-Agent"))
    return LoginResponse(user=_user_to_response(user))


@router.post("/refresh", response_model=RefreshResponse)
async def refresh(
    request: Request,
    response: Response,
    db: Annotated[AsyncSession, Depends(get_db)],
    data: RefreshRequest | None = Body(None),
):
    """Exchange refresh token for new access token. Reads from cookie or body."""
    refresh_plain = request.cookies.get(settings.cookie_refresh_token_name)
    if not refresh_plain and data:
        refresh_plain = data.refresh_token
    if not refresh_plain:
        raise HTTPException(status_code=401, detail="Refresh token required (cookie or body)")
    token_hash = hash_refresh_token(refresh_plain)
    result = await db.execute(
        select(RefreshToken).where(
            RefreshToken.token_hash == token_hash,
            RefreshToken.expires_at > datetime.utcnow(),
        )
    )
    rt = result.scalar_one_or_none()
    if not rt:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")
    user_result = await db.execute(select(User).where(User.id == rt.user_id))
    user = user_result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    access_token = create_access_token(str(user.id), user.role.value)
    _set_access_cookie(response, access_token, request.headers.get("User-Agent"))
    return RefreshResponse(access_token=None, token_type="bearer")


@router.post("/logout")
async def logout(response: Response):
    _clear_auth_cookies(response)
    return {"ok": True}
