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


class UserUpdate(BaseModel):
    name: str | None = None
    username: str | None = None
    password: str | None = None
    role: UserRole | None = None
    parent_id: str | None = None


class MeUpdate(BaseModel):
    """Update own profile. If new_password is set, current_password is required."""
    name: str | None = None
    current_password: str | None = None
    new_password: str | None = None


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class UserResponse(UserBase):
    id: str

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
