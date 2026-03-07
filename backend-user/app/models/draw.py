"""Draw/Daily result for 2D/3D lottery."""
from sqlalchemy import String, DateTime, Date
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime, date

from app.database import Base


class Draw(Base):
    __tablename__ = "draws"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    round_name: Mapped[str] = mapped_column(String(32), nullable=False)  # Morning | Evening
    game_type: Mapped[str] = mapped_column(String(8), nullable=False)  # 2D | 3D
    winning_number: Mapped[str] = mapped_column(String(16), nullable=False)
    announced_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
