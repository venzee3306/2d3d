from pydantic import BaseModel


class BankAccountCreate(BaseModel):
    payment_method: str
    account_name: str
    account_number: str
    bank_name: str | None = None
    qr_code_url: str | None = None
    is_primary: bool = False


class BankAccountUpdate(BaseModel):
    payment_method: str | None = None
    account_name: str | None = None
    account_number: str | None = None
    bank_name: str | None = None
    qr_code_url: str | None = None
    is_primary: bool | None = None


class BankAccountResponse(BaseModel):
    id: str
    user_id: str
    payment_method: str
    account_name: str
    account_number: str
    bank_name: str | None
    qr_code_url: str | None
    is_primary: bool
    created_at: str
