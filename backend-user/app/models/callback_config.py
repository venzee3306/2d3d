from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class CallbackConfig(Base):
    __tablename__ = "callback_configs"

    platform_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    callback_url: Mapped[str] = mapped_column(String(512), nullable=False)
    api_key: Mapped[str | None] = mapped_column(String(255), nullable=True)  # optional secret for signing
