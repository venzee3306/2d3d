from sqlalchemy import String, Numeric, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime

from app.database import Base


class Player(Base):
    __tablename__ = "players"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    username: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    phone_number: Mapped[str] = mapped_column(String(32), nullable=True)
    balance: Mapped[float] = mapped_column(Numeric(18, 2), default=0, nullable=False)
    agent_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    source: Mapped[str] = mapped_column(String(32), default="portal")  # portal | api
    platform_id: Mapped[str | None] = mapped_column(String(64), nullable=True, index=True)
    status: Mapped[str] = mapped_column(String(32), default="active")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    # Denormalized for sync to Agent Backend
    total_bets: Mapped[int] = mapped_column(default=0)
    total_amount: Mapped[float] = mapped_column(Numeric(18, 2), default=0)
    win_amount: Mapped[float] = mapped_column(Numeric(18, 2), default=0)
    loss_amount: Mapped[float] = mapped_column(Numeric(18, 2), default=0)
    last_bet_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
