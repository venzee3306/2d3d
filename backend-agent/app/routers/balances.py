from datetime import datetime
from typing import Annotated
import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import get_current_user
from app.database import get_db
from app.models import User, UserBalance, Transaction
from app.models.transaction import TransactionType
from app.models.user import UserRole
from app.schemas.balance import BalanceResponse, TransferRequest, CreateUnitsRequest

router = APIRouter(prefix="/balances", tags=["balances"])


async def _get_or_create_balance(db: AsyncSession, user_id: str) -> UserBalance:
    result = await db.execute(select(UserBalance).where(UserBalance.user_id == user_id))
    row = result.scalar_one_or_none()
    if row:
        return row
    row = UserBalance(user_id=user_id, balance=0, locked_balance=0)
    db.add(row)
    await db.flush()
    return row


@router.get("/me", response_model=BalanceResponse)
async def my_balance(
    db: Annotated[AsyncSession, Depends(get_db)],
    current: Annotated[User, Depends(get_current_user)],
):
    row = await _get_or_create_balance(db, current.id)
    return BalanceResponse(user_id=row.user_id, balance=float(row.balance), locked_balance=float(row.locked_balance))


@router.get("/{user_id}", response_model=BalanceResponse)
async def get_balance(
    user_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    current: Annotated[User, Depends(get_current_user)],
):
    row = await _get_or_create_balance(db, user_id)
    return BalanceResponse(user_id=row.user_id, balance=float(row.balance), locked_balance=float(row.locked_balance))


@router.post("/transfer")
async def transfer(
    data: TransferRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    current: Annotated[User, Depends(get_current_user)],
):
    if data.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")
    from_bal = await _get_or_create_balance(db, current.id)
    if float(from_bal.balance) < data.amount:
        raise HTTPException(status_code=400, detail="Insufficient balance")
    to_user = await db.execute(select(User).where(User.id == data.to_user_id))
    to_user = to_user.scalar_one_or_none()
    if not to_user:
        raise HTTPException(status_code=404, detail="Target user not found")
    to_bal = await _get_or_create_balance(db, data.to_user_id)
    from_before = float(from_bal.balance)
    to_before = float(to_bal.balance)
    from_bal.balance = from_before - data.amount
    to_bal.balance = to_before + data.amount
    now = datetime.utcnow()
    for tid, uid, typ, amt, before, after, rel_id, rel_name in [
        (uuid.uuid4(), current.id, TransactionType.transfer_out, -data.amount, from_before, from_before - data.amount, to_user.id, to_user.name),
        (uuid.uuid4(), to_user.id, TransactionType.transfer_in, data.amount, to_before, to_before + data.amount, current.id, current.name),
    ]:
        db.add(Transaction(id=str(tid), user_id=uid, type=typ, amount=amt, balance_before=before, balance_after=after, related_user_id=rel_id, related_user_name=rel_name, note=data.note, timestamp=now))
    return {"ok": True, "from_balance": float(from_bal.balance), "to_balance": float(to_bal.balance)}


@router.post("/create-units")
async def create_units(
    data: CreateUnitsRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    current: Annotated[User, Depends(get_current_user)],
):
    if current.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Admin only")
    if data.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")
    target = await _get_or_create_balance(db, data.user_id)
    before = float(target.balance)
    target.balance = before + data.amount
    db.add(Transaction(id=str(uuid.uuid4()), user_id=data.user_id, type=TransactionType.admin_create, amount=data.amount, balance_before=before, balance_after=before + data.amount, note=data.note, timestamp=datetime.utcnow()))
    return {"ok": True, "balance": float(target.balance)}
