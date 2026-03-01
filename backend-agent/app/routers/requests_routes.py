"""Deposit, withdrawal, unit deposit requests."""
from datetime import datetime
from typing import Annotated
import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import get_current_user
from app.database import get_db
from app.models import User, UserBalance, DepositRequest, WithdrawalRequest, UnitDepositRequest, Transaction
from app.models.requests import DepositRequestStatus, WithdrawalRequestStatus
from app.models.transaction import TransactionType
from app.models.user import UserRole
from app.schemas.requests import (
    DepositRequestCreate,
    DepositRequestResponse,
    WithdrawalRequestCreate,
    WithdrawalRequestResponse,
    UnitDepositRequestCreate,
    UnitDepositRequestResponse,
)

router = APIRouter(prefix="/requests", tags=["requests"])


# ----- Deposit requests (player -> agent) -----
@router.post("/deposits", response_model=DepositRequestResponse)
async def create_deposit_request(
    data: DepositRequestCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current: Annotated[User, Depends(get_current_user)],
):
    req = DepositRequest(
        id=str(uuid.uuid4()),
        player_id=data.player_id,
        player_name=data.player_name,
        agent_id=data.agent_id,
        amount=data.amount,
        transaction_id=data.transaction_id,
        payment_method=data.payment_method,
        status=DepositRequestStatus.pending,
        note=data.note,
    )
    db.add(req)
    await db.flush()
    return DepositRequestResponse(
        id=req.id,
        player_id=req.player_id,
        player_name=req.player_name,
        agent_id=req.agent_id,
        amount=float(req.amount),
        transaction_id=req.transaction_id,
        payment_method=req.payment_method,
        status=req.status.value,
        requested_at=req.requested_at,
        note=req.note,
    )


@router.get("/deposits", response_model=list[DepositRequestResponse])
async def list_deposit_requests(
    agent_id: str | None = None,
    status: str | None = None,
    db: Annotated[AsyncSession, Depends(get_db)] = None,
    current: Annotated[User, Depends(get_current_user)] = None,
):
    q = select(DepositRequest)
    if agent_id:
        q = q.where(DepositRequest.agent_id == agent_id)
    if status:
        q = q.where(DepositRequest.status == status)
    q = q.order_by(DepositRequest.requested_at.desc())
    result = await db.execute(q)
    rows = result.scalars().all()
    return [
        DepositRequestResponse(
            id=r.id,
            player_id=r.player_id,
            player_name=r.player_name,
            agent_id=r.agent_id,
            amount=float(r.amount),
            transaction_id=r.transaction_id,
            payment_method=r.payment_method,
            status=r.status.value,
            requested_at=r.requested_at,
            note=r.note,
        )
        for r in rows
    ]


# ----- Withdrawal requests -----
@router.post("/withdrawals", response_model=WithdrawalRequestResponse)
async def create_withdrawal_request(
    data: WithdrawalRequestCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current: Annotated[User, Depends(get_current_user)],
):
    if current.role not in (UserRole.agent, UserRole.master):
        raise HTTPException(status_code=403, detail="Agents or masters only")
    to_user_id = None
    to_user_name = None
    if current.role == UserRole.agent:
        res = await db.execute(select(User).where(User.id == current.parent_id))
        parent = res.scalar_one_or_none()
        if not parent:
            raise HTTPException(status_code=400, detail="Parent master not found")
        to_user_id, to_user_name = parent.id, parent.name
    else:
        res = await db.execute(select(User).where(User.role == UserRole.admin).limit(1))
        admin = res.scalar_one_or_none()
        if not admin:
            raise HTTPException(status_code=400, detail="No admin found")
        to_user_id, to_user_name = admin.id, admin.name
    req = WithdrawalRequest(
        id=str(uuid.uuid4()),
        user_id=current.id,
        user_name=current.name,
        to_user_id=to_user_id,
        to_user_name=to_user_name,
        amount=data.amount,
        payment_method=data.payment_method,
        account_number=data.account_number,
        account_name=data.account_name,
        status=WithdrawalRequestStatus.pending,
        note=data.note,
    )
    db.add(req)
    await db.flush()
    return WithdrawalRequestResponse(
        id=req.id,
        user_id=req.user_id,
        user_name=req.user_name,
        to_user_id=req.to_user_id,
        amount=float(req.amount),
        payment_method=req.payment_method,
        account_number=req.account_number,
        account_name=req.account_name,
        status=req.status.value,
        requested_at=req.requested_at,
        note=req.note,
    )


