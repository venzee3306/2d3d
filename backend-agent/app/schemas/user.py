from datetime import datetime
from pydantic import BaseModel
from app.models.user import UserRole


class UserBase(BaseModel):
    name: str
    username: str
    role: UserRole
    parent_id: str | None = None


class UserCreate(UserBase):
    password: str
    commission_rate: float | None = None
    total_bet_limit: float | None = None
    single_number_limit: float | None = None
    payout_2d: int | None = None
    payout_3d: int | None = None


class UserUpdate(BaseModel):
    name: str | None = None
    username: str | None = None
    password: str | None = None
    role: UserRole | None = None
    parent_id: str | None = None
    commission_rate: float | None = None
    total_bet_limit: float | None = None
    single_number_limit: float | None = None
    payout_2d: int | None = None
    payout_3d: int | None = None


class MeUpdate(BaseModel):
    """Update own profile. If new_password is set, current_password is required."""
    name: str | None = None
    current_password: str | None = None
    new_password: str | None = None


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class UserResponse(BaseModel):
    id: str
    name: str
    username: str
    role: UserRole
    parent_id: str | None = None
    commission_rate: float | None = None
    total_bet_limit: float | None = None
    single_number_limit: float | None = None
    payout_2d: int | None = None
    payout_3d: int | None = None

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
    refresh_token: str | None = None
    refresh_expires_at: datetime | None = None


class LoginResponse(BaseModel):
    """Response when using secure cookies: no tokens in body."""
    user: UserResponse
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str


class RefreshResponse(BaseModel):
    access_token: str | None = None
    token_type: str = "bearer"
