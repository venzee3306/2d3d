"""Players under agents (from PlayerSnapshot synced from User Backend)."""
import re
import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import get_current_user
from app.database import get_db
from app.models import User, PlayerSnapshot
from app.models.user import UserRole
from app.services.user_backend_client import create_player_in_user_backend

router = APIRouter(prefix="/players", tags=["players"])


class PlayerCreateBody(BaseModel):
    name: str
    username: str | None = None  # optional; generated from name if not provided
    password: str
    phone_number: str | None = None
    agent_id: str | None = None  # required for master when creating under an agent


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


@router.post("")
async def create_player(
    data: PlayerCreateBody,
    current: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Create a player in User Backend (synced to Agent Backend). Agent: creates under self. Master: must pass agent_id of an agent under this master."""
    if current.role == UserRole.agent:
        agent_id = current.id
    elif current.role == UserRole.master:
        if not data.agent_id:
            raise HTTPException(status_code=400, detail="agent_id required when master creates a player")
        sub = await db.execute(select(User.id).where(User.parent_id == current.id))
        agent_ids = [r[0] for r in sub.all()]
        if data.agent_id not in agent_ids:
            raise HTTPException(status_code=403, detail="Can only create players under your agents")
        agent_id = data.agent_id
    else:
        raise HTTPException(status_code=403, detail="Only agent or master can create players")

    username = (data.username or "").strip()
    if not username:
        slug = re.sub(r"[^a-z0-9]+", "_", data.name.lower()).strip("_") or "player"
        username = f"{slug}_{uuid.uuid4().hex[:8]}"

    result, error_msg, status_code = await create_player_in_user_backend(
        agent_id=agent_id,
        name=data.name,
        username=username,
        password=data.password,
        phone_number=data.phone_number,
    )
    if result is None:
        # Propagate 400 (e.g. Username already exists) so client gets validation error, not 502
        raise HTTPException(
            status_code=status_code if 400 <= status_code < 500 else 502,
            detail=error_msg or "Failed to create player in user backend",
        )
    return result
