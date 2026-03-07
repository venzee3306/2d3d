"""Bank account for agent/master/admin users (for receiving payments, QR codes)."""
from sqlalchemy import String, ForeignKey, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime

from app.database import Base


class BankAccount(Base):
    __tablename__ = "bank_accounts"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    user_id: Mapped[str] = mapped_column(String(64), ForeignKey("users.id"), nullable=False, index=True)
    payment_method: Mapped[str] = mapped_column(String(32), nullable=False)  # kpay, wavepay, cbpay, ayapay, onepay, bank
    account_name: Mapped[str] = mapped_column(String(255), nullable=False)
    account_number: Mapped[str] = mapped_column(String(64), nullable=False)
    bank_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    qr_code_url: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
