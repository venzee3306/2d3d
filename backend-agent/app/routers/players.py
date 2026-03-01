"""Players under agents (from PlayerSnapshot synced from User Backend)."""
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import get_current_user
from app.database import get_db
from app.models import User, PlayerSnapshot
from app.models.user import UserRole

router = APIRouter(prefix="/players", tags=["players"])


class PlayerResponseSchema:
    def __init__(self, player_id: str, agent_id: str, name: str, phone_number: str | None,
                 current_balance: float, total_bets: int, total_amount: float, win_amount: float,
                 loss_amount: float, status: str, last_bet_at=None):
        self.player_id = player_id
        self.agent_id = agent_id
        self.name = name
        self.phone_number = phone_number
        self.current_balance = current_balance
        self.total_bets = total_bets
        self.total_amount = total_amount
        self.win_amount = win_amount
        self.loss_amount = loss_amount
        self.status = status
        self.last_bet_at = last_bet_at


@router.get("")
async def list_players(
    agent_id: str | None = None,
    db: Annotated[AsyncSession, Depends(get_db)] = None,
    current: Annotated[User, Depends(get_current_user)] = None,
):
    """List players (optionally for one agent). Non-admin see only their subtree."""
    q = select(PlayerSnapshot)
    if agent_id:
        q = q.where(PlayerSnapshot.agent_id == agent_id)
    if current.role == UserRole.agent:
        q = q.where(PlayerSnapshot.agent_id == current.id)
    elif current.role == UserRole.master:
        sub = select(User.id).where(User.parent_id == current.id)
        q = q.where(PlayerSnapshot.agent_id.in_(sub))
    result = await db.execute(q)
    rows = result.scalars().all()
    return [
        {
            "player_id": r.player_id,
            "agent_id": r.agent_id,
            "name": r.name,
            "phone_number": r.phone_number,
            "current_balance": float(r.current_balance),
            "total_bets": r.total_bets,
            "total_amount": float(r.total_amount),
            "win_amount": float(r.win_amount),
            "loss_amount": float(r.loss_amount),
            "status": r.status,
            "last_bet_at": r.last_bet_at.isoformat() if r.last_bet_at else None,
        }
        for r in rows
    ]
