from sqlalchemy import String, Numeric, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime

from app.database import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    player_id: Mapped[str] = mapped_column(String(64), ForeignKey("players.id"), nullable=False, index=True)
    type: Mapped[str] = mapped_column(String(32), nullable=False)  # deposit | bet | win | loss
    amount: Mapped[float] = mapped_column(Numeric(18, 2), nullable=False)
    balance_after: Mapped[float] = mapped_column(Numeric(18, 2), nullable=False)
    description: Mapped[str] = mapped_column(String(255), nullable=True)
    related_bet_id: Mapped[str | None] = mapped_column(String(64), nullable=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
