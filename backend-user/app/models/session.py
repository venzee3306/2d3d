from sqlalchemy import String, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime

from app.database import Base


class Session(Base):
    __tablename__ = "sessions"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    player_id: Mapped[str] = mapped_column(String(64), ForeignKey("players.id"), nullable=False, index=True)
    round_name: Mapped[str] = mapped_column(String(32), nullable=False)  # Morning | Evening
    date: Mapped[str] = mapped_column(String(16), nullable=False)  # YYYY-MM-DD
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
