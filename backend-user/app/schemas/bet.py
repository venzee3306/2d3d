from datetime import datetime
from pydantic import BaseModel


class BetCreate(BaseModel):
    session_id: str
    game_type: str  # 2D | 3D
    bet_number: str
    amount: float
    round_name: str  # Morning | Evening
    pattern_type: str | None = None
    pattern_input: str | None = None
    pattern_label: str | None = None


class BetItem(BaseModel):
    number: str
    amount: float
    pattern_type: str | None = None
    pattern_input: str | None = None
    pattern_label: str | None = None


class PlaceBetsRequest(BaseModel):
    session_id: str
    round_name: str
    bets: list[BetItem]
    game_type: str = "2D"


class BetResponse(BaseModel):
    id: str
    player_id: str
    session_id: str | None
    game_type: str
    bet_number: str
    amount: float
    round_name: str
    status: str
    win_amount: float | None
    placed_at: datetime

    class Config:
        from_attributes = True


# Payout multipliers (e.g. 2D: 85x, 3D: 500x)
PAYOUT_MULTIPLIER = {"2D": 85, "3D": 500}


class SettleBetsRequest(BaseModel):
    """Settle all pending bets for a round. Call after draw result is known."""
    session_id: str
    game_type: str  # 2D | 3D
    round_name: str  # Morning | Evening
    winning_number: str
