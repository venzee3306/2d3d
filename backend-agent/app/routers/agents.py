from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import get_current_user
from app.database import get_db
from app.models import User
from app.models.user import UserRole
from app.schemas.user import UserResponse

router = APIRouter(prefix="/agents", tags=["agents"])


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
