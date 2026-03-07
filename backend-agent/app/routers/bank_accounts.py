"""Bank accounts CRUD for agent/master/admin users."""
from typing import Annotated
import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import get_current_user
from app.database import get_db
from app.models import User, BankAccount
from app.models.user import UserRole
from app.schemas.bank_account import BankAccountCreate, BankAccountUpdate, BankAccountResponse

router = APIRouter(prefix="/bank-accounts", tags=["bank-accounts"])


def _to_response(b: BankAccount) -> BankAccountResponse:
    return BankAccountResponse(
        id=b.id,
        user_id=b.user_id,
        payment_method=b.payment_method,
        account_name=b.account_name,
        account_number=b.account_number,
        bank_name=b.bank_name,
        qr_code_url=b.qr_code_url,
        is_primary=b.is_primary,
        created_at=b.created_at.isoformat() if hasattr(b.created_at, "isoformat") else str(b.created_at),
    )


@router.get("", response_model=list[BankAccountResponse])
async def list_my_bank_accounts(
    db: Annotated[AsyncSession, Depends(get_db)],
    current: Annotated[User, Depends(get_current_user)],
):
    """List current user's bank accounts."""
    result = await db.execute(select(BankAccount).where(BankAccount.user_id == current.id).order_by(BankAccount.created_at))
    rows = result.scalars().all()
    return [_to_response(r) for r in rows]


@router.post("", response_model=BankAccountResponse)
async def create_bank_account(
    data: BankAccountCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current: Annotated[User, Depends(get_current_user)],
):
    """Add a bank account for the current user."""
    if data.is_primary:
        # Unset other primary accounts
        result = await db.execute(select(BankAccount).where(BankAccount.user_id == current.id))
        for row in result.scalars().all():
            row.is_primary = False
    acc = BankAccount(
        id=str(uuid.uuid4()),
        user_id=current.id,
        payment_method=data.payment_method,
        account_name=data.account_name,
        account_number=data.account_number,
        bank_name=data.bank_name,
        qr_code_url=data.qr_code_url,
        is_primary=data.is_primary,
    )
    db.add(acc)
    await db.flush()
    return _to_response(acc)


@router.patch("/{account_id}", response_model=BankAccountResponse)
async def update_bank_account(
    account_id: str,
    data: BankAccountUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current: Annotated[User, Depends(get_current_user)],
):
    """Update a bank account (must belong to current user)."""
    result = await db.execute(select(BankAccount).where(BankAccount.id == account_id, BankAccount.user_id == current.id))
    acc = result.scalar_one_or_none()
    if not acc:
        raise HTTPException(status_code=404, detail="Bank account not found")
    if data.payment_method is not None:
        acc.payment_method = data.payment_method
    if data.account_name is not None:
        acc.account_name = data.account_name
    if data.account_number is not None:
        acc.account_number = data.account_number
    if data.bank_name is not None:
        acc.bank_name = data.bank_name
    if data.qr_code_url is not None:
        acc.qr_code_url = data.qr_code_url
    if data.is_primary is True:
        # Unset other primary
        r2 = await db.execute(select(BankAccount).where(BankAccount.user_id == current.id, BankAccount.id != account_id))
        for row in r2.scalars().all():
            row.is_primary = False
        acc.is_primary = True
    elif data.is_primary is False:
        acc.is_primary = False
    return _to_response(acc)


@router.delete("/{account_id}")
async def delete_bank_account(
    account_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    current: Annotated[User, Depends(get_current_user)],
):
    """Delete a bank account (must belong to current user)."""
    result = await db.execute(select(BankAccount).where(BankAccount.id == account_id, BankAccount.user_id == current.id))
    acc = result.scalar_one_or_none()
    if not acc:
        raise HTTPException(status_code=404, detail="Bank account not found")
    await db.delete(acc)
    return {"ok": True}
