from pydantic import BaseModel


class BalanceResponse(BaseModel):
    user_id: str
    balance: float
    locked_balance: float = 0


class BalanceUpdate(BaseModel):
    balance: float | None = None
    locked_balance: float | None = None


class TransferRequest(BaseModel):
    to_user_id: str
    amount: float
    note: str | None = None


class CreateUnitsRequest(BaseModel):
    user_id: str
    amount: float
    note: str | None = None
