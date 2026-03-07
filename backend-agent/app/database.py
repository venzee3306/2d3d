from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

from app.config import settings

# Use sync URL for SQLite in dev if needed; plan uses PostgreSQL
engine = create_async_engine(
    settings.database_url_safe,
    echo=False,
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


class Base(DeclarativeBase):
    pass


async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db():
    from app.models import (  # noqa: F401 - register models with Base.metadata
        User,
        UserBalance,
        Transaction,
        DepositRequest,
        WithdrawalRequest,
        UnitDepositRequest,
        PlayerWithdrawalRequest,
        PlayerSnapshot,
        BlockedNumber,
        BankAccount,
        RefreshToken,
    )
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Seed default admin if no users (run in new session to avoid same connection)
    async with AsyncSessionLocal() as session:
        from sqlalchemy import select
        from app.models.user import UserRole
        from app.auth import hash_password
        r = await session.execute(select(User).limit(1))
        if r.scalar_one_or_none() is None:
            admin_id = "admin1"
            session.add(
                User(
                    id=admin_id,
                    name="Admin",
                    username="admin",
                    password_hash=hash_password("admin123"),
                    role=UserRole.admin,
                    parent_id=None,
                )
            )
            session.add(UserBalance(user_id=admin_id, balance=0, locked_balance=0))
            await session.commit()
