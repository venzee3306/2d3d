"""Player withdrawal (cash out) requests. Creates at Agent backend; lists from Agent backend."""
from datetime import datetime
from typing import Annotated
import uuid

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import get_current_player
from app.database import get_db
from app.models import Player, Transaction
from app.services.agent_client import create_player_withdrawal_at_agent, list_player_withdrawals_by_player
from app.websocket import broadcast_balance_updated

router = APIRouter(prefix="/withdrawal-requests", tags=["withdrawal-requests"])


class WithdrawalRequestCreate(BaseModel):
    amount: float
    payment_method: str
    account_number: str
    account_name: str
    note: str | None = None


@router.post("")
async def create_withdrawal_request(
    data: WithdrawalRequestCreate,
    current: Annotated[Player, Depends(get_current_player)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Player creates a cash-out (withdrawal) request. Balance is deducted immediately; request stored in Agent backend."""
    if data.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")
    if data.amount > float(current.balance):
        raise HTTPException(status_code=400, detail="Insufficient balance")
    if not data.account_number or len(data.account_number) < 5:
        raise HTTPException(status_code=400, detail="Account number must be at least 5 characters")
    amount = data.amount
    res = await db.execute(select(Player).where(Player.id == current.id).with_for_update())
    p = res.scalar_one_or_none()
    if not p or float(p.balance) < amount:
        raise HTTPException(status_code=400, detail="Insufficient balance")
    before = float(p.balance)
    p.balance = before - amount
    now = datetime.utcnow()
    tx = Transaction(
        id=str(uuid.uuid4()),
        player_id=p.id,
        type="cashout",
        amount=-amount,
        balance_after=float(p.balance),
        description="Withdrawal request",
        related_bet_id=None,
        timestamp=now,
    )
    db.add(tx)
    await db.flush()
    result = await create_player_withdrawal_at_agent(
        player_id=current.id,
        player_name=current.name,
        agent_id=current.agent_id,
        amount=amount,
        payment_method=data.payment_method,
        account_number=data.account_number,
        account_name=data.account_name,
        note=data.note,
    )
    if not result:
        p.balance = before
        await db.delete(tx)
        await db.flush()
        await broadcast_balance_updated()
        raise HTTPException(status_code=502, detail="Could not create request at agent backend")
    request_id = result.get("id")
    if request_id:
        tx.description = f"Withdrawal request {request_id}"
        await db.flush()
    await broadcast_balance_updated()
    return {**result, "balance_after": float(p.balance)}


@router.get("")
async def list_my_withdrawal_requests(
    current: Annotated[Player, Depends(get_current_player)],
):
    """List current player's withdrawal (cash out) requests (from Agent backend)."""
    rows = await list_player_withdrawals_by_player(current.id)
    return rows
