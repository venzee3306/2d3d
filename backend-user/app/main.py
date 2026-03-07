import logging
import sys
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import init_db
from app.routers import health, auth, players, sessions, bets, transactions, deposit_requests, internal_sync, public_api

logging.basicConfig(level=logging.INFO, stream=sys.stderr, format="%(levelname)s %(message)s")
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        await init_db()
    except Exception as e:
        logger.exception("Startup failed (init_db): %s", e)
        raise
    yield


app = FastAPI(
    title="User Onboarding API",
    description="Backend for User Onboarding (players, bets, sessions)",
    version="0.1.0",
    lifespan=lifespan,
)

_cors_origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()] or ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/health")
app.include_router(auth.router)
app.include_router(players.router)
app.include_router(sessions.router)
app.include_router(bets.router)
app.include_router(transactions.router)
app.include_router(deposit_requests.router)
app.include_router(internal_sync.router)
app.include_router(public_api.router)


@app.get("/")
def root():
    return {"service": "user-onboarding", "docs": "/docs"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.port, reload=True)
