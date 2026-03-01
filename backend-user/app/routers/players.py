from typing import Annotated

from fastapi import APIRouter, Depends
from app.auth import get_current_player
from app.models import Player
from app.schemas.player import PlayerResponse

router = APIRouter(prefix="/players", tags=["players"])


@router.get("/me", response_model=PlayerResponse)
async def me(current: Annotated[Player, Depends(get_current_player)]):
    return PlayerResponse(
        id=current.id,
        name=current.name,
        username=current.username,
        phone_number=current.phone_number,
        balance=float(current.balance),
        agent_id=current.agent_id,
        source=current.source,
        platform_id=current.platform_id,
        status=current.status,
        created_at=current.created_at,
        total_bets=current.total_bets,
        total_amount=float(current.total_amount),
        win_amount=float(current.win_amount),
        loss_amount=float(current.loss_amount),
        last_bet_at=current.last_bet_at,
    )
