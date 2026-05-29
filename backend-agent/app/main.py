import logging
import sys
from contextlib import asynccontextmanager

from pathlib import Path

from fastapi import FastAPI, Query, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

import asyncio

from app.auth import decode_token
from app.config import settings
from app.websocket import manager
from app.database import init_db, get_db
from app.routers import health, auth, users, agents, balances, requests_routes, players, internal_sync, stats, bank_accounts, transactions, two_d_results, results
from app.services.twod_scheduler import start_twod_scheduler, shutdown_twod_scheduler

logging.basicConfig(level=logging.INFO, stream=sys.stderr, format="%(levelname)s %(message)s")
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        await init_db()
    except Exception as e:
        logger.exception("Startup failed (init_db): %s", e)
        raise
    try:
        loop = asyncio.get_running_loop()
        start_twod_scheduler(loop)
    except Exception as e:
        logger.warning("2D scheduler start failed: %s", e)
    try:
        yield
    finally:
        shutdown_twod_scheduler()


app = FastAPI(
    title="Agent Dashboard API",
    description="Backend for Agent Dashboard 2D3D",
    version="0.1.0",
    lifespan=lifespan,
)

# With credentials (cookies), browser forbids Access-Control-Allow-Origin: *.
# Default to common dev origins so login from localhost:5173 works.
_default_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
_cors_origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()] or _default_origins
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
app.include_router(bank_accounts.router)
app.include_router(transactions.router)
app.include_router(two_d_results.router)
app.include_router(results.router)
app.include_router(internal_sync.router)

# Serve uploaded files (QR images) from resolved path so /uploads/bank-qr/xxx.png is found
_uploads_root = settings.uploads_parent_resolved
_uploads_root.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(_uploads_root)), name="uploads")


@app.get("/")
def root():
    return {"service": "agent-dashboard", "docs": "/docs"}


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, token: str = Query("")):
    if not token:
        await websocket.close(code=4001)
        return
    payload = decode_token(token)
    if not payload or "sub" not in payload:
        await websocket.close(code=4001)
        return
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        pass
    finally:
        await manager.disconnect(websocket)


if __name__ == "__main__":
    import uvicorn
    from app.config import settings
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.port, reload=True)
