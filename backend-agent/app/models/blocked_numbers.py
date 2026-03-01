"""Blocked numbers per agent (set by master)."""
from sqlalchemy import String, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class BlockedNumber(Base):
    __tablename__ = "blocked_numbers"
    __table_args__ = (UniqueConstraint("agent_id", "game_type", "number", name="uq_agent_game_number"),)

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    agent_id: Mapped[str] = mapped_column(String(64), ForeignKey("users.id"), nullable=False, index=True)
    game_type: Mapped[str] = mapped_column(String(8), nullable=False)  # 2D, 3D
    number: Mapped[str] = mapped_column(String(32), nullable=False)
