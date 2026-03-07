"""Schemas for player deposit (top-up) requests."""
from datetime import datetime
from pydantic import BaseModel


class DepositRequestCreate(BaseModel):
    """Player creates a top-up request (pay agent, then request credit)."""
    amount: float
    transaction_id: str
    payment_method: str
    note: str | None = None
    payment_screenshot: str | None = None  # optional base64; stored in agent backend if needed


class DepositRequestResponse(BaseModel):
    id: str
    player_id: str
    player_name: str
    agent_id: str
    amount: float
    transaction_id: str
    payment_method: str | None
    status: str
    requested_at: datetime
    processed_at: datetime | None = None
    note: str | None = None

    class Config:
        from_attributes = True
