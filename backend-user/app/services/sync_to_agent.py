"""Push player snapshot to Agent Backend (sync)."""
import httpx
from app.config import settings
from app.models import Player


async def sync_player_to_agent(player: Player) -> bool:
    """Upsert player snapshot on Agent Backend. Idempotent."""
    async with httpx.AsyncClient() as client:
        try:
            r = await client.post(
                f"{settings.agent_backend_url}/internal/players",
                json={
                    "player_id": player.id,
                    "agent_id": player.agent_id,
                    "name": player.name,
                    "phone_number": player.phone_number,
                    "current_balance": float(player.balance),
                    "total_bets": player.total_bets,
                    "total_amount": float(player.total_amount),
                    "win_amount": float(player.win_amount),
                    "loss_amount": float(player.loss_amount),
                    "status": player.status,
                    "last_bet_at": player.last_bet_at.isoformat() if player.last_bet_at else None,
                },
                headers={"X-Internal-API-Key": settings.internal_api_key},
                timeout=5.0,
            )
            return r.status_code == 200
        except Exception:
            return False
