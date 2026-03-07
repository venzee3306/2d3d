"""Call User Backend internal API (e.g. credit player after deposit approval)."""
import httpx
from app.config import settings


async def credit_player_deposit(player_id: str, amount: float, request_id: str | None = None) -> bool:
    """
    Credit a player's balance in the User Backend after agent approved a deposit request.
    Returns True on success, False on error.
    """
    async with httpx.AsyncClient() as client:
        try:
            r = await client.post(
                f"{settings.user_backend_url}/internal/credit-deposit",
                headers={"X-Internal-API-Key": settings.internal_api_key},
                json={
                    "player_id": player_id,
                    "amount": amount,
                    "request_id": request_id,
                    "description": "Deposit approved",
                },
                timeout=10.0,
            )
            return r.status_code == 200
        except Exception:
            return False
