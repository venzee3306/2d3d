from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from app.auth import get_current_player, hash_password, verify_password
from app.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import Player
from app.schemas.player import PlayerResponse, PlayerMeUpdate

router = APIRouter(prefix="/players", tags=["players"])


def _player_to_response(p: Player) -> PlayerResponse:
    return PlayerResponse(
        id=p.id,
        name=p.name,
        username=p.username,
        phone_number=p.phone_number,
        balance=float(p.balance),
        agent_id=p.agent_id,
        source=p.source,
        platform_id=p.platform_id,
        status=p.status,
        created_at=p.created_at,
        total_bets=p.total_bets,
        total_amount=float(p.total_amount),
        win_amount=float(p.win_amount),
        loss_amount=float(p.loss_amount),
        last_bet_at=p.last_bet_at,
    )


@router.get("/me", response_model=PlayerResponse)
async def me(current: Annotated[Player, Depends(get_current_player)]):
    return _player_to_response(current)


@router.get("/me/agent-payment-profile")
async def get_agent_payment_profile(
    current: Annotated[Player, Depends(get_current_player)],
):
    """Get the current player's agent's bank accounts for deposit flow (where to send money)."""
    from app.services.agent_client import get_agent_bank_accounts
    accounts = await get_agent_bank_accounts(current.agent_id)
    return {
        "agent_id": current.agent_id,
        "payment_methods": [
            {
                "id": a["id"],
                "method": a["payment_method"],
                "account_name": a["account_name"],
                "account_number": a["account_number"],
                "bank_name": a.get("bank_name"),
                "qr_code_url": a.get("qr_code_url"),
                "is_active": True,
            }
            for a in accounts
        ],
    }


@router.patch("/me", response_model=PlayerResponse)
async def update_me(
    data: PlayerMeUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current: Annotated[Player, Depends(get_current_player)],
):
    """Update own profile (name, phone_number and/or password). For password, current_password is required."""
    if data.name is not None:
        current.name = data.name
    if data.phone_number is not None:
        current.phone_number = data.phone_number
    if data.new_password is not None:
        if not data.current_password:
            raise HTTPException(status_code=400, detail="current_password required to set new_password")
        if not verify_password(data.current_password, current.password_hash):
            raise HTTPException(status_code=400, detail="current_password is incorrect")
        current.password_hash = hash_password(data.new_password)
    await db.flush()
    return _player_to_response(current)
