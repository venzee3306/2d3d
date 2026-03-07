from typing import Annotated
import uuid

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import get_current_user
from app.database import get_db
from app.models import User, BlockedNumber
from app.models.user import UserRole
from app.schemas.user import UserResponse

router = APIRouter(prefix="/agents", tags=["agents"])


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
    return [UserResponse(id=u.id, name=u.name, username=u.username, role=u.role, parent_id=u.parent_id) for u in users]


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
    return [UserResponse(id=u.id, name=u.name, username=u.username, role=u.role, parent_id=u.parent_id) for u in users]


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
