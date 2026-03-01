from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

from app.config import settings

engine = create_async_engine(
    settings.database_url,
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
    from app.models import Player, Session, Bet, Transaction, CallbackConfig, RefreshToken  # noqa: F401
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    if not settings.default_agent_id:
        return
    async with AsyncSessionLocal() as session:
        from sqlalchemy import select
        from app.auth import hash_password
        r = await session.execute(select(Player).limit(1))
        if r.scalar_one_or_none() is not None:
            return
        pid = "player-001"
        session.add(
            Player(
                id=pid,
                name="Demo Player",
                username="demo",
                password_hash=hash_password("demo123"),
                phone_number="09123456789",
                balance=0,
                agent_id=settings.default_agent_id,
                source="portal",
                platform_id=None,
                status="active",
            )
        )
        await session.commit()
