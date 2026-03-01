"""Public API for external platforms (API key auth). Create user, place bet, balance, history."""
from typing import Annotated
import uuid
import asyncio

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import APIKeyHeader
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.models import Player, Session, Bet, Transaction, CallbackConfig
from app.auth import hash_password
from app.schemas.player import PlayerCreate, PlayerResponse
from app.schemas.bet import PlaceBetsRequest, BetResponse
from app.services.sync_to_agent import sync_player_to_agent
from app.services.callbacks import send_callback_for_platform

router = APIRouter(prefix="/public", tags=["public"])
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)


def require_public_api_key(
    api_key: Annotated[str | None, Depends(api_key_header)],
) -> None:
    if not settings.public_api_key or api_key != settings.public_api_key:
        raise HTTPException(status_code=403, detail="Invalid or missing API key")


class PublicPlayerCreate(PlayerCreate):
    agent_id: str | None = None  # optional; use default_agent_id if not set
    callback_url: str | None = None  # optional; register webhook for this platform_id


@router.post("/players", response_model=PlayerResponse)
async def create_player_public(
      data: PublicPlayerCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[None, Depends(require_public_api_key)],
):
    agent_id = data.agent_id or settings.default_agent_id
    if not agent_id:
        raise HTTPException(status_code=400, detail="agent_id required or set DEFAULT_AGENT_ID")
    existing = await db.execute(select(Player).where(Player.username == data.username))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Username already exists")
    player_id = str(uuid.uuid4())
    platform_id = data.platform_id or player_id[:8]
    player = Player(
        id=player_id,
        name=data.name,
        username=data.username,
        password_hash=hash_password(data.password),
        phone_number=data.phone_number,
        balance=0,
        agent_id=agent_id,
        source="api",
        platform_id=platform_id,
        status="active",
    )
    db.add(player)
    await db.flush()
    if data.callback_url:
        db.add(CallbackConfig(platform_id=platform_id, callback_url=data.callback_url, api_key=None))
        await db.flush()
    await sync_player_to_agent(player)
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


@router.get("/players/{player_id}/balance")
async def get_balance_public(
    player_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[None, Depends(require_public_api_key)],
):
    result = await db.execute(select(Player).where(Player.id == player_id))
    p = result.scalar_one_or_none()
    if not p:
        raise HTTPException(status_code=404, detail="Player not found")
    return {"player_id": p.id, "balance": float(p.balance)}


@router.get("/players/{player_id}/history")
async def get_history_public(
    player_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[None, Depends(require_public_api_key)],
):
    result = await db.execute(select(Player).where(Player.id == player_id))
    p = result.scalar_one_or_none()
    if not p:
        raise HTTPException(status_code=404, detail="Player not found")
    tx_result = await db.execute(
        select(Transaction).where(Transaction.player_id == player_id).order_by(Transaction.timestamp.desc()).limit(100)
    )
    rows = tx_result.scalars().all()
    return {
        "player_id": player_id,
        "transactions": [
            {"id": r.id, "type": r.type, "amount": float(r.amount), "balance_after": float(r.balance_after), "timestamp": r.timestamp.isoformat()}
            for r in rows
        ],
    }


@router.post("/players/{player_id}/bets", response_model=list[BetResponse])
async def place_bets_public(
    player_id: str,
    data: PlaceBetsRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[None, Depends(require_public_api_key)],
):
    from app.services.agent_client import get_agent_limits, is_number_blocked
    from datetime import datetime
    # Lock player row so concurrent place_bets / settle for same player serialize
    result = await db.execute(select(Player).where(Player.id == player_id).with_for_update())
    current = result.scalar_one_or_none()
    if not current:
        raise HTTPException(status_code=404, detail="Player not found")
    limits = await get_agent_limits(current.agent_id)
    blocked_2d = limits.get("blocked_numbers_2d", []) if limits else []
    blocked_3d = limits.get("blocked_numbers_3d", []) if limits else []
    total = sum(b.amount for b in data.bets)
    if total <= 0:
        raise HTTPException(status_code=400, detail="Total bet amount must be positive")
    if float(current.balance) < total:
        raise HTTPException(status_code=400, detail="Insufficient balance")
    for b in data.bets:
        if is_number_blocked(b.number, data.game_type, blocked_2d, blocked_3d):
            raise HTTPException(status_code=400, detail=f"Number {b.number} is blocked")
    sess = await db.execute(select(Session).where(Session.id == data.session_id, Session.player_id == current.id))
    if not sess.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Session not found")
    now = datetime.utcnow()
    created = []
    for b in data.bets:
        bet = Bet(
            id=str(uuid.uuid4()),
            player_id=current.id,
            session_id=data.session_id,
            game_type=data.game_type,
            bet_number=b.number,
            amount=b.amount,
            round_name=data.round_name,
            status="Pending",
            placed_at=now,
            pattern_type=b.pattern_type,
            pattern_input=b.pattern_input,
            pattern_label=b.pattern_label,
        )
        db.add(bet)
        await db.flush()
        created.append(
            BetResponse(
                id=bet.id,
                player_id=bet.player_id,
                session_id=bet.session_id,
                game_type=bet.game_type,
                bet_number=bet.bet_number,
                amount=float(bet.amount),
                round_name=bet.round_name,
                status=bet.status,
                win_amount=None,
                placed_at=bet.placed_at,
            )
        )
    current.balance = float(current.balance) - total
    current.total_bets += len(data.bets)
    current.total_amount += total
    current.last_bet_at = now
    tx = Transaction(
        id=str(uuid.uuid4()),
        player_id=current.id,
        type="bet",
        amount=-total,
        balance_after=float(current.balance),
        description=f"Placed {len(data.bets)} bet(s)",
        timestamp=now,
    )
    db.add(tx)
    await db.flush()
    await sync_player_to_agent(current)
    if current.platform_id:
        payload = {"player_id": current.id, "bets": [{"number": b.number, "amount": b.amount} for b in data.bets], "total": total, "balance_after": float(current.balance)}
        cfg = await db.execute(select(CallbackConfig).where(CallbackConfig.platform_id == current.platform_id))
        c = cfg.scalar_one_or_none()
        if c:
            asyncio.create_task(send_callback_for_platform(current.platform_id, "bet.placed", payload, c.callback_url, c.api_key))
    return created
