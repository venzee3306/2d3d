"""Internal API: called by Agent Backend (X-Internal-API-Key)."""
from datetime import datetime, date, timedelta
from typing import Annotated, Literal
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import require_internal_api_key, hash_password
from app.database import get_db
from app.models import Player, Transaction, Bet, Draw
from app.routers.bets import run_settle_round_for_date
from app.services.sync_to_agent import sync_player_to_agent
from app.websocket import broadcast_balance_updated, broadcast_requests_updated

router = APIRouter(prefix="/internal", tags=["internal"])


class DrawCreateBody(BaseModel):
    """Create a draw (2D/3D result) and settle that round. Called by Agent Backend (admin sets 3D result)."""
    date: str  # YYYY-MM-DD
    round_name: str  # Morning | Evening
    game_type: str  # 2D | 3D
    winning_number: str


class CreditDepositBody(BaseModel):
    """Agent backend calls this after approving a player deposit request."""
    player_id: str
    amount: float
    request_id: str | None = None
    description: str | None = None


class DebitWithdrawalBody(BaseModel):
    """Agent backend calls this after approving a player withdrawal (cash out). DEPRECATED: balance now deducted at request time; use confirm-withdrawal instead."""
    player_id: str
    amount: float
    request_id: str | None = None
    description: str | None = None


class ConfirmWithdrawalBody(BaseModel):
    """Agent backend calls this when approving; balance was already deducted at request time."""
    player_id: str
    amount: float
    request_id: str | None = None


class CreditRejectedWithdrawalBody(BaseModel):
    """Agent backend calls this when rejecting; adds amount back to player."""
    player_id: str
    amount: float
    request_id: str | None = None


