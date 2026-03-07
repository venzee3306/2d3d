"""Player deposit (top-up) requests. Creates request in Agent backend; list from Agent backend."""
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import get_current_player
from app.database import get_db
from app.models import Player
from app.schemas.deposit_request import DepositRequestCreate, DepositRequestResponse
from app.services.agent_client import create_deposit_request_at_agent, list_deposit_requests_by_player

router = APIRouter(prefix="/deposit-requests", tags=["deposit-requests"])


@router.post("", response_model=DepositRequestResponse)
async def create_deposit_request(
    data: DepositRequestCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current: Annotated[Player, Depends(get_current_player)],
):
    """Player creates a top-up request. Stored in Agent backend; agent approves there."""
    if data.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")
    result = await create_deposit_request_at_agent(
        player_id=current.id,
        player_name=current.name,
        agent_id=current.agent_id,
        amount=data.amount,
        transaction_id=data.transaction_id,
        payment_method=data.payment_method,
        note=data.note,
    )
    if not result:
        raise HTTPException(status_code=502, detail="Could not create request at agent backend")
    return DepositRequestResponse(
        id=result["id"],
        player_id=result["player_id"],
        player_name=result["player_name"],
        agent_id=result["agent_id"],
        amount=float(result["amount"]),
        transaction_id=result["transaction_id"],
        payment_method=result.get("payment_method"),
        status=result["status"],
        requested_at=result["requested_at"],
        processed_at=result.get("processed_at"),
        note=result.get("note"),
    )


@router.get("", response_model=list[DepositRequestResponse])
async def list_my_deposit_requests(
    current: Annotated[Player, Depends(get_current_player)],
):
    """List current player's deposit requests (from Agent backend)."""
    rows = await list_deposit_requests_by_player(current.id)
    return [
        DepositRequestResponse(
            id=r["id"],
            player_id=r["player_id"],
            player_name=r["player_name"],
            agent_id=r["agent_id"],
            amount=float(r["amount"]),
            transaction_id=r["transaction_id"],
            payment_method=r.get("payment_method"),
            status=r["status"],
            requested_at=r["requested_at"],
            processed_at=r.get("processed_at"),
            note=r.get("note"),
        )
        for r in rows
    ]
