from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

from app.config import settings

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
    from app.models import Player, Session, Bet, Transaction, CallbackConfig, RefreshToken, BankAccount, Draw, SessionResult2D  # noqa: F401
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Seed demo player for local development.
    # If DEFAULT_AGENT_ID is not set, fall back to backend-agent's default admin (`admin1`).
    # This keeps `/auth/login` working with demo/demo123 even after fresh container rebuilds.
    seed_agent_id = settings.default_agent_id or "admin1"
    async with AsyncSessionLocal() as session:
        from sqlalchemy import select
        from app.auth import hash_password
        # Only seed if demo user doesn't exist yet.
        r = await session.execute(select(Player).where(Player.username == "demo").limit(1))
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
                agent_id=seed_agent_id,
                source="portal",
                platform_id=None,
                status="active",
            )
        )
        await session.commit()
