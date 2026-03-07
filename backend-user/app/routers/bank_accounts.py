"""Player bank accounts CRUD."""
from typing import Annotated
import uuid

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import get_current_player
from app.database import get_db
from app.models import Player, BankAccount

router = APIRouter(prefix="/players/me/bank-accounts", tags=["bank-accounts"])


class BankAccountCreate(BaseModel):
    payment_method: str
    account_name: str
    account_number: str
    bank_name: str | None = None
    is_default: bool = False


class BankAccountUpdate(BaseModel):
    payment_method: str | None = None
    account_name: str | None = None
    account_number: str | None = None
    bank_name: str | None = None
    is_default: bool | None = None


@router.get("")
async def list_my_bank_accounts(
    db: Annotated[AsyncSession, Depends(get_db)],
    current: Annotated[Player, Depends(get_current_player)],
):
    """List current player's bank accounts."""
    result = await db.execute(
        select(BankAccount).where(BankAccount.player_id == current.id).order_by(BankAccount.created_at)
    )
    rows = result.scalars().all()
    return [
        {
            "id": r.id,
            "player_id": r.player_id,
            "payment_method": r.payment_method,
            "account_name": r.account_name,
            "account_number": r.account_number,
            "bank_name": r.bank_name,
            "is_default": r.is_default,
            "created_at": r.created_at.isoformat() if hasattr(r.created_at, "isoformat") else str(r.created_at),
        }
        for r in rows
    ]


@router.post("")
async def create_bank_account(
    data: BankAccountCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current: Annotated[Player, Depends(get_current_player)],
):
    """Add a bank account for the current player."""
    if data.is_default:
        result = await db.execute(select(BankAccount).where(BankAccount.player_id == current.id))
        for row in result.scalars().all():
            row.is_default = False
    acc = BankAccount(
        id=str(uuid.uuid4()),
        player_id=current.id,
        payment_method=data.payment_method,
        account_name=data.account_name,
        account_number=data.account_number,
        bank_name=data.bank_name,
        is_default=data.is_default,
    )
    db.add(acc)
    await db.flush()
    return {
        "id": acc.id,
        "player_id": acc.player_id,
        "payment_method": acc.payment_method,
        "account_name": acc.account_name,
        "account_number": acc.account_number,
        "bank_name": acc.bank_name,
        "is_default": acc.is_default,
        "created_at": acc.created_at.isoformat() if hasattr(acc.created_at, "isoformat") else str(acc.created_at),
    }


@router.patch("/{account_id}")
async def update_bank_account(
    account_id: str,
    data: BankAccountUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current: Annotated[Player, Depends(get_current_player)],
):
    """Update a bank account (must belong to current player)."""
    result = await db.execute(
        select(BankAccount).where(BankAccount.id == account_id, BankAccount.player_id == current.id)
    )
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
    if data.is_default is True:
        r2 = await db.execute(
            select(BankAccount).where(BankAccount.player_id == current.id, BankAccount.id != account_id)
        )
        for row in r2.scalars().all():
            row.is_default = False
        acc.is_default = True
    elif data.is_default is False:
        acc.is_default = False
    return {
        "id": acc.id,
        "player_id": acc.player_id,
        "payment_method": acc.payment_method,
        "account_name": acc.account_name,
        "account_number": acc.account_number,
        "bank_name": acc.bank_name,
        "is_default": acc.is_default,
        "created_at": acc.created_at.isoformat() if hasattr(acc.created_at, "isoformat") else str(acc.created_at),
    }


@router.delete("/{account_id}")
async def delete_bank_account(
    account_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    current: Annotated[Player, Depends(get_current_player)],
):
    """Delete a bank account (must belong to current player)."""
    result = await db.execute(
        select(BankAccount).where(BankAccount.id == account_id, BankAccount.player_id == current.id)
    )
    acc = result.scalar_one_or_none()
    if not acc:
        raise HTTPException(status_code=404, detail="Bank account not found")
    await db.delete(acc)
    return {"ok": True}
