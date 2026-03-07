"""Internal sync API: called by User Onboarding Backend (X-Internal-API-Key)."""
from datetime import datetime
from typing import Annotated
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import require_internal_api_key
from app.database import get_db
from app.models import User, UserBalance, PlayerSnapshot, BlockedNumber, DepositRequest, PlayerWithdrawalRequest, BankAccount
from app.models.requests import DepositRequestStatus
from app.models.user import UserRole
from app.schemas.sync import PlayerSyncPayload, AgentLimitResponse

router = APIRouter(prefix="/internal", tags=["internal"])


class InternalPlayerWithdrawalCreate(BaseModel):
    """Create a player withdrawal request (cash out). Called by User Backend."""
    player_id: str
    player_name: str
    agent_id: str
    amount: float
    payment_method: str
    account_number: str
    account_name: str
    note: str | None = None


class InternalDepositRequestCreate(BaseModel):
    """Create a player deposit request (called by User Backend when player requests top-up)."""
    player_id: str
    player_name: str
    agent_id: str
    amount: float
    transaction_id: str
    payment_method: str | None = None
    note: str | None = None


@router.post("/players")
async def register_player(
    data: PlayerSyncPayload,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[None, Depends(require_internal_api_key)],
):
    """Upsert player snapshot (idempotent). Called by User Backend when player is created/updated."""
    from datetime import datetime
    result = await db.execute(
        select(PlayerSnapshot).where(
            PlayerSnapshot.player_id == data.player_id,
            PlayerSnapshot.agent_id == data.agent_id,
        )
    )
    existing = result.scalar_one_or_none()
    if existing:
        existing.name = data.name
        existing.phone_number = data.phone_number
        existing.current_balance = data.current_balance
        existing.total_bets = data.total_bets
        existing.total_amount = data.total_amount
        existing.win_amount = data.win_amount
        existing.loss_amount = data.loss_amount
        existing.status = data.status
        existing.last_bet_at = data.last_bet_at
        existing.updated_at = datetime.utcnow()
    else:
        db.add(
            PlayerSnapshot(
                player_id=data.player_id,
                agent_id=data.agent_id,
                name=data.name,
                phone_number=data.phone_number,
                current_balance=data.current_balance,
                total_bets=data.total_bets,
                total_amount=data.total_amount,
                win_amount=data.win_amount,
                loss_amount=data.loss_amount,
                status=data.status,
                last_bet_at=data.last_bet_at,
            )
        )
    return {"ok": True}


@router.get("/agents", response_model=list[AgentLimitResponse])
async def list_agents_for_sync(
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[None, Depends(require_internal_api_key)],
):
    """List all agents with credit limit and blocked numbers (for User Backend)."""
    result = await db.execute(select(User).where(User.role == UserRole.agent))
    agents = list(result.scalars().all())
    out = []
    for a in agents:
        bal = await db.execute(select(UserBalance).where(UserBalance.user_id == a.id))
        b = bal.scalar_one_or_none()
        credit = float(b.balance) if b else 0
        blocked = await db.execute(select(BlockedNumber).where(BlockedNumber.agent_id == a.id))
        blocks = blocked.scalars().all()
        bn_2d = [x.number for x in blocks if x.game_type == "2D"]
        bn_3d = [x.number for x in blocks if x.game_type == "3D"]
        out.append(
            AgentLimitResponse(
                agent_id=a.id,
                credit_limit=credit,
                blocked_numbers_2d=bn_2d,
                blocked_numbers_3d=bn_3d,
            )
        )
    return out


@router.get("/agents/{agent_id}/limits", response_model=AgentLimitResponse)
async def get_agent_limits(
    agent_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[None, Depends(require_internal_api_key)],
):
    """Get one agent's limits and blocked numbers."""
    result = await db.execute(
        select(User).where(User.id == agent_id, User.role == UserRole.agent)
    )
    agent = result.scalar_one_or_none()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    bal = await db.execute(select(UserBalance).where(UserBalance.user_id == agent_id))
    b = bal.scalar_one_or_none()
    credit = float(b.balance) if b else 0
    blocked = await db.execute(select(BlockedNumber).where(BlockedNumber.agent_id == agent_id))
    blocks = blocked.scalars().all()
    bn_2d = [x.number for x in blocks if x.game_type == "2D"]
    bn_3d = [x.number for x in blocks if x.game_type == "3D"]
    return AgentLimitResponse(
        agent_id=agent_id,
        credit_limit=credit,
        blocked_numbers_2d=bn_2d,
        blocked_numbers_3d=bn_3d,
    )