@router.get("/withdrawals", response_model=list[WithdrawalRequestResponse])
async def list_withdrawal_requests(
    db: Annotated[AsyncSession, Depends(get_db)],
    current: Annotated[User, Depends(get_current_user)],
):
    result = await db.execute(
        select(WithdrawalRequest).order_by(WithdrawalRequest.requested_at.desc())
    )
    rows = result.scalars().all()
    return [
        WithdrawalRequestResponse(
            id=r.id,
            user_id=r.user_id,
            user_name=r.user_name,
            to_user_id=r.to_user_id,
            amount=float(r.amount),
            payment_method=r.payment_method,
            account_number=r.account_number,
            account_name=r.account_name,
            status=r.status.value,
            requested_at=r.requested_at,
            note=r.note,
        )
        for r in rows
    ]


# ----- Unit deposit requests (agent/master request units from upstream) -----
@router.post("/unit-deposits", response_model=UnitDepositRequestResponse)
async def create_unit_deposit_request(
    data: UnitDepositRequestCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current: Annotated[User, Depends(get_current_user)],
):
    if current.role not in (UserRole.agent, UserRole.master):
        raise HTTPException(status_code=403, detail="Agents or masters only")
    approver_id, approver_name = None, None
    if current.role == UserRole.agent:
        res = await db.execute(select(User).where(User.id == current.parent_id))
        parent = res.scalar_one_or_none()
        if not parent:
            raise HTTPException(status_code=400, detail="Parent master not found")
        approver_id, approver_name = parent.id, parent.name
    else:
        res = await db.execute(select(User).where(User.role == UserRole.admin).limit(1))
        admin = res.scalar_one_or_none()
        if not admin:
            raise HTTPException(status_code=400, detail="No admin found")
        approver_id, approver_name = admin.id, admin.name
    req = UnitDepositRequest(
        id=str(uuid.uuid4()),
        requester_id=current.id,
        requester_name=current.name,
        approver_id=approver_id,
        approver_name=approver_name,
        amount=data.amount,
        payment_method=data.payment_method,
        transaction_id=data.transaction_id,
        payment_screenshot=data.payment_screenshot,
        status="pending",
        note=data.note,
    )
    db.add(req)
    await db.flush()
    return UnitDepositRequestResponse(
        id=req.id,
        requester_id=req.requester_id,
        requester_name=req.requester_name,
        approver_id=req.approver_id,
        amount=float(req.amount),
        payment_method=req.payment_method,
        transaction_id=req.transaction_id,
        status=req.status,
        requested_at=req.requested_at,
        note=req.note,
    )


@router.get("/unit-deposits", response_model=list[UnitDepositRequestResponse])
async def list_unit_deposit_requests(
    db: Annotated[AsyncSession, Depends(get_db)],
    current: Annotated[User, Depends(get_current_user)],
):
    result = await db.execute(
        select(UnitDepositRequest).order_by(UnitDepositRequest.requested_at.desc())
    )
    rows = result.scalars().all()
    return [
        UnitDepositRequestResponse(
            id=r.id,
            requester_id=r.requester_id,
            requester_name=r.requester_name,
            approver_id=r.approver_id,
            amount=float(r.amount),
            payment_method=r.payment_method,
            transaction_id=r.transaction_id,
            status=r.status,
            requested_at=r.requested_at,
            note=r.note,
        )
        for r in rows
    ]


