"""Player withdrawal (cash out) requests. Creates at Agent backend; lists from Agent backend."""
from typing import Annotated
import uuid

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.auth import get_current_player
from app.models import Player
from app.services.agent_client import create_player_withdrawal_at_agent, list_player_withdrawals_by_player

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
):
    """Player creates a cash-out (withdrawal) request. Stored in Agent backend; agent approves there."""
    if data.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")
    if data.amount > float(current.balance):
        raise HTTPException(status_code=400, detail="Insufficient balance")
    if not data.account_number or len(data.account_number) < 5:
        raise HTTPException(status_code=400, detail="Account number must be at least 5 characters")
    result = await create_player_withdrawal_at_agent(
        player_id=current.id,
        player_name=current.name,
        agent_id=current.agent_id,
        amount=data.amount,
        payment_method=data.payment_method,
        account_number=data.account_number,
        account_name=data.account_name,
        note=data.note,
    )
    if not result:
        raise HTTPException(status_code=502, detail="Could not create request at agent backend")
    return result


@router.get("")
async def list_my_withdrawal_requests(
    current: Annotated[Player, Depends(get_current_player)],
):
    """List current player's withdrawal (cash out) requests (from Agent backend)."""
    rows = await list_player_withdrawals_by_player(current.id)
    return rows
