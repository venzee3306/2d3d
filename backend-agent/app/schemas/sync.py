"""Schemas for internal sync API (User Backend -> Agent Backend)."""
from datetime import datetime
from pydantic import BaseModel


class PlayerSyncPayload(BaseModel):
    """Upsert player snapshot (idempotent by player_id + agent_id)."""
    player_id: str
    agent_id: str
    name: str
    phone_number: str | None = None
    current_balance: float = 0
    total_bets: int = 0
    total_amount: float = 0
    win_amount: float = 0
    loss_amount: float = 0
    status: str = "active"
    last_bet_at: datetime | None = None


class AgentLimitResponse(BaseModel):
    """Agent info for User Backend (credit limit, blocked numbers)."""
    agent_id: str
    credit_limit: float = 0
    blocked_numbers_2d: list[str] = []
    blocked_numbers_3d: list[str] = []
