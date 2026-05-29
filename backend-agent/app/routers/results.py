"""Proxy draw results from User Backend; admin can create 3D results."""
import logging
from typing import Annotated

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

from app.auth import get_current_user
from app.config import settings
from app.models import User
from app.models.user import UserRole

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/results", tags=["results"])
USER_BASE = settings.user_backend_url.rstrip("/")


class Set3DResultBody(BaseModel):
    date: str  # YYYY-MM-DD
    round_name: str  # Morning | Evening
    winning_number: str


@router.get("")
async def list_results(
    current: Annotated[User, Depends(get_current_user)],
    date_filter: str | None = Query(None, alias="date"),
    game_type: str | None = Query(None),
    round_name: str | None = Query(None),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
):
    """Proxy to User Backend: list draw results (2D/3D history)."""
    params = {"limit": limit, "offset": offset}
    if date_filter:
        params["date"] = date_filter
    if game_type:
        params["game_type"] = game_type
    if round_name:
        params["round_name"] = round_name
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            r = await client.get(f"{USER_BASE}/results", params=params)
            r.raise_for_status()
            return r.json()
    except httpx.HTTPError as e:
        logger.warning("Results proxy failed: %s", e)
        raise HTTPException(status_code=502, detail="Results service unavailable")


@router.post("/3d")
async def set_3d_result(
    data: Set3DResultBody,
    current: Annotated[User, Depends(get_current_user)],
):
    """Admin only: create a 3D draw and run settlement. Saves to history in User Backend."""
    if current.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Only admin can set 3D result")
    date_val = data.date
    round_name = data.round_name
    winning_number = (data.winning_number or "").strip()
    if not date_val or not round_name or not winning_number:
        raise HTTPException(status_code=400, detail="date, round_name, and winning_number required")
    if round_name not in ("Morning", "Evening"):
        raise HTTPException(status_code=400, detail="round_name must be Morning or Evening")
    if len(winning_number) != 3 or not winning_number.isdigit():
        raise HTTPException(status_code=400, detail="winning_number must be 3 digits")

    payload = {
        "date": date_val,
        "round_name": round_name,
        "game_type": "3D",
        "winning_number": winning_number,
    }
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            r = await client.post(
                f"{USER_BASE}/internal/draws",
                headers={"X-Internal-API-Key": settings.internal_api_key},
                json=payload,
            )
            r.raise_for_status()
            return r.json()
    except httpx.HTTPStatusError as e:
        try:
            detail = e.response.json().get("detail", e.response.text)
        except Exception:
            detail = e.response.text
        raise HTTPException(status_code=e.response.status_code, detail=detail)
    except httpx.HTTPError as e:
        logger.warning("Set 3D result failed: %s", e)
        raise HTTPException(status_code=502, detail="User backend unavailable")
