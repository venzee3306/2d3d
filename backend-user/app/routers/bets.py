"""Place bets, list bets, settle bets. Enforces agent limits and blocked numbers from Agent Backend."""
import asyncio
from collections import defaultdict
from datetime import datetime
from typing import Annotated
import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import get_current_player, require_internal_api_key
from app.database import get_db
from app.models import Player, Bet, Session, Transaction, CallbackConfig
from app.schemas.bet import PlaceBetsRequest, BetResponse, SettleBetsRequest, PAYOUT_MULTIPLIER
from app.services.agent_client import get_agent_limits, is_number_blocked
from app.services.sync_to_agent import sync_player_to_agent
from app.services.callbacks import send_callback_for_platform

router = APIRouter(prefix="/bets", tags=["bets"])


@router.post("", response_model=list[BetResponse])
async def place_bets(
    data: PlaceBetsRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    current: Annotated[Player, Depends(get_current_player)],
):
    # Lock player row so concurrent place_bets / settle for same player serialize correctly
    row = await db.execute(select(Player).where(Player.id == current.id).with_for_update())
    player = row.scalar_one()
    limits = await get_agent_limits(player.agent_id)
    blocked_2d = limits.get("blocked_numbers_2d", []) if limits else []
    blocked_3d = limits.get("blocked_numbers_3d", []) if limits else []
    total = sum(b.amount for b in data.bets)
    if total <= 0:
        raise HTTPException(status_code=400, detail="Total bet amount must be positive")
    if float(player.balance) < total:
        raise HTTPException(status_code=400, detail="Insufficient balance")
    for b in data.bets:
        if is_number_blocked(b.number, data.game_type, blocked_2d, blocked_3d):
            raise HTTPException(status_code=400, detail=f"Number {b.number} is blocked for {data.game_type}")

    session = await db.execute(select(Session).where(Session.id == data.session_id, Session.player_id == player.id))
    sess = session.scalar_one_or_none()
    if not sess:
        raise HTTPException(status_code=404, detail="Session not found")

    now = datetime.utcnow()
    created = []
    for b in data.bets:
        bet_id = str(uuid.uuid4())
        bet = Bet(
            id=bet_id,
            player_id=player.id,
            session_id=data.session_id,
            game_type=data.game_type,
            bet_number=b.number,
            amount=b.amount,
            round_name=data.round_name,
            status="Pending",
            placed_at=now,
            pattern_type=b.pattern_type,
            pattern_input=b.pattern_input,
            pattern_label=b.pattern_label,
        )
        db.add(bet)
        await db.flush()
        created.append(
            BetResponse(
                id=bet.id,
                player_id=bet.player_id,
                session_id=bet.session_id,
                game_type=bet.game_type,
                bet_number=bet.bet_number,
                amount=float(bet.amount),
                round_name=bet.round_name,
                status=bet.status,
                win_amount=None,
                placed_at=bet.placed_at,
            )
        )

    player.balance = float(player.balance) - total
    player.total_bets += len(data.bets)
    player.total_amount += total
    player.last_bet_at = now
    tx = Transaction(
        id=str(uuid.uuid4()),
        player_id=player.id,
        type="bet",
        amount=-total,
        balance_after=float(player.balance),
        description=f"Placed {len(data.bets)} bet(s)",
        timestamp=now,
    )
    db.add(tx)
    await db.flush()
    await sync_player_to_agent(player)
    return created


@router.get("", response_model=list[BetResponse])
async def list_bets(
    db: Annotated[AsyncSession, Depends(get_db)],
    current: Annotated[Player, Depends(get_current_player)],
    session_id: str | None = None,
):
    q = select(Bet).where(Bet.player_id == current.id).order_by(Bet.placed_at.desc())
    if session_id:
        q = q.where(Bet.session_id == session_id)
    result = await db.execute(q)
    rows = result.scalars().all()
    return [
        BetResponse(
            id=r.id,
            player_id=r.player_id,
            session_id=r.session_id,
            game_type=r.game_type,
            bet_number=r.bet_number,
            amount=float(r.amount),
            round_name=r.round_name,
            status=r.status,
            win_amount=float(r.win_amount) if r.win_amount is not None else None,
            placed_at=r.placed_at,
        )
        for r in rows
    ]


