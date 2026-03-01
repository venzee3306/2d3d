"""Internal sync API: called by User Onboarding Backend (X-Internal-API-Key)."""
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import require_internal_api_key
from app.database import get_db
from app.models import User, UserBalance, PlayerSnapshot, BlockedNumber
from app.models.user import UserRole
from app.schemas.sync import PlayerSyncPayload, AgentLimitResponse

router = APIRouter(prefix="/internal", tags=["internal"])


@router.post("/players")
async def register_player(
    data: PlayerSyncPayload,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[None, Depends(require_internal_api_key)],
):
    """Upsert player snapshot (idempotent). Called by User Backend when player is created/updated."""
    from datetime import datetime
    result = await db.execute(
        select(PlayerSnapshot).where(
            PlayerSnapshot.player_id == data.player_id,
            PlayerSnapshot.agent_id == data.agent_id,
        )
    )
    existing = result.scalar_one_or_none()
    if existing:
        existing.name = data.name
        existing.phone_number = data.phone_number
        existing.current_balance = data.current_balance
        existing.total_bets = data.total_bets
        existing.total_amount = data.total_amount
        existing.win_amount = data.win_amount
        existing.loss_amount = data.loss_amount
        existing.status = data.status
        existing.last_bet_at = data.last_bet_at
        existing.updated_at = datetime.utcnow()
    else:
        db.add(
            PlayerSnapshot(
                player_id=data.player_id,
                agent_id=data.agent_id,
                name=data.name,
                phone_number=data.phone_number,
                current_balance=data.current_balance,
                total_bets=data.total_bets,
                total_amount=data.total_amount,
                win_amount=data.win_amount,
                loss_amount=data.loss_amount,
                status=data.status,
                last_bet_at=data.last_bet_at,
            )
        )
    return {"ok": True}


@router.get("/agents", response_model=list[AgentLimitResponse])
async def list_agents_for_sync(
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[None, Depends(require_internal_api_key)],
):
    """List all agents with credit limit and blocked numbers (for User Backend)."""
    result = await db.execute(select(User).where(User.role == UserRole.agent))
    agents = list(result.scalars().all())
    out = []
    for a in agents:
        bal = await db.execute(select(UserBalance).where(UserBalance.user_id == a.id))
        b = bal.scalar_one_or_none()
        credit = float(b.balance) if b else 0
        blocked = await db.execute(select(BlockedNumber).where(BlockedNumber.agent_id == a.id))
        blocks = blocked.scalars().all()
        bn_2d = [x.number for x in blocks if x.game_type == "2D"]
        bn_3d = [x.number for x in blocks if x.game_type == "3D"]
        out.append(
            AgentLimitResponse(
                agent_id=a.id,
                credit_limit=credit,
                blocked_numbers_2d=bn_2d,
                blocked_numbers_3d=bn_3d,
            )
        )
    return out


@router.get("/agents/{agent_id}/limits", response_model=AgentLimitResponse)
async def get_agent_limits(
    agent_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[None, Depends(require_internal_api_key)],
):
    """Get one agent's limits and blocked numbers."""
    result = await db.execute(
        select(User).where(User.id == agent_id, User.role == UserRole.agent)
    )
    agent = result.scalar_one_or_none()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    bal = await db.execute(select(UserBalance).where(UserBalance.user_id == agent_id))
    b = bal.scalar_one_or_none()
    credit = float(b.balance) if b else 0
    blocked = await db.execute(select(BlockedNumber).where(BlockedNumber.agent_id == agent_id))
    blocks = blocked.scalars().all()
    bn_2d = [x.number for x in blocks if x.game_type == "2D"]
    bn_3d = [x.number for x in blocks if x.game_type == "3D"]
    return AgentLimitResponse(
        agent_id=agent_id,
        credit_limit=credit,
        blocked_numbers_2d=bn_2d,
        blocked_numbers_3d=bn_3d,
    )
