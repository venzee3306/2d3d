"""Payout rates for 2D/3D lottery."""
from fastapi import APIRouter
from app.schemas.bet import PAYOUT_MULTIPLIER

router = APIRouter(prefix="/payout-rates", tags=["payout-rates"])


@router.get("")
async def get_payout_rates():
    """Return payout multipliers for 2D and 3D. Public endpoint."""
    return PAYOUT_MULTIPLIER
