"""HTTP client to call Agent Backend (list agents, get limits)."""
import httpx
from app.config import settings


async def get_agent_limits(agent_id: str) -> dict | None:
    """Get agent credit limit and blocked numbers. Returns None if agent not found or error."""
    async with httpx.AsyncClient() as client:
        try:
            r = await client.get(
                f"{settings.agent_backend_url}/internal/agents/{agent_id}/limits",
                headers={"X-Internal-API-Key": settings.internal_api_key},
                timeout=5.0,
            )
            if r.status_code != 200:
                return None
            return r.json()
        except Exception:
            return None


async def list_agents() -> list[dict]:
    """List all agents with limits (for validation)."""
    async with httpx.AsyncClient() as client:
        try:
            r = await client.get(
                f"{settings.agent_backend_url}/internal/agents",
                headers={"X-Internal-API-Key": settings.internal_api_key},
                timeout=5.0,
            )
            if r.status_code != 200:
                return []
            return r.json()
        except Exception:
            return []


def is_number_blocked(number: str, game_type: str, blocked_2d: list[str], blocked_3d: list[str]) -> bool:
    if game_type == "2D":
        return number in blocked_2d
    return number in blocked_3d


async def create_deposit_request_at_agent(
    player_id: str,
    player_name: str,
    agent_id: str,
    amount: float,
    transaction_id: str,
    payment_method: str,
    note: str | None = None,
) -> dict | None:
    """Create a player deposit request in the Agent backend. Returns request dict or None on error."""
    async with httpx.AsyncClient() as client:
        try:
            r = await client.post(
                f"{settings.agent_backend_url}/internal/deposit-requests",
                headers={"X-Internal-API-Key": settings.internal_api_key},
                json={
                    "player_id": player_id,
                    "player_name": player_name,
                    "agent_id": agent_id,
                    "amount": amount,
                    "transaction_id": transaction_id,
                    "payment_method": payment_method,
                    "note": note,
                },
                timeout=10.0,
            )
            if r.status_code != 200:
                return None
            return r.json()
        except Exception:
            return None


async def list_deposit_requests_by_player(player_id: str) -> list[dict]:
    """List deposit requests for a player (from Agent backend)."""
    async with httpx.AsyncClient() as client:
        try:
            r = await client.get(
                f"{settings.agent_backend_url}/internal/deposit-requests",
                params={"player_id": player_id},
                headers={"X-Internal-API-Key": settings.internal_api_key},
                timeout=10.0,
            )
            if r.status_code != 200:
                return []
            return r.json()
        except Exception:
            return []
