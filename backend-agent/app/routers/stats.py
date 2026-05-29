"""Dashboard stats API: counts and totals for Analytics and other pages."""
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import get_current_user
from app.database import get_db
from app.models import User, PlayerSnapshot
from app.models.user import UserRole
from app.services.user_backend_client import fetch_today_summary, fetch_period_summary

router = APIRouter(prefix="/stats", tags=["stats"])
# Fallback only when User Backend does not return by_agent (e.g. old version)
FALLBACK_COMMISSION_RATE = 0.05


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

    agent_ids_for_today: list[str] = []
    if current.role == UserRole.admin:
        agent_ids_result = await db.execute(select(User.id).where(User.role == UserRole.agent))
        agent_ids_for_today = [r[0] for r in agent_ids_result.all()]
    elif current.role == UserRole.master:
        agent_ids_result = await db.execute(select(User.id).where(User.parent_id == current.id))
        agent_ids_for_today = [r[0] for r in agent_ids_result.all()]
    else:
        agent_ids_for_today = [current.id]
    today_data = await fetch_today_summary(agent_ids_for_today)
    total_sales = today_data.get("total_sales", 0) or 0
    total_payouts = today_data.get("total_payouts", 0) or 0
    # Use each agent's real commission_rate (set when agent was created); fallback to 5% only if no by_agent
    by_agent = today_data.get("by_agent") or []
    if by_agent:
        # Load commission_rate for each agent from our DB
        agents_result = await db.execute(
            select(User.id, User.commission_rate).where(User.id.in_(agent_ids_for_today))
        )
        rate_by_id = {r.id: (float(r.commission_rate) / 100.0) if r.commission_rate is not None else 0.0 for r in agents_result.all()}
        today_commission = sum(
            (item.get("sales") or 0) * rate_by_id.get(item.get("agent_id"), 0.0)
            for item in by_agent
        )
    else:
        today_commission = total_sales * FALLBACK_COMMISSION_RATE
    today_net_profit = total_sales - total_payouts - today_commission

    return {
        "total_masters": masters_count or 0,
        "total_agents": agents_count or 0,
        "total_players": players_count or 0,
        "total_bet_volume": total_bet_volume,
        "today_sales": total_sales,
        "today_payouts": total_payouts,
        "today_commission": today_commission,
        "today_net_profit": today_net_profit,
    }


@router.get("/analytics")
async def get_analytics(
    period: Annotated[str, Query(description="daily | weekly | monthly")] = "daily",
    db: Annotated[AsyncSession, Depends(get_db)] = None,
    current: Annotated[User, Depends(get_current_user)] = None,
):
    """
    Return period-based analytics for the current user's scope: total_agents, total_players
    (from agent DB), period_revenue, period_bets, growth_pct, comparison, and chart_data
    for Revenue Trend and Betting Activity charts.
    """
    if current.role == UserRole.admin:
        agents_count = await db.scalar(select(func.count(User.id)).where(User.role == UserRole.agent))
        sub_agents = select(User.id).where(User.role == UserRole.agent)
        players_result = await db.execute(select(func.count(PlayerSnapshot.player_id)))
        agent_ids_for_period = [r[0] for r in (await db.execute(select(User.id).where(User.role == UserRole.agent))).all()]
    elif current.role == UserRole.master:
        agents_count = await db.scalar(select(func.count(User.id)).where(User.parent_id == current.id))
        agent_ids_result = await db.execute(select(User.id).where(User.parent_id == current.id))
        agent_ids_for_period = [r[0] for r in agent_ids_result.all()]
        sub_agents = select(User.id).where(User.parent_id == current.id)
        players_result = await db.execute(
            select(func.count(PlayerSnapshot.player_id)).where(PlayerSnapshot.agent_id.in_(sub_agents))
        )
    else:
        agents_count = 0
        agent_ids_for_period = [current.id]
        players_result = await db.execute(
            select(func.count(PlayerSnapshot.player_id)).where(PlayerSnapshot.agent_id == current.id)
        )
    players_count = players_result.scalar() or 0

    period_data = await fetch_period_summary(agent_ids_for_period, period)
    return {
        "total_agents": agents_count or 0,
        "total_players": players_count,
        "period_revenue": period_data.get("period_sales", 0) or 0,
        "period_bets": period_data.get("period_bet_count", 0) or 0,
        "period_players": period_data.get("period_players", 0) or 0,
        "growth_pct": period_data.get("growth_pct", 0) or 0,
        "comparison": period_data.get("comparison", "vs yesterday"),
        "chart_data": period_data.get("chart_data", []),
    }


@router.get("/agent-breakdown")
async def get_agent_breakdown(
    db: Annotated[AsyncSession, Depends(get_db)],
    current: Annotated[User, Depends(get_current_user)],
):
    """
    Return per-agent revenue and total bets for the current user's scope.
    Master: each agent under this master. Admin: all agents. Agent: self only.
    Used for Agent Performance table and cards.
    """
    if current.role == UserRole.admin:
        agent_ids_result = await db.execute(select(User.id).where(User.role == UserRole.agent))
        agent_ids = [r[0] for r in agent_ids_result.all()]
    elif current.role == UserRole.master:
        agent_ids_result = await db.execute(select(User.id).where(User.parent_id == current.id))
        agent_ids = [r[0] for r in agent_ids_result.all()]
    else:
        agent_ids = [current.id]

    if not agent_ids:
        return {"breakdown": []}

    q = (
        select(
            PlayerSnapshot.agent_id,
            func.coalesce(func.sum(PlayerSnapshot.total_amount), 0).label("revenue"),
            func.coalesce(func.sum(PlayerSnapshot.total_bets), 0).label("total_bets"),
            func.count(PlayerSnapshot.player_id).label("players_count"),
        )
        .where(PlayerSnapshot.agent_id.in_(agent_ids))
        .group_by(PlayerSnapshot.agent_id)
    )
    rows = (await db.execute(q)).all()
    breakdown = [
        {
            "agent_id": r.agent_id,
            "revenue": float(r.revenue),
            "total_bets": int(r.total_bets),
            "players_count": int(r.players_count),
        }
        for r in rows
    ]
    # Include agents with no players (0 revenue, 0 bets)
    seen = {b["agent_id"] for b in breakdown}
    for aid in agent_ids:
        if aid not in seen:
            breakdown.append({"agent_id": aid, "revenue": 0.0, "total_bets": 0, "players_count": 0})
    return {"breakdown": breakdown}
