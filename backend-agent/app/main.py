import logging
import sys
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import init_db, get_db
from app.routers import health, auth, users, agents, balances, requests_routes, players, internal_sync, stats

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
    title="Agent Dashboard API",
    description="Backend for Agent Dashboard 2D3D",
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
app.include_router(users.router)
app.include_router(agents.router)
app.include_router(balances.router)
app.include_router(requests_routes.router)
app.include_router(players.router)
app.include_router(stats.router)
app.include_router(internal_sync.router)


@app.get("/")
def root():
    return {"service": "agent-dashboard", "docs": "/docs"}


if __name__ == "__main__":
    import uvicorn
    from app.config import settings
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.port, reload=True)
