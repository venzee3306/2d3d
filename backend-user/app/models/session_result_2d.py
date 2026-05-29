"""2D session results (12:01 PM and 4:30 PM) stored for history. Filled by scheduler from live 2DBoss API."""
from datetime import date, datetime

from sqlalchemy import Date, DateTime, Float, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class SessionResult2D(Base):
    __tablename__ = "session_results_2d"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    slot: Mapped[str] = mapped_column(String(10), nullable=False)  # "1201" | "1630"
    two_d: Mapped[str] = mapped_column(String(2), nullable=False)
    set_index: Mapped[float | None] = mapped_column(Float, nullable=True)
    market_value: Mapped[float | None] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
