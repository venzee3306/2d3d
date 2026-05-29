"""WebSocket connection manager for real-time unit flow updates."""
import asyncio
import json
import logging

from fastapi import WebSocket

logger = logging.getLogger(__name__)


class ConnectionManager:
    def __init__(self):
        self._connections: list[WebSocket] = []
        self._lock = asyncio.Lock()

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        async with self._lock:
            self._connections.append(websocket)
        logger.info("WebSocket connected, total=%d", len(self._connections))

    async def disconnect(self, websocket: WebSocket) -> None:
        try:
            async with self._lock:
                if websocket in self._connections:
                    self._connections.remove(websocket)
        except ValueError:
            pass
        logger.info("WebSocket disconnected, total=%d", len(self._connections))

    async def broadcast(self, message: dict) -> None:
        """Send a JSON message to all connected clients."""
        data = json.dumps(message)
        dead = []
        async with self._lock:
            for ws in self._connections:
                try:
                    await ws.send_text(data)
                except Exception as e:
                    logger.warning("WebSocket send failed: %s", e)
                    dead.append(ws)
            for ws in dead:
                if ws in self._connections:
                    self._connections.remove(ws)


# Singleton used by routes and WebSocket endpoint
manager = ConnectionManager()


async def broadcast_units_updated() -> None:
    """Notify all clients that unit-related data (deposits, withdrawals, transfers) changed."""
    await manager.broadcast({"type": "units_updated"})
