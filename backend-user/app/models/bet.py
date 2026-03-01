from sqlalchemy import String, Numeric, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime

from app.database import Base


class Bet(Base):
    __tablename__ = "bets"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    player_id: Mapped[str] = mapped_column(String(64), ForeignKey("players.id"), nullable=False, index=True)
    session_id: Mapped[str] = mapped_column(String(64), ForeignKey("sessions.id"), nullable=True, index=True)
    game_type: Mapped[str] = mapped_column(String(8), nullable=False)  # 2D | 3D
    bet_number: Mapped[str] = mapped_column(String(32), nullable=False)
    amount: Mapped[float] = mapped_column(Numeric(18, 2), nullable=False)
    round_name: Mapped[str] = mapped_column(String(32), nullable=False)
    status: Mapped[str] = mapped_column(String(32), default="Pending")  # Pending | Won | Lost
    win_amount: Mapped[float | None] = mapped_column(Numeric(18, 2), nullable=True)
    placed_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    pattern_type: Mapped[str | None] = mapped_column(String(64), nullable=True)
    pattern_input: Mapped[str | None] = mapped_column(String(128), nullable=True)
    pattern_label: Mapped[str | None] = mapped_column(String(255), nullable=True)