async def _get_or_create_balance(db: AsyncSession, user_id: str) -> UserBalance:
    result = await db.execute(select(UserBalance).where(UserBalance.user_id == user_id))
    row = result.scalar_one_or_none()
    if row:
        return row
    row = UserBalance(user_id=user_id, balance=0, locked_balance=0)
    db.add(row)
    await db.flush()
    return row


@router.post("/deposits/{request_id}/approve")
async def approve_deposit(
    request_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    current: Annotated[User, Depends(get_current_user)],
):
    result = await db.execute(select(DepositRequest).where(DepositRequest.id == request_id))
    req = result.scalar_one_or_none()
    if not req or req.status != DepositRequestStatus.pending:
        raise HTTPException(status_code=404, detail="Request not found or not pending")
    agent = await db.execute(select(User).where(User.id == req.agent_id))
    agent = agent.scalar_one_or_none()
    if current.role == UserRole.agent:
        raise HTTPException(status_code=403, detail="Agents cannot approve deposit requests")
    if current.role == UserRole.master and (not agent or agent.parent_id != current.id):
        raise HTTPException(status_code=403, detail="Not your agent")
    approver_bal = await _get_or_create_balance(db, current.id)
    agent_bal = await _get_or_create_balance(db, req.agent_id)
    amount = float(req.amount)
    if float(approver_bal.balance) < amount:
        raise HTTPException(status_code=400, detail="Insufficient balance")
    approver_before = float(approver_bal.balance)
    agent_before = float(agent_bal.balance)
    approver_bal.balance = approver_before - amount
    agent_bal.balance = agent_before + amount
    req.status = DepositRequestStatus.approved
    req.processed_at = datetime.utcnow()
    req.processed_by = current.id
    now = datetime.utcnow()
    agent_user = await db.execute(select(User).where(User.id == req.agent_id))
    agent_user = agent_user.scalar_one_or_none()
    agent_name = agent_user.name if agent_user else req.agent_id
    db.add(Transaction(id=str(uuid.uuid4()), user_id=current.id, type=TransactionType.deposit_approve, amount=-amount, balance_before=approver_before, balance_after=approver_before - amount, related_user_id=req.agent_id, related_user_name=agent_name, timestamp=now))
    db.add(Transaction(id=str(uuid.uuid4()), user_id=req.agent_id, type=TransactionType.transfer_in, amount=amount, balance_before=agent_before, balance_after=agent_before + amount, related_user_id=current.id, related_user_name=current.name, timestamp=now))
    return {"ok": True}


@router.post("/deposits/{request_id}/reject")
async def reject_deposit(request_id: str, db: Annotated[AsyncSession, Depends(get_db)], current: Annotated[User, Depends(get_current_user)]):
    result = await db.execute(select(DepositRequest).where(DepositRequest.id == request_id))
    req = result.scalar_one_or_none()
    if not req or req.status != DepositRequestStatus.pending:
        raise HTTPException(status_code=404, detail="Request not found or not pending")
    req.status = DepositRequestStatus.rejected
    req.processed_at = datetime.utcnow()
    req.processed_by = current.id
    return {"ok": True}


