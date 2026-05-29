from sqlalchemy import String, Numeric, Integer, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum

from app.database import Base


class UserRole(str, enum.Enum):
    admin = "admin"
    master = "master"
    agent = "agent"


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    username: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(SQLEnum(UserRole), nullable=False)
    parent_id: Mapped[str | None] = mapped_column(String(64), ForeignKey("users.id"), nullable=True, index=True)

    # Business rules (agents and masters)
    commission_rate: Mapped[float | None] = mapped_column(Numeric(5, 2), nullable=True, server_default="10")
    total_bet_limit: Mapped[float | None] = mapped_column(Numeric(18, 0), nullable=True, server_default="5000000")
    single_number_limit: Mapped[float | None] = mapped_column(Numeric(18, 0), nullable=True, server_default="500000")
    payout_2d: Mapped[int | None] = mapped_column(Integer, nullable=True, server_default="80")
    payout_3d: Mapped[int | None] = mapped_column(Integer, nullable=True, server_default="500")

    balance_rel: Mapped["UserBalance | None"] = relationship("UserBalance", back_populates="user", uselist=False)


class UserBalance(Base):
    __tablename__ = "user_balances"

    user_id: Mapped[str] = mapped_column(String(64), ForeignKey("users.id"), primary_key=True)
    balance: Mapped[float] = mapped_column(Numeric(18, 2), default=0, nullable=False)
    locked_balance: Mapped[float] = mapped_column(Numeric(18, 2), default=0, nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="balance_rel")
