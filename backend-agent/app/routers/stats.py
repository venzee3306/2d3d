"""Dashboard stats API: counts and totals for Analytics and other pages."""
from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import get_current_user
from app.database import get_db
from app.models import User, PlayerSnapshot
from app.models.user import UserRole

router = APIRouter(prefix="/stats", tags=["stats"])


@router.get("")
async def get_stats(
    db: Annotated[AsyncSession, Depends(get_db)],
    current: Annotated[User, Depends(get_current_user)],
):
    """
    Return dashboard stats for the current user's scope.
    Admin: all masters, agents, players, total bet volume.
    Master: own agents, their players, totals for subtree.
    Agent: own players, totals for self.
    """
    if current.role == UserRole.admin:
        masters_count = await db.scalar(select(func.count(User.id)).where(User.role == UserRole.master))
        agents_count = await db.scalar(select(func.count(User.id)).where(User.role == UserRole.agent))
        players_result = await db.execute(select(func.count(PlayerSnapshot.player_id)))
        players_count = players_result.scalar() or 0
        volume_result = await db.execute(select(func.coalesce(func.sum(PlayerSnapshot.total_amount), 0)))
        total_bet_volume = float(volume_result.scalar() or 0)
    elif current.role == UserRole.master:
        agents_count = await db.scalar(select(func.count(User.id)).where(User.parent_id == current.id))
        masters_count = 0
        sub_agents = select(User.id).where(User.parent_id == current.id)
        q = select(
            func.count(PlayerSnapshot.player_id),
            func.coalesce(func.sum(PlayerSnapshot.total_amount), 0),
        ).where(PlayerSnapshot.agent_id.in_(sub_agents))
        row = (await db.execute(q)).one()
        players_count = row[0] or 0
        total_bet_volume = float(row[1] or 0)
    else:
        masters_count = 0
        agents_count = 0
        q = select(
            func.count(PlayerSnapshot.player_id),
            func.coalesce(func.sum(PlayerSnapshot.total_amount), 0),
        ).where(PlayerSnapshot.agent_id == current.id)
        row = (await db.execute(q)).one()
        players_count = row[0] or 0
        total_bet_volume = float(row[1] or 0)

    return {
        "total_masters": masters_count or 0,
        "total_agents": agents_count or 0,
        "total_players": players_count or 0,
        "total_bet_volume": total_bet_volume,
    }
