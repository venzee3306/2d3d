"""Internal API: called by Agent Backend (X-Internal-API-Key)."""
from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import require_internal_api_key
from app.database import get_db
from app.models import Player

router = APIRouter(prefix="/internal", tags=["internal"])


@router.get("/players")
async def list_players_by_agent(
    agent_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[None, Depends(require_internal_api_key)],
):
    """List players under an agent (for Agent Dashboard)."""
    result = await db.execute(select(Player).where(Player.agent_id == agent_id))
    rows = result.scalars().all()
    return [
        {
            "player_id": p.id,
            "agent_id": p.agent_id,
            "name": p.name,
            "phone_number": p.phone_number,
            "current_balance": float(p.balance),
            "total_bets": p.total_bets,
            "total_amount": float(p.total_amount),
            "win_amount": float(p.win_amount),
            "loss_amount": float(p.loss_amount),
            "status": p.status,
            "last_bet_at": p.last_bet_at.isoformat() if p.last_bet_at else None,
        }
        for p in rows
    ]


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
