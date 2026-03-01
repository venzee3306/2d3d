from sqlalchemy import String, Numeric, ForeignKey, DateTime, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime
import enum

from app.database import Base


class TransactionType(str, enum.Enum):
    transfer_in = "transfer_in"
    transfer_out = "transfer_out"
    deposit_approve = "deposit_approve"
    deposit_request = "deposit_request"
    withdrawal_approve = "withdrawal_approve"
    withdrawal_request = "withdrawal_request"
    unit_deposit_approve = "unit_deposit_approve"
    unit_deposit_request = "unit_deposit_request"
    admin_create = "admin_create"


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    user_id: Mapped[str] = mapped_column(String(64), ForeignKey("users.id"), nullable=False, index=True)
    type: Mapped[TransactionType] = mapped_column(SQLEnum(TransactionType), nullable=False)
    amount: Mapped[float] = mapped_column(Numeric(18, 2), nullable=False)
    balance_before: Mapped[float] = mapped_column(Numeric(18, 2), nullable=False)
    balance_after: Mapped[float] = mapped_column(Numeric(18, 2), nullable=False)
    related_user_id: Mapped[str | None] = mapped_column(String(64), nullable=True)
    related_user_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    note: Mapped[str | None] = mapped_column(String(512), nullable=True)
