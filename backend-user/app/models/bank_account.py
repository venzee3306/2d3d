"""Player bank account for cash out."""
from sqlalchemy import String, ForeignKey, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime

from app.database import Base


class BankAccount(Base):
    __tablename__ = "bank_accounts"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    player_id: Mapped[str] = mapped_column(String(64), ForeignKey("players.id"), nullable=False, index=True)
    payment_method: Mapped[str] = mapped_column(String(32), nullable=False)
    account_name: Mapped[str] = mapped_column(String(255), nullable=False)
    account_number: Mapped[str] = mapped_column(String(64), nullable=False)
    bank_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_default: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
