from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import get_current_player
from app.database import get_db
from app.models import Player, Transaction

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.get("")
async def list_transactions(
    db: Annotated[AsyncSession, Depends(get_db)],
    current: Annotated[Player, Depends(get_current_player)],
):
    result = await db.execute(
        select(Transaction).where(Transaction.player_id == current.id).order_by(Transaction.timestamp.desc())
    )
    rows = result.scalars().all()
    return [
        {
            "id": r.id,
            "player_id": r.player_id,
            "type": r.type,
            "amount": float(r.amount),
            "balance_after": float(r.balance_after),
            "description": r.description,
            "related_bet_id": r.related_bet_id,
            "timestamp": r.timestamp.isoformat(),
        }
        for r in rows
    ]
