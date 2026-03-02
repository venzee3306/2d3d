"""Internal API: called by Agent Backend (X-Internal-API-Key)."""
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import require_internal_api_key
from app.database import get_db
from app.models import Player

router = APIRouter(prefix="/internal", tags=["internal"])


def _player_payload(p: Player) -> dict:
    return {
        "player_id": p.id,
        "agent_id": p.agent_id,
        "name": p.name,
        "username": p.username,
        "phone_number": p.phone_number,
        "current_balance": float(p.balance),
        "total_bets": p.total_bets,
        "total_amount": float(p.total_amount),
        "win_amount": float(p.win_amount),
        "loss_amount": float(p.loss_amount),
        "status": p.status,
        "last_bet_at": p.last_bet_at.isoformat() if p.last_bet_at else None,
        "created_at": p.created_at.isoformat() if p.created_at else None,
    }


@router.get("/players")
async def list_players_by_agent(
    agent_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[None, Depends(require_internal_api_key)],
    status: str | None = Query(None, description="Filter by status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
):
    """List players under an agent (for Agent Dashboard). Optional status filter and pagination."""
    q = select(Player).where(Player.agent_id == agent_id)
    if status is not None:
        q = q.where(Player.status == status)
    q = q.offset(skip).limit(limit)
    result = await db.execute(q)
    rows = result.scalars().all()
    return [_player_payload(p) for p in rows]


@router.get("/players/{player_id}")
async def get_player_internal(
    player_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[None, Depends(require_internal_api_key)],
):
    """Get one player by id (for Agent Dashboard)."""
    result = await db.execute(select(Player).where(Player.id == player_id))
    p = result.scalar_one_or_none()
    if not p:
        raise HTTPException(status_code=404, detail="Player not found")
    return _player_payload(p)


class InternalPlayerUpdate(BaseModel):
    name: str | None = None
    phone_number: str | None = None
    status: str | None = None


@router.patch("/players/{player_id}")
async def update_player_internal(
    player_id: str,
    data: InternalPlayerUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[None, Depends(require_internal_api_key)],
):
    """Update player (name, phone_number, status). Called by Agent Backend."""
    result = await db.execute(select(Player).where(Player.id == player_id))
    p = result.scalar_one_or_none()
    if not p:
        raise HTTPException(status_code=404, detail="Player not found")
    if data.name is not None:
        p.name = data.name
    if data.phone_number is not None:
        p.phone_number = data.phone_number
    if data.status is not None:
        p.status = data.status
    await db.flush()
    return _player_payload(p)


@router.get("/players/{player_id}/balance")
async def get_player_balance(
    player_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[None, Depends(require_internal_api_key)],
):
    """Get a player's balance (for Agent Backend reconciliation)."""
    result = await db.execute(select(Player).where(Player.id == player_id))
    p = result.scalar_one_or_none()
    if not p:
        return {"player_id": player_id, "balance": None}
    return {"player_id": p.id, "balance": float(p.balance)}
