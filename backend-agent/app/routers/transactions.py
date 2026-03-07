"""Transactions list for agent dashboard."""
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import get_current_user
from app.database import get_db
from app.models import User, Transaction

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.get("")
async def list_transactions(
    type: str | None = Query(None, description="Filter by transaction type"),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Annotated[AsyncSession, Depends(get_db)] = None,
    current: Annotated[User, Depends(get_current_user)] = None,
):
    """List transactions for the current user."""
    q = select(Transaction).where(Transaction.user_id == current.id).order_by(Transaction.timestamp.desc())
    if type:
        q = q.where(Transaction.type == type)
    q = q.offset(offset).limit(limit)
    result = await db.execute(q)
    rows = result.scalars().all()
    return [
        {
            "id": r.id,
            "user_id": r.user_id,
            "type": r.type.value if hasattr(r.type, "value") else r.type,
            "amount": float(r.amount),
            "balance_before": float(r.balance_before),
            "balance_after": float(r.balance_after),
            "related_user_id": r.related_user_id,
            "related_user_name": r.related_user_name,
            "timestamp": r.timestamp.isoformat() if hasattr(r.timestamp, "isoformat") else str(r.timestamp),
            "note": r.note,
        }
        for r in rows
    ]