@router.post("/settle")
async def settle_bets(
    data: SettleBetsRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[None, Depends(require_internal_api_key)],
):
    """
    Settle all pending bets for a round (internal API). Call after draw result is known.
    Marks matching bets as Won (credits balance), others as Lost. Fires bet.settled and
    balance.updated callbacks for external platforms so they can keep wallet in sync.
    """
    multiplier = PAYOUT_MULTIPLIER.get(data.game_type)
    if multiplier is None:
        raise HTTPException(status_code=400, detail="game_type must be 2D or 3D")
    # Lock pending bets so concurrent settle for same round doesn't double-credit
    q = (
        select(Bet)
        .where(
            Bet.session_id == data.session_id,
            Bet.round_name == data.round_name,
            Bet.game_type == data.game_type,
            Bet.status == "Pending",
        )
        .with_for_update()
    )
    result = await db.execute(q)
    pending = result.scalars().all()
    if not pending:
        return {"settled": 0, "message": "No pending bets for this round"}

    now = datetime.utcnow()
    # player_id -> (total_win, list of (bet, status, win_amount))
    by_player: dict[str, tuple[float, list[tuple[Bet, str, float | None]]]] = defaultdict(lambda: (0.0, []))
    for bet in pending:
        won = bet.bet_number.strip() == data.winning_number.strip()
        if won:
            win_amt = float(bet.amount) * multiplier
            bet.status = "Won"
            bet.win_amount = win_amt
            total, lst = by_player[bet.player_id]
            by_player[bet.player_id] = (total + win_amt, lst + [(bet, "Won", win_amt)])
        else:
            bet.status = "Lost"
            bet.win_amount = None
            total, lst = by_player[bet.player_id]
            by_player[bet.player_id] = (total, lst + [(bet, "Lost", None)])
    await db.flush()

    # Load players with row lock so place_bets and settle don't race on balance
    players_to_callback: list[tuple[Player, float, list[dict]]] = []
    for player_id, (total_win, settled_list) in by_player.items():
        res = await db.execute(select(Player).where(Player.id == player_id).with_for_update())
        player = res.scalar_one()
        player.balance = float(player.balance) + total_win
        for b, st, wa in settled_list:
            if st == "Won":
                player.win_amount = float(player.win_amount) + (wa or 0)
            else:
                player.loss_amount = float(player.loss_amount) + float(b.amount)
        if total_win > 0:
            tx = Transaction(
                id=str(uuid.uuid4()),
                player_id=player_id,
                type="win",
                amount=total_win,
                balance_after=float(player.balance),
                description=f"Settlement: {data.game_type} {data.round_name} winning {data.winning_number}",
                timestamp=now,
            )
            db.add(tx)
        settled_payload = [
            {"bet_id": b.id, "status": st, "win_amount": wa, "amount": float(b.amount)}
            for b, st, wa in settled_list
        ]
        players_to_callback.append((player, float(player.balance), settled_payload))
        await sync_player_to_agent(player)

    # Load callback configs before commit so we can fire callbacks after
    platform_ids = [p[0].platform_id for p in players_to_callback if p[0].platform_id]
    configs = {}
    if platform_ids:
        cfg_res = await db.execute(select(CallbackConfig).where(CallbackConfig.platform_id.in_(platform_ids)))
        for c in cfg_res.scalars().all():
            configs[c.platform_id] = c
    await db.commit()

    # Fire callbacks for external platforms (seamless wallet)
    for player, balance_after, settled_payload in players_to_callback:
        if not player.platform_id:
            continue
        cfg = configs.get(player.platform_id)
        if not cfg:
            continue
        asyncio.create_task(
            send_callback_for_platform(
                player.platform_id,
                "bet.settled",
                {
                    "player_id": player.id,
                    "balance_after": balance_after,
                    "round_name": data.round_name,
                    "game_type": data.game_type,
                    "winning_number": data.winning_number,
                    "settled_bets": settled_payload,
                },
                cfg.callback_url,
                cfg.api_key,
            )
        )
        asyncio.create_task(
            send_callback_for_platform(
                player.platform_id,
                "balance.updated",
                {"player_id": player.id, "balance_after": balance_after, "reason": "bet_settled"},
                cfg.callback_url,
                cfg.api_key,
            )
        )

    return {"settled": len(pending), "players_affected": len(by_player)}
