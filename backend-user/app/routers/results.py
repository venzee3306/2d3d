"""Daily results (draws) for 2D/3D lottery."""
from datetime import date, datetime
from typing import Annotated
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import require_internal_api_key
from app.database import get_db
from app.models import Draw

router = APIRouter(prefix="/results", tags=["results"])


class DrawCreate(BaseModel):
    date: str  # YYYY-MM-DD
    round_name: str  # Morning | Evening
    game_type: str  # 2D | 3D
    winning_number: str


@router.get("")
async def list_results(
    date_filter: str | None = Query(None, alias="date", description="Filter by date YYYY-MM-DD"),
    game_type: str | None = Query(None, description="Filter by 2D or 3D"),
    round_name: str | None = Query(None, description="Filter by Morning or Evening"),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Annotated[AsyncSession, Depends(get_db)] = None,
):
    """List draw results (public)."""
    q = select(Draw).order_by(Draw.date.desc(), Draw.round_name)
    if date_filter:
        try:
            dt = datetime.strptime(date_filter, "%Y-%m-%d").date()
            q = q.where(Draw.date == dt)
        except ValueError:
            pass
    if game_type:
        q = q.where(Draw.game_type == game_type)
    if round_name:
        q = q.where(Draw.round_name == round_name)
    q = q.offset(offset).limit(limit)
    result = await db.execute(q)
    rows = result.scalars().all()
    return [
        {
            "id": r.id,
            "date": r.date.isoformat() if hasattr(r.date, "isoformat") else str(r.date),
            "game_type": r.game_type,
            "round": r.round_name,
            "winning_number": r.winning_number,
            "announced_at": r.announced_at.isoformat() if r.announced_at else None,
        }
        for r in rows
    ]
