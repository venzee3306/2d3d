from datetime import datetime
from pydantic import BaseModel


class DepositRequestCreate(BaseModel):
    player_id: str
    player_name: str
    agent_id: str
    amount: float
    transaction_id: str
    payment_method: str | None = None
    note: str | None = None


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
    note: str | None

    class Config:
        from_attributes = True


class WithdrawalRequestCreate(BaseModel):
    amount: float
    payment_method: str
    account_number: str
    account_name: str
    note: str | None = None


class WithdrawalRequestResponse(BaseModel):
    id: str
    user_id: str
    user_name: str
    to_user_id: str
    amount: float
    payment_method: str
    account_number: str
    account_name: str
    status: str
    requested_at: datetime
    note: str | None

    class Config:
        from_attributes = True


class UnitDepositRequestCreate(BaseModel):
    amount: float
    payment_method: str
    transaction_id: str
    payment_screenshot: str | None = None
    note: str | None = None


class UnitDepositRequestResponse(BaseModel):
    id: str
    requester_id: str
    requester_name: str
    approver_id: str
    amount: float
    payment_method: str
    transaction_id: str
    status: str
    requested_at: datetime
    note: str | None

    class Config:
        from_attributes = True
