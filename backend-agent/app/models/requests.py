from sqlalchemy import String, Numeric, ForeignKey, DateTime, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime
import enum
import uuid

from app.database import Base


def _new_id() -> str:
    return str(uuid.uuid4())


class DepositRequestStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class DepositRequest(Base):
    """Player deposit request (player adds balance via agent)."""
    __tablename__ = "deposit_requests"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    player_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    player_name: Mapped[str] = mapped_column(String(255), nullable=False)
    agent_id: Mapped[str] = mapped_column(String(64), ForeignKey("users.id"), nullable=False, index=True)
    amount: Mapped[float] = mapped_column(Numeric(18, 2), nullable=False)
    transaction_id: Mapped[str] = mapped_column(String(255), nullable=False)  # payment gateway ref
    payment_method: Mapped[str | None] = mapped_column(String(64), nullable=True)
    status: Mapped[DepositRequestStatus] = mapped_column(SQLEnum(DepositRequestStatus), default=DepositRequestStatus.pending)
    requested_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    processed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    processed_by: Mapped[str | None] = mapped_column(String(64), nullable=True)
    note: Mapped[str | None] = mapped_column(String(512), nullable=True)


class WithdrawalRequestStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class WithdrawalRequest(Base):
    __tablename__ = "withdrawal_requests"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    user_id: Mapped[str] = mapped_column(String(64), ForeignKey("users.id"), nullable=False, index=True)
    user_name: Mapped[str] = mapped_column(String(255), nullable=False)
    to_user_id: Mapped[str] = mapped_column(String(64), ForeignKey("users.id"), nullable=False)
    to_user_name: Mapped[str] = mapped_column(String(255), nullable=False)
    amount: Mapped[float] = mapped_column(Numeric(18, 2), nullable=False)
    payment_method: Mapped[str] = mapped_column(String(64), nullable=False)
    account_number: Mapped[str] = mapped_column(String(64), nullable=False)
    account_name: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[WithdrawalRequestStatus] = mapped_column(SQLEnum(WithdrawalRequestStatus), default=WithdrawalRequestStatus.pending)
    requested_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    processed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    processed_by: Mapped[str | None] = mapped_column(String(64), nullable=True)
    note: Mapped[str | None] = mapped_column(String(512), nullable=True)
    rejection_reason: Mapped[str | None] = mapped_column(String(512), nullable=True)


class PlayerWithdrawalRequest(Base):
    """Player cash-out request (player withdraws from agent)."""
    __tablename__ = "player_withdrawal_requests"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    player_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    player_name: Mapped[str] = mapped_column(String(255), nullable=False)
    agent_id: Mapped[str] = mapped_column(String(64), ForeignKey("users.id"), nullable=False, index=True)
    amount: Mapped[float] = mapped_column(Numeric(18, 2), nullable=False)
    payment_method: Mapped[str] = mapped_column(String(64), nullable=False)
    account_number: Mapped[str] = mapped_column(String(64), nullable=False)
    account_name: Mapped[str] = mapped_column(String(255), nullable=False)
    note: Mapped[str | None] = mapped_column(String(512), nullable=True)
    status: Mapped[str] = mapped_column(String(32), default="pending")
    requested_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    processed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    processed_by: Mapped[str | None] = mapped_column(String(64), nullable=True)
    rejection_reason: Mapped[str | None] = mapped_column(String(512), nullable=True)


class UnitDepositRequest(Base):
    """Agent/Master requests units from upstream."""
    __tablename__ = "unit_deposit_requests"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    requester_id: Mapped[str] = mapped_column(String(64), ForeignKey("users.id"), nullable=False, index=True)
    requester_name: Mapped[str] = mapped_column(String(255), nullable=False)
    approver_id: Mapped[str] = mapped_column(String(64), ForeignKey("users.id"), nullable=False)
    approver_name: Mapped[str] = mapped_column(String(255), nullable=False)
    amount: Mapped[float] = mapped_column(Numeric(18, 2), nullable=False)
    payment_method: Mapped[str] = mapped_column(String(64), nullable=False)
    transaction_id: Mapped[str] = mapped_column(String(255), nullable=False)
    payment_screenshot: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    status: Mapped[str] = mapped_column(String(32), default="pending")  # pending, approved, rejected
    requested_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    processed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    processed_by: Mapped[str | None] = mapped_column(String(64), nullable=True)
    note: Mapped[str | None] = mapped_column(String(512), nullable=True)
    rejection_reason: Mapped[str | None] = mapped_column(String(512), nullable=True)
