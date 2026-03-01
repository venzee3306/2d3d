"""Synced from User Onboarding Backend: players under each agent (for dashboard display)."""
from sqlalchemy import String, Numeric, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime

from app.database import Base


class PlayerSnapshot(Base):
    __tablename__ = "player_snapshots"

    player_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    agent_id: Mapped[str] = mapped_column(String(64), ForeignKey("users.id"), primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    phone_number: Mapped[str | None] = mapped_column(String(32), nullable=True)
    current_balance: Mapped[float] = mapped_column(Numeric(18, 2), default=0)
    total_bets: Mapped[int] = mapped_column(default=0)
    total_amount: Mapped[float] = mapped_column(Numeric(18, 2), default=0)
    win_amount: Mapped[float] = mapped_column(Numeric(18, 2), default=0)
    loss_amount: Mapped[float] = mapped_column(Numeric(18, 2), default=0)
    status: Mapped[str] = mapped_column(String(32), default="active")
    last_bet_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