# ----- Internal deposit requests (User Backend creates/lists on behalf of player) -----


def _deposit_request_to_dict(r: DepositRequest) -> dict:
    return {
        "id": r.id,
        "player_id": r.player_id,
        "player_name": r.player_name,
        "agent_id": r.agent_id,
        "amount": float(r.amount),
        "transaction_id": r.transaction_id,
        "payment_method": r.payment_method,
        "status": r.status.value,
        "requested_at": r.requested_at.isoformat() if isinstance(r.requested_at, datetime) else r.requested_at,
        "processed_at": r.processed_at.isoformat() if r.processed_at else None,
        "note": r.note,
    }


@router.post("/deposit-requests")
async def internal_create_deposit_request(
    data: InternalDepositRequestCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[None, Depends(require_internal_api_key)],
):
    """Create a player deposit request. Called by User Backend when player submits top-up."""
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
    return _deposit_request_to_dict(req)


@router.post("/player-withdrawals")
async def internal_create_player_withdrawal(
    data: InternalPlayerWithdrawalCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[None, Depends(require_internal_api_key)],
):
    """Create a player cash-out request. Called by User Backend."""
    req = PlayerWithdrawalRequest(
        id=str(uuid.uuid4()),
        player_id=data.player_id,
        player_name=data.player_name,
        agent_id=data.agent_id,
        amount=data.amount,
        payment_method=data.payment_method,
        account_number=data.account_number,
        account_name=data.account_name,
        note=data.note,
        status="pending",
    )
    db.add(req)
    await db.flush()
    return {
        "id": req.id,
        "player_id": req.player_id,
        "player_name": req.player_name,
        "agent_id": req.agent_id,
        "amount": float(req.amount),
        "payment_method": req.payment_method,
        "account_number": req.account_number,
        "account_name": req.account_name,
        "status": req.status,
        "requested_at": req.requested_at.isoformat() if isinstance(req.requested_at, datetime) else str(req.requested_at),
        "note": req.note,
    }


@router.get("/player-withdrawals")
async def internal_list_player_withdrawals(
    player_id: str | None = Query(None, description="Filter by player_id"),
    db: Annotated[AsyncSession, Depends(get_db)] = None,
    _: Annotated[None, Depends(require_internal_api_key)] = None,
) -> list[dict]:
    """List player withdrawal requests, optionally by player_id."""
    q = select(PlayerWithdrawalRequest).order_by(PlayerWithdrawalRequest.requested_at.desc())
    if player_id:
        q = q.where(PlayerWithdrawalRequest.player_id == player_id)
    result = await db.execute(q)
    rows = result.scalars().all()
    return [
        {
            "id": r.id,
            "player_id": r.player_id,
            "player_name": r.player_name,
            "agent_id": r.agent_id,
            "amount": float(r.amount),
            "payment_method": r.payment_method,
            "account_number": r.account_number,
            "account_name": r.account_name,
            "status": r.status,
            "requested_at": r.requested_at.isoformat() if isinstance(r.requested_at, datetime) else str(r.requested_at),
            "processed_at": r.processed_at.isoformat() if r.processed_at else None,
            "note": r.note,
            "rejection_reason": r.rejection_reason,
        }
        for r in rows
    ]


@router.get("/agents/{agent_id}/bank-accounts")
async def internal_list_agent_bank_accounts(
    agent_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[None, Depends(require_internal_api_key)],
) -> list[dict]:
    """List bank accounts for an agent (for User Backend to show player where to send deposit)."""
    result = await db.execute(
        select(BankAccount).where(BankAccount.user_id == agent_id).order_by(BankAccount.created_at)
    )
    rows = result.scalars().all()
    return [
        {
            "id": r.id,
            "payment_method": r.payment_method,
            "account_name": r.account_name,
            "account_number": r.account_number,
            "bank_name": r.bank_name,
            "qr_code_url": r.qr_code_url,
            "is_primary": r.is_primary,
        }
        for r in rows
    ]


@router.get("/deposit-requests")
async def internal_list_deposit_requests(
    player_id: str | None = Query(None, description="Filter by player_id"),
    db: Annotated[AsyncSession, Depends(get_db)] = None,
    _: Annotated[None, Depends(require_internal_api_key)] = None,
) -> list[dict]:
    """List deposit requests, optionally by player_id. Called by User Backend for player's list."""
    q = select(DepositRequest).order_by(DepositRequest.requested_at.desc())
    if player_id:
        q = q.where(DepositRequest.player_id == player_id)
    result = await db.execute(q)
    rows = result.scalars().all()
    return [_deposit_request_to_dict(r) for r in rows]
