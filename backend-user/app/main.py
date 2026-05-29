import asyncio
import logging
import sys
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.auth import decode_token
from app.config import settings
from app.websocket import manager
from app.database import init_db
from app.routers import health, auth, players, sessions, bets, transactions, deposit_requests, withdrawal_requests, bank_accounts, results, payout_rates, two_d_results, internal_sync, public_api
from app.services.settlement_scheduler import start_settlement_scheduler, shutdown_settlement_scheduler
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
    start_settlement_scheduler()
    try:
        loop = asyncio.get_running_loop()
        start_twod_scheduler(loop)
    except Exception as e:
        logger.warning("2D scheduler start failed: %s", e)
    try:
        yield
    finally:
        shutdown_twod_scheduler()
        shutdown_settlement_scheduler()


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
app.include_router(withdrawal_requests.router)
app.include_router(bank_accounts.router)
app.include_router(results.router)
app.include_router(payout_rates.router)
app.include_router(two_d_results.router)
app.include_router(internal_sync.router)
app.include_router(public_api.router)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Ensure unhandled exceptions always return a proper JSON response."""
    logger.exception("Unhandled exception: %s", exc)
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal server error: {str(exc)}"},
    )


@app.get("/")
def root():
    return {"service": "user-onboarding", "docs": "/docs"}


@app.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str = Query(..., description="JWT from GET /auth/ws-token"),
):
    """Real-time updates for balance/deposit/withdrawal. Authenticate with token from /auth/ws-token."""
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
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.port, reload=True)
