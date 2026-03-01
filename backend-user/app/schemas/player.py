from datetime import datetime
from pydantic import BaseModel


class PlayerCreate(BaseModel):
    name: str
    username: str
    password: str
    phone_number: str | None = None
    agent_id: str
    source: str = "portal"
    platform_id: str | None = None


class PlayerLogin(BaseModel):
    username: str
    password: str


class PlayerResponse(BaseModel):
    id: str
    name: str
    username: str
    phone_number: str | None
    balance: float
    agent_id: str
    source: str
    platform_id: str | None
    status: str
    created_at: datetime
    total_bets: int
    total_amount: float
    win_amount: float
    loss_amount: float
    last_bet_at: datetime | None

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    """Legacy: tokens in body (when not using secure cookies)."""
    access_token: str
    token_type: str = "bearer"
    player: PlayerResponse
    refresh_token: str | None = None
    refresh_expires_at: datetime | None = None


class LoginResponse(BaseModel):
    """Response when using secure cookies: no tokens in body (tokens in HttpOnly cookies)."""
    player: PlayerResponse
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str  # optional when using cookie; server reads from cookie


class RefreshResponse(BaseModel):
    """When using cookies, access_token is set in cookie; body can be empty or this."""
    access_token: str | None = None  # None when using cookies
    token_type: str = "bearer"
