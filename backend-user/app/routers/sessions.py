from typing import Annotated
import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import get_current_player
from app.database import get_db
from app.models import Player, Session
from app.schemas.session import SessionCreate, SessionResponse

router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.post("", response_model=SessionResponse)
async def create_session(
    data: SessionCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current: Annotated[Player, Depends(get_current_player)],
):
    session_id = str(uuid.uuid4())
    session = Session(
        id=session_id,
        player_id=current.id,
        round_name=data.round_name,
        date=data.date,
    )
    db.add(session)
    await db.flush()
    return SessionResponse(id=session.id, player_id=session.player_id, round_name=session.round_name, date=session.date)


@router.get("", response_model=list[SessionResponse])
async def list_sessions(
    db: Annotated[AsyncSession, Depends(get_db)],
    current: Annotated[Player, Depends(get_current_player)],
):
    result = await db.execute(select(Session).where(Session.player_id == current.id).order_by(Session.created_at.desc()))
    rows = result.scalars().all()
    return [SessionResponse(id=s.id, player_id=s.player_id, round_name=s.round_name, date=s.date) for s in rows]
