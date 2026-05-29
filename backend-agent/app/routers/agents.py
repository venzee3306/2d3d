import logging
from typing import Annotated
import uuid

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import get_current_user
from app.config import settings
from app.database import get_db
from app.models import User, BlockedNumber
from app.models.user import UserRole
from app.schemas.user import UserResponse

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/agents", tags=["agents"])
USER_BASE = settings.user_backend_url.rstrip("/")


class BlockedNumbersUpdate(BaseModel):
    """Body for PUT /agents/:id/blocked-numbers. Keys: "2D" and "3D"."""
    model_config = {"extra": "forbid", "populate_by_name": True}

    two_d: list[str] | None = Field(default=None, alias="2D")
    three_d: list[str] | None = Field(default=None, alias="3D")


@router.get("", response_model=list[UserResponse])
async def list_agents(
    parent_id: str | None = None,
    db: Annotated[AsyncSession, Depends(get_db)] = None,
    current: Annotated[User, Depends(get_current_user)] = None,
):
    """List agents (optionally under a parent master/admin)."""
    q = select(User).where(User.role == UserRole.agent)
    if parent_id is not None:
        q = q.where(User.parent_id == parent_id)
    result = await db.execute(q)
    users = list(result.scalars().all())
    return [UserResponse.model_validate(u) for u in users]


@router.get("/masters", response_model=list[UserResponse])
async def list_masters(
    db: Annotated[AsyncSession, Depends(get_db)],
    current: Annotated[User, Depends(get_current_user)],
):
    """List masters (for admin)."""
    if current.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Admin only")
    result = await db.execute(select(User).where(User.role == UserRole.master))
    users = list(result.scalars().all())
    return [UserResponse.model_validate(u) for u in users]


@router.put("/{agent_id}/blocked-numbers")
async def update_agent_blocked_numbers(
    agent_id: str,
    data: BlockedNumbersUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current: Annotated[User, Depends(get_current_user)],
):
    """Set blocked numbers for an agent. Requires admin or master (own agent)."""
    result = await db.execute(select(User).where(User.id == agent_id, User.role == UserRole.agent))
    agent = result.scalar_one_or_none()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    if current.role == UserRole.admin:
        pass
    elif current.role == UserRole.master and agent.parent_id == current.id:
        pass
    else:
        raise HTTPException(status_code=403, detail="Only admin or the agent's master can update blocked numbers")
    # Replace existing blocked numbers
    await db.execute(delete(BlockedNumber).where(BlockedNumber.agent_id == agent_id))
    two_d = data.two_d or []
    three_d = data.three_d or []
    for n in two_d:
        if n and str(n).strip():
            db.add(BlockedNumber(id=str(uuid.uuid4()), agent_id=agent_id, game_type="2D", number=str(n).strip()))
    for n in three_d:
        if n and str(n).strip():
            db.add(BlockedNumber(id=str(uuid.uuid4()), agent_id=agent_id, game_type="3D", number=str(n).strip()))
    return {"ok": True}


@router.get("/{agent_id}/ledger")
async def get_agent_ledger(
    agent_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    current: Annotated[User, Depends(get_current_user)],
    date_filter: str | None = Query(None, alias="date"),
    round_name: str | None = Query(None),
    game_type: str | None = Query(None),
    limit: int = Query(500, ge=1, le=2000),
    offset: int = Query(0, ge=0),
):
    """Bet ledger for an agent: list bets from User Backend (players under this agent). Master/admin can see any agent; agent only self."""
    if current.role == UserRole.agent and current.id != agent_id:
        raise HTTPException(status_code=403, detail="Can only view own ledger")
    if current.role == UserRole.master:
        result = await db.execute(select(User).where(User.id == agent_id, User.role == UserRole.agent))
        agent = result.scalar_one_or_none()
        if not agent or agent.parent_id != current.id:
            raise HTTPException(status_code=403, detail="Can only view ledger of your agents")
    params = {"limit": limit, "offset": offset}
    if date_filter:
        params["date"] = date_filter
    if round_name:
        params["round_name"] = round_name
    if game_type:
        params["game_type"] = game_type
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            r = await client.get(
                f"{USER_BASE}/internal/agents/{agent_id}/bets",
                headers={"X-Internal-API-Key": settings.internal_api_key},
                params=params,
            )
            r.raise_for_status()
            return r.json()
    except httpx.HTTPError as e:
        logger.warning("Ledger proxy failed: %s", e)
        raise HTTPException(status_code=502, detail="Ledger service unavailable")