@router.post("/withdrawals/{request_id}/approve")
async def approve_withdrawal(
    request_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    current: Annotated[User, Depends(get_current_user)],
):
    result = await db.execute(select(WithdrawalRequest).where(WithdrawalRequest.id == request_id))
    req = result.scalar_one_or_none()
    if not req or req.status != WithdrawalRequestStatus.pending:
        raise HTTPException(status_code=404, detail="Request not found or not pending")
    if req.to_user_id != current.id:
        raise HTTPException(status_code=403, detail="You are not the approver")
    approver_bal = await _get_or_create_balance(db, current.id)
    requester_bal = await _get_or_create_balance(db, req.user_id)
    amount = float(req.amount)
    if float(approver_bal.balance) < amount:
        raise HTTPException(status_code=400, detail="Insufficient balance")
    abefore = float(approver_bal.balance)
    rbefore = float(requester_bal.balance)
    approver_bal.balance = abefore - amount
    requester_bal.balance = rbefore + amount
    req.status = WithdrawalRequestStatus.approved
    req.processed_at = datetime.utcnow()
    req.processed_by = current.id
    now = datetime.utcnow()
    db.add(Transaction(id=str(uuid.uuid4()), user_id=current.id, type=TransactionType.withdrawal_approve, amount=-amount, balance_before=abefore, balance_after=abefore - amount, related_user_id=req.user_id, related_user_name=req.user_name, timestamp=now))
    db.add(Transaction(id=str(uuid.uuid4()), user_id=req.user_id, type=TransactionType.transfer_in, amount=amount, balance_before=rbefore, balance_after=rbefore + amount, related_user_id=current.id, related_user_name=current.name, timestamp=now))
    return {"ok": True}


@router.post("/withdrawals/{request_id}/reject")
async def reject_withdrawal(request_id: str, db: Annotated[AsyncSession, Depends(get_db)], current: Annotated[User, Depends(get_current_user)]):
    result = await db.execute(select(WithdrawalRequest).where(WithdrawalRequest.id == request_id))
    req = result.scalar_one_or_none()
    if not req or req.status != WithdrawalRequestStatus.pending:
        raise HTTPException(status_code=404, detail="Request not found or not pending")
    req.status = WithdrawalRequestStatus.rejected
    req.processed_at = datetime.utcnow()
    req.processed_by = current.id
    return {"ok": True}


@router.post("/unit-deposits/{request_id}/approve")
async def approve_unit_deposit(
    request_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    current: Annotated[User, Depends(get_current_user)],
):
    result = await db.execute(select(UnitDepositRequest).where(UnitDepositRequest.id == request_id))
    req = result.scalar_one_or_none()
    if not req or req.status != "pending":
        raise HTTPException(status_code=404, detail="Request not found or not pending")
    if req.approver_id != current.id:
        raise HTTPException(status_code=403, detail="You are not the approver")
    approver_bal = await _get_or_create_balance(db, current.id)
    requester_bal = await _get_or_create_balance(db, req.requester_id)
    amount = float(req.amount)
    if float(approver_bal.balance) < amount:
        raise HTTPException(status_code=400, detail="Insufficient balance")
    abefore = float(approver_bal.balance)
    rbefore = float(requester_bal.balance)
    approver_bal.balance = abefore - amount
    requester_bal.balance = rbefore + amount
    req.status = "approved"
    req.processed_at = datetime.utcnow()
    req.processed_by = current.id
    now = datetime.utcnow()
    db.add(Transaction(id=str(uuid.uuid4()), user_id=current.id, type=TransactionType.unit_deposit_approve, amount=-amount, balance_before=abefore, balance_after=abefore - amount, related_user_id=req.requester_id, related_user_name=req.requester_name, timestamp=now))
    db.add(Transaction(id=str(uuid.uuid4()), user_id=req.requester_id, type=TransactionType.transfer_in, amount=amount, balance_before=rbefore, balance_after=rbefore + amount, related_user_id=current.id, related_user_name=current.name, timestamp=now))
    return {"ok": True}


@router.post("/unit-deposits/{request_id}/reject")
async def reject_unit_deposit(request_id: str, db: Annotated[AsyncSession, Depends(get_db)], current: Annotated[User, Depends(get_current_user)]):
    result = await db.execute(select(UnitDepositRequest).where(UnitDepositRequest.id == request_id))
    req = result.scalar_one_or_none()
    if not req or req.status != "pending":
        raise HTTPException(status_code=404, detail="Request not found or not pending")
    req.status = "rejected"
    req.processed_at = datetime.utcnow()
    req.processed_by = current.id
    return {"ok": True}
