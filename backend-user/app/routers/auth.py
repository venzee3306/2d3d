"""Auth routes for User Onboarding: login and register (player). Tokens in secure HttpOnly cookies."""
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
    get_current_player,
)
from app.config import settings
from app.database import get_db
from app.models import Player, RefreshToken
from app.schemas.player import (
    PlayerLogin,
    PlayerCreate,
    PlayerResponse,
    LoginResponse,
    RefreshRequest,
    RefreshResponse,
    ChangePasswordRequest,
)
from app.services.sync_to_agent import sync_player_to_agent

router = APIRouter(prefix="/auth", tags=["auth"])

# Cookie max_age: access in seconds, refresh in seconds
ACCESS_TOKEN_MAX_AGE = settings.access_token_expire_minutes * 60
REFRESH_TOKEN_MAX_AGE = settings.refresh_token_expire_days * 24 * 3600


def _set_auth_cookies(
    response: Response,
    access_token: str,
    refresh_token: str,
    user_agent: str | None = None,
) -> None:
    """Set HttpOnly cookies for access and refresh tokens; optional User-Agent binding."""
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
    if getattr(settings, "auth_bind_user_agent", False) and user_agent:
        bind = compute_token_bind(access_token, user_agent)
        response.set_cookie(
            settings.cookie_bind_name,
            bind,
            max_age=ACCESS_TOKEN_MAX_AGE,
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
    """Clear auth cookies (logout)."""
    response.delete_cookie(settings.cookie_access_token_name, path=settings.cookie_path)
    response.delete_cookie(settings.cookie_refresh_token_name, path=settings.cookie_path)
    if getattr(settings, "cookie_bind_name", None):
        response.delete_cookie(settings.cookie_bind_name, path=settings.cookie_path)


def _player_to_response(player: Player) -> PlayerResponse:
    return PlayerResponse(
        id=player.id,
        name=player.name,
        username=player.username,
        phone_number=player.phone_number,
        balance=float(player.balance),
        agent_id=player.agent_id,
        source=player.source,
        platform_id=player.platform_id,
        status=player.status,
        created_at=player.created_at,
        total_bets=player.total_bets,
        total_amount=float(player.total_amount),
        win_amount=float(player.win_amount),
        loss_amount=float(player.loss_amount),
        last_bet_at=player.last_bet_at,
    )


async def _issue_tokens(db: AsyncSession, player: Player):
    """Create access token and refresh token for player. Returns (access_token, refresh_token, refresh_expires_at)."""
    access_token = create_access_token(player.id)
    refresh_plain = create_refresh_token_plain()
    refresh_hash = hash_refresh_token(refresh_plain)
    expires_at = datetime.utcnow() + timedelta(days=settings.refresh_token_expire_days)
    rt = RefreshToken(
        id=str(uuid.uuid4()),
        player_id=player.id,
        token_hash=refresh_hash,
        expires_at=expires_at,
    )
    db.add(rt)
    await db.flush()
    return access_token, refresh_plain, expires_at


@router.post("/login", response_model=LoginResponse)
async def login(
    request: Request,
    data: PlayerLogin,
    response: Response,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    result = await db.execute(select(Player).where(Player.username == data.username))
    player = result.scalar_one_or_none()
    if not player or not verify_password(data.password, player.password_hash):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    access_token, refresh_token, _ = await _issue_tokens(db, player)
    _set_auth_cookies(response, access_token, refresh_token, request.headers.get("User-Agent"))
    return LoginResponse(player=_player_to_response(player))


@router.post("/register", response_model=LoginResponse)
async def register(
    request: Request,
    data: PlayerCreate,
    response: Response,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    existing = await db.execute(select(Player).where(Player.username == data.username))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Username already exists")
    agent_id = data.agent_id or settings.default_agent_id
    if not agent_id:
        raise HTTPException(status_code=400, detail="agent_id required or set DEFAULT_AGENT_ID")
    player_id = str(uuid.uuid4())
    player = Player(
        id=player_id,
        name=data.name,
        username=data.username,
        password_hash=hash_password(data.password),
        phone_number=data.phone_number,
        balance=0,
        agent_id=agent_id,
        source=data.source or "portal",
        platform_id=data.platform_id,
        status="active",
    )
    db.add(player)
    await db.flush()
    await sync_player_to_agent(player)
    access_token, refresh_token, _ = await _issue_tokens(db, player)
    _set_auth_cookies(response, access_token, refresh_token, request.headers.get("User-Agent"))
    return LoginResponse(player=_player_to_response(player))


@router.post("/refresh", response_model=RefreshResponse)
async def refresh(
    request: Request,
    response: Response,
    db: Annotated[AsyncSession, Depends(get_db)],
    data: RefreshRequest | None = Body(None),
):
    """Exchange refresh token for new access token. Reads refresh_token from cookie (or body for API clients)."""
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
    player_result = await db.execute(select(Player).where(Player.id == rt.player_id))
    player = player_result.scalar_one_or_none()
    if not player:
        raise HTTPException(status_code=401, detail="Player not found")
    access_token = create_access_token(player.id)
    _set_access_cookie(response, access_token, request.headers.get("User-Agent"))
    return RefreshResponse(access_token=None, token_type="bearer")


@router.post("/logout")
async def logout(response: Response):
    """Clear auth cookies. No body; call with credentials (cookie) to clear."""
    _clear_auth_cookies(response)
    return {"ok": True}


@router.post("/change-password")
async def change_password(
    data: ChangePasswordRequest,
    response: Response,
    db: Annotated[AsyncSession, Depends(get_db)],
    current: Annotated[Player, Depends(get_current_player)],
):
    """Change own password. Requires current password. Uses get_current_player (cookie)."""
    if not verify_password(data.current_password, current.password_hash):
        raise HTTPException(status_code=400, detail="current_password is incorrect")
    current.password_hash = hash_password(data.new_password)
    await db.flush()
    return {"ok": True}