@router.post("/draws")
async def create_draw_internal(
    data: DrawCreateBody,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[None, Depends(require_internal_api_key)],
):
    """
    Create a draw (2D/3D result) and settle that round. Called by Agent Backend when admin sets 3D result.
    Saves to history and runs settlement for pending bets.
    """
    if data.game_type not in ("2D", "3D"):
        raise HTTPException(status_code=400, detail="game_type must be 2D or 3D")
    if data.round_name not in ("Morning", "Evening"):
        raise HTTPException(status_code=400, detail="round_name must be Morning or Evening")
    try:
        draw_date = datetime.strptime(data.date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="date must be YYYY-MM-DD")
    winning = (data.winning_number or "").strip()
    if not winning:
        raise HTTPException(status_code=400, detail="winning_number required")
    if data.game_type == "3D" and len(winning) != 3:
        raise HTTPException(status_code=400, detail="3D winning_number must be 3 digits")
    if data.game_type == "2D" and len(winning) != 2:
        raise HTTPException(status_code=400, detail="2D winning_number must be 2 digits")

    existing = await db.execute(
        select(Draw).where(
            Draw.date == draw_date,
            Draw.round_name == data.round_name,
            Draw.game_type == data.game_type,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Draw already exists for this date/round/game_type")

    draw_id = str(uuid.uuid4())
    db.add(
        Draw(
            id=draw_id,
            date=draw_date,
            round_name=data.round_name,
            game_type=data.game_type,
            winning_number=winning,
            announced_at=datetime.utcnow(),
        )
    )
    await db.flush()
    out = await run_settle_round_for_date(db, data.date, data.round_name, data.game_type, winning)
    if out.get("settled", 0) == 0:
        await db.commit()
    return {"id": draw_id, "date": data.date, "round_name": data.round_name, "game_type": data.game_type, "winning_number": winning, "settled": out.get("settled", 0)}


class InternalPlayerCreate(BaseModel):
    """Create a player (agent_id from agent dashboard). Called by Agent Backend."""
    agent_id: str
    name: str
    username: str
    password: str
    phone_number: str | None = None


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


@router.post("/players")
async def create_player_internal(
    data: InternalPlayerCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[None, Depends(require_internal_api_key)],
):
    """Create a player in User Backend and sync to Agent Backend. Called by Agent Backend when agent creates a player."""
    existing = await db.execute(select(Player).where(Player.username == data.username))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Username already exists")
    player_id = str(uuid.uuid4())
    player = Player(
        id=player_id,
        name=data.name,
        username=data.username,
        password_hash=hash_password(data.password),
        phone_number=data.phone_number or None,
        balance=0,
        agent_id=data.agent_id,
        source="portal",
        platform_id=None,
        status="active",
    )
    db.add(player)
    await db.flush()
    await sync_player_to_agent(player)
    return _player_payload(player)


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


@router.post("/credit-deposit")
async def credit_deposit(
    data: CreditDepositBody,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[None, Depends(require_internal_api_key)],
):
    """
    Credit a player's balance after agent approved a deposit request.
    Called by Agent Backend when agent approves a player deposit.
    """
    if data.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")
    result = await db.execute(select(Player).where(Player.id == data.player_id).with_for_update())
    p = result.scalar_one_or_none()
    if not p:
        raise HTTPException(status_code=404, detail="Player not found")
    before = float(p.balance)
    p.balance = before + data.amount
    now = datetime.utcnow()
    desc = data.description or "Deposit approved"
    tx = Transaction(
        id=str(uuid.uuid4()),
        player_id=p.id,
        type="deposit",
        amount=data.amount,
        balance_after=float(p.balance),
        description=desc,
        related_bet_id=None,
        timestamp=now,
    )
    db.add(tx)
    await db.flush()
    from app.websocket import broadcast_balance_updated
    await broadcast_balance_updated()
    return {"ok": True, "player_id": p.id, "balance_after": float(p.balance)}


@router.post("/debit-withdrawal")
async def debit_withdrawal(
    data: DebitWithdrawalBody,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[None, Depends(require_internal_api_key)],
):
    """
    Debit a player's balance after agent approved a withdrawal (cash out).
    Called by Agent Backend when agent approves a player withdrawal.
    """
    if data.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")
    result = await db.execute(select(Player).where(Player.id == data.player_id).with_for_update())
    p = result.scalar_one_or_none()
    if not p:
        raise HTTPException(status_code=404, detail="Player not found")
    before = float(p.balance)
    if before < data.amount:
        raise HTTPException(status_code=400, detail="Insufficient player balance")
    p.balance = before - data.amount
    now = datetime.utcnow()
    desc = data.description or "Cash out approved"
    tx = Transaction(
        id=str(uuid.uuid4()),
        player_id=p.id,
        type="cashout",
        amount=-data.amount,
        balance_after=float(p.balance),
        description=desc,
        related_bet_id=None,
        timestamp=now,
    )
    db.add(tx)
    await db.flush()
    await broadcast_balance_updated()
    return {"ok": True, "player_id": p.id, "balance_after": float(p.balance)}


@router.post("/confirm-withdrawal")
async def confirm_withdrawal(
    data: ConfirmWithdrawalBody,
    _: Annotated[None, Depends(require_internal_api_key)],
):
    """
    Called by Agent Backend when agent approves a withdrawal.
    Balance was already deducted at request time; this is a no-op for balance.
    Broadcast so User site refetches and sees the request status as approved.
    """
    await broadcast_balance_updated()
    await broadcast_requests_updated()
    return {"ok": True, "player_id": data.player_id}


@router.post("/credit-rejected-withdrawal")
async def credit_rejected_withdrawal(
    data: CreditRejectedWithdrawalBody,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[None, Depends(require_internal_api_key)],
):
    """
    Called by Agent Backend when agent rejects a withdrawal.
    Adds the amount back to player balance.
    """
    if data.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")
    result = await db.execute(select(Player).where(Player.id == data.player_id).with_for_update())
    p = result.scalar_one_or_none()
    if not p:
        raise HTTPException(status_code=404, detail="Player not found")
    before = float(p.balance)
    p.balance = before + data.amount
    now = datetime.utcnow()
    desc = f"Withdrawal rejected, refund {data.request_id or ''}"
    tx = Transaction(
        id=str(uuid.uuid4()),
        player_id=p.id,
        type="deposit",
        amount=data.amount,
        balance_after=float(p.balance),
        description=desc,
        related_bet_id=None,
        timestamp=now,
    )
    db.add(tx)
    await db.flush()
    await broadcast_balance_updated()
    await broadcast_requests_updated()
    return {"ok": True, "player_id": p.id, "balance_after": float(p.balance)}


@router.get("/today-summary")
async def get_today_summary(
    agent_ids: str = Query(..., description="Comma-separated agent IDs"),
    db: Annotated[AsyncSession, Depends(get_db)] = None,
    _: Annotated[None, Depends(require_internal_api_key)] = None,
):
    """
    Return today's sales and payouts for players under the given agents.
    Includes by_agent breakdown so Agent Backend can compute commission using each agent's commission_rate.
    """
    agent_list = [a.strip() for a in agent_ids.split(",") if a.strip()]
    if not agent_list:
        return {"total_sales": 0, "total_payouts": 0, "by_agent": []}
    today = date.today()
    # Totals
    sales_q = (
        select(func.coalesce(func.sum(Bet.amount), 0))
        .select_from(Bet)
        .join(Player, Bet.player_id == Player.id)
        .where(Player.agent_id.in_(agent_list), func.date(Bet.placed_at) == today)
    )
    sales_row = await db.execute(sales_q)
    total_sales = float(sales_row.scalar() or 0)
    payouts_q = (
        select(func.coalesce(func.sum(Transaction.amount), 0))
        .select_from(Transaction)
        .join(Player, Transaction.player_id == Player.id)
        .where(
            Player.agent_id.in_(agent_list),
            Transaction.type == "win",
            func.date(Transaction.timestamp) == today,
        )
    )
    payouts_row = await db.execute(payouts_q)
    total_payouts = float(payouts_row.scalar() or 0)
    # Per-agent breakdown (sales and payouts by agent_id)
    by_agent_sales_q = (
        select(Player.agent_id, func.coalesce(func.sum(Bet.amount), 0).label("sales"))
        .select_from(Bet)
        .join(Player, Bet.player_id == Player.id)
        .where(Player.agent_id.in_(agent_list), func.date(Bet.placed_at) == today)
        .group_by(Player.agent_id)
    )
    sales_by_agent = {r.agent_id: float(r.sales) for r in (await db.execute(by_agent_sales_q)).all()}
    by_agent_payouts_q = (
        select(Player.agent_id, func.coalesce(func.sum(Transaction.amount), 0).label("payouts"))
        .select_from(Transaction)
        .join(Player, Transaction.player_id == Player.id)
        .where(
            Player.agent_id.in_(agent_list),
            Transaction.type == "win",
            func.date(Transaction.timestamp) == today,
        )
        .group_by(Player.agent_id)
    )
    payouts_by_agent = {r.agent_id: float(r.payouts) for r in (await db.execute(by_agent_payouts_q)).all()}
    by_agent = [
        {
            "agent_id": aid,
            "sales": sales_by_agent.get(aid, 0.0),
            "payouts": payouts_by_agent.get(aid, 0.0),
        }
        for aid in agent_list
    ]
    return {"total_sales": total_sales, "total_payouts": total_payouts, "by_agent": by_agent}


@router.get("/agents/{agent_id}/bets")
async def list_bets_by_agent(
    agent_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[None, Depends(require_internal_api_key)],
    date_filter: str | None = Query(None, alias="date", description="YYYY-MM-DD"),
    round_name: str | None = Query(None),
    game_type: str | None = Query(None),
    limit: int = Query(500, ge=1, le=2000),
    offset: int = Query(0, ge=0),
):
    """List bets for all players under this agent. For Agent Dashboard bet ledger."""
    q = (
        select(Bet, Player.name.label("player_name"))
        .join(Player, Bet.player_id == Player.id)
        .where(Player.agent_id == agent_id)
        .order_by(Bet.placed_at.desc())
    )
    if date_filter:
        try:
            d = date.fromisoformat(date_filter)
            q = q.where(func.date(Bet.placed_at) == d)
        except ValueError:
            pass
    if round_name:
        q = q.where(Bet.round_name == round_name)
    if game_type:
        q = q.where(Bet.game_type == game_type)
    q = q.offset(offset).limit(limit)
    result = await db.execute(q)
    rows = result.all()
    return [
        {
            "id": r.Bet.id,
            "player_id": r.Bet.player_id,
            "player_name": r.player_name,
            "bet_number": r.Bet.bet_number,
            "amount": float(r.Bet.amount),
            "game_type": r.Bet.game_type,
            "round_name": r.Bet.round_name,
            "status": r.Bet.status,
            "placed_at": r.Bet.placed_at.isoformat() if r.Bet.placed_at else None,
            "win_amount": float(r.Bet.win_amount) if r.Bet.win_amount is not None else None,
        }
        for r in rows
    ]


def _period_bounds(period: Literal["daily", "weekly", "monthly"]):
    """Return (current_start, current_end, previous_start, previous_end) as dates for the period."""
    today = date.today()
    if period == "daily":
        cur_start = cur_end = today
        prev_end = today - timedelta(days=1)
        prev_start = prev_end
        return cur_start, cur_end, prev_start, prev_end
    if period == "weekly":
        # ISO week: Monday = start
        weekday = today.weekday()  # 0=Mon, 6=Sun
        cur_start = today - timedelta(days=weekday)
        cur_end = cur_start + timedelta(days=6)
        prev_start = cur_start - timedelta(days=7)
        prev_end = prev_start + timedelta(days=6)
        return cur_start, cur_end, prev_start, prev_end
    # monthly
    cur_start = today.replace(day=1)
    if today.month == 12:
        cur_end = today
        prev_start = today.replace(year=today.year - 1, month=12, day=1)
        prev_end = prev_start.replace(day=31)
    else:
        next_month = cur_start.replace(month=cur_start.month + 1)
        cur_end = next_month - timedelta(days=1)
        prev_start = cur_start.replace(month=cur_start.month - 1) if cur_start.month > 1 else cur_start.replace(year=cur_start.year - 1, month=12)
        prev_end = cur_start - timedelta(days=1)
    return cur_start, cur_end, prev_start, prev_end


@router.get("/period-summary")
async def get_period_summary(
    agent_ids: str = Query(..., description="Comma-separated agent IDs"),
    period: Literal["daily", "weekly", "monthly"] = Query("daily"),
    db: Annotated[AsyncSession, Depends(get_db)] = None,
    _: Annotated[None, Depends(require_internal_api_key)] = None,
):
    """
    Return period-based sales and bet counts for analytics.
    period: daily (today vs yesterday), weekly (this week vs last), monthly (this month vs last).
    Also returns chart_data: buckets with revenue, bets, players for the current period.
    """
    agent_list = [a.strip() for a in agent_ids.split(",") if a.strip()]
    if not agent_list:
        return {
            "period_sales": 0,
            "period_bet_count": 0,
            "period_players": 0,
            "previous_sales": 0,
            "previous_bet_count": 0,
            "growth_pct": 0.0,
            "comparison": "vs yesterday" if period == "daily" else ("vs last week" if period == "weekly" else "vs last month"),
            "chart_data": [],
        }

    cur_start, cur_end, prev_start, prev_end = _period_bounds(period)

    # Current period aggregates
    cur_sales_q = (
        select(func.coalesce(func.sum(Bet.amount), 0))
        .select_from(Bet)
        .join(Player, Bet.player_id == Player.id)
        .where(
            and_(
                Player.agent_id.in_(agent_list),
                func.date(Bet.placed_at) >= cur_start,
                func.date(Bet.placed_at) <= cur_end,
            )
        )
    )
    cur_count_q = (
        select(func.count(Bet.id))
        .select_from(Bet)
        .join(Player, Bet.player_id == Player.id)
        .where(
            and_(
                Player.agent_id.in_(agent_list),
                func.date(Bet.placed_at) >= cur_start,
                func.date(Bet.placed_at) <= cur_end,
            )
        )
    )
    cur_players_q = (
        select(func.count(func.distinct(Bet.player_id)))
        .select_from(Bet)
        .join(Player, Bet.player_id == Player.id)
        .where(
            and_(
                Player.agent_id.in_(agent_list),
                func.date(Bet.placed_at) >= cur_start,
                func.date(Bet.placed_at) <= cur_end,
            )
        )
    )
    prev_sales_q = (
        select(func.coalesce(func.sum(Bet.amount), 0))
        .select_from(Bet)
        .join(Player, Bet.player_id == Player.id)
        .where(
            and_(
                Player.agent_id.in_(agent_list),
                func.date(Bet.placed_at) >= prev_start,
                func.date(Bet.placed_at) <= prev_end,
            )
        )
    )
    prev_count_q = (
        select(func.count(Bet.id))
        .select_from(Bet)
        .join(Player, Bet.player_id == Player.id)
        .where(
            and_(
                Player.agent_id.in_(agent_list),
                func.date(Bet.placed_at) >= prev_start,
                func.date(Bet.placed_at) <= prev_end,
            )
        )
    )

    cur_sales = float((await db.execute(cur_sales_q)).scalar() or 0)
    cur_count = int((await db.execute(cur_count_q)).scalar() or 0)
    cur_players = int((await db.execute(cur_players_q)).scalar() or 0)
    prev_sales = float((await db.execute(prev_sales_q)).scalar() or 0)
    prev_count = int((await db.execute(prev_count_q)).scalar() or 0)

    if prev_sales and prev_sales > 0:
        growth_pct = round((cur_sales - prev_sales) / prev_sales * 100, 1)
    else:
        growth_pct = 0.0 if cur_sales == 0 else 100.0
    comparison = "vs yesterday" if period == "daily" else ("vs last week" if period == "weekly" else "vs last month")

    # Chart data: buckets with revenue, bets, distinct players
    chart_data: list[dict] = []
    if period == "daily":
        for h in range(24):
            hour_start = datetime.combine(cur_start, datetime.min.time().replace(hour=h))
            hour_end = hour_start + timedelta(hours=1)
            if cur_start == cur_end and hour_start.date() > cur_end:
                break
            sq = (
                select(
                    func.coalesce(func.sum(Bet.amount), 0),
                    func.count(Bet.id),
                    func.count(func.distinct(Bet.player_id)),
                )
                .select_from(Bet)
                .join(Player, Bet.player_id == Player.id)
                .where(
                    and_(
                        Player.agent_id.in_(agent_list),
                        Bet.placed_at >= hour_start,
                        Bet.placed_at < hour_end,
                    )
                )
            )
            row = (await db.execute(sq)).one()
            chart_data.append({
                "name": f"{h:02d}:00",
                "revenue": float(row[0] or 0),
                "bets": int(row[1] or 0),
                "players": int(row[2] or 0),
            })
    elif period == "weekly":
        weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        for d in range(7):
            day_date = cur_start + timedelta(days=d)
            if day_date > cur_end:
                chart_data.append({"name": weekdays[d], "revenue": 0, "bets": 0, "players": 0})
                continue
            day_end = day_date + timedelta(days=1)
            sq = (
                select(
                    func.coalesce(func.sum(Bet.amount), 0),
                    func.count(Bet.id),
                    func.count(func.distinct(Bet.player_id)),
                )
                .select_from(Bet)
                .join(Player, Bet.player_id == Player.id)
                .where(
                    and_(
                        Player.agent_id.in_(agent_list),
                        Bet.placed_at >= datetime.combine(day_date, datetime.min.time()),
                        Bet.placed_at < datetime.combine(day_end, datetime.min.time()),
                    )
                )
            )
            row = (await db.execute(sq)).one()
            chart_data.append({
                "name": weekdays[d],
                "revenue": float(row[0] or 0),
                "bets": int(row[1] or 0),
                "players": int(row[2] or 0),
            })
    else:
        month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        # Last 12 months in chronological order (oldest first)
        for i in range(12):
            months_ago = 11 - i
            total_months = today.year * 12 + today.month - 1
            back = total_months - months_ago
            y = back // 12
            m = back % 12 + 1
            month_start = date(y, m, 1)
            if m == 12:
                month_end = date(y, 12, 31)
            else:
                month_end = date(y, m + 1, 1) - timedelta(days=1)
            sq = (
                select(
                    func.coalesce(func.sum(Bet.amount), 0),
                    func.count(Bet.id),
                    func.count(func.distinct(Bet.player_id)),
                )
                .select_from(Bet)
                .join(Player, Bet.player_id == Player.id)
                .where(
                    and_(
                        Player.agent_id.in_(agent_list),
                        func.date(Bet.placed_at) >= month_start,
                        func.date(Bet.placed_at) <= month_end,
                    )
                )
            )
            row = (await db.execute(sq)).one()
            chart_data.append({
                "name": month_names[m - 1],
                "revenue": float(row[0] or 0),
                "bets": int(row[1] or 0),
                "players": int(row[2] or 0),
            })

    return {
        "period_sales": cur_sales,
        "period_bet_count": cur_count,
        "period_players": cur_players,
        "previous_sales": prev_sales,
        "previous_bet_count": prev_count,
        "growth_pct": growth_pct,
        "comparison": comparison,
        "chart_data": chart_data,
    }
