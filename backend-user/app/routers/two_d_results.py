"""2D results from 2DBoss API: live cache + history from DB (no set-2d-service)."""
import logging

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.services import twod_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/2d-results", tags=["2d-results"])


@router.get("/daily")
async def get_daily_2d(db: AsyncSession = Depends(get_db)):
    """Return live 2D + today's 12:01 PM and 4:30 PM results. 200 with live=null, results=[] if unavailable."""
    await twod_service.ensure_today_sessions_captured()
    live = await twod_service.get_live_cached()
    if live is None and twod_service.is_myanmar_market_hours():
        live = await twod_service.refresh_live_cache()
    live_payload = None
    if live:
        live_payload = {
            "twoD": live["two_d"],
            "rawSetIndex": live["set_index"],
            "value": live["market_value"],
            "timestamp": live["timestamp"],
        }
    results = await twod_service.get_today_results(db)
    return {"live": live_payload, "results": results, "modernInternet": []}


@router.get("/history")
async def get_2d_history(
    days: int = Query(30, ge=1, le=90),
    db: AsyncSession = Depends(get_db),
):
    """Return previous days' 12:01 and 4:30 for the DATE table: [{ date, '12:01', '4:30' }]."""
    await twod_service.ensure_today_sessions_captured()
    return await twod_service.get_history(db, days)


@router.get("/live")
async def get_live_2d():
    """Return current live 2D. Tries one refresh if cache empty during market hours."""
    from fastapi import HTTPException
    cached = await twod_service.get_live_cached()
    if cached is None and twod_service.is_myanmar_market_hours():
        cached = await twod_service.refresh_live_cache()
    if cached is None:
        raise HTTPException(status_code=404, detail="No live 2D data yet")
    return {
        "twoD": cached["two_d"],
        "rawSetIndex": cached["set_index"],
        "value": cached["market_value"],
        "timestamp": cached["timestamp"],
    }
