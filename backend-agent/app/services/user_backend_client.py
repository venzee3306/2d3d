"""Call User Backend internal API (e.g. credit player after deposit approval)."""
import logging
import httpx
from app.config import settings

logger = logging.getLogger(__name__)


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


async def fetch_period_summary(agent_ids: list[str], period: str = "daily") -> dict:
    """
    Fetch period-based analytics from User Backend for the given agent IDs.
    period: daily | weekly | monthly.
    Returns period_sales, period_bet_count, period_players, previous_sales, previous_bet_count,
    growth_pct, comparison, chart_data.
    """
    if not agent_ids:
        return {
            "period_sales": 0,
            "period_bet_count": 0,
            "period_players": 0,
            "previous_sales": 0,
            "previous_bet_count": 0,
            "growth_pct": 0.0,
            "comparison": "vs yesterday",
            "chart_data": [],
        }
    async with httpx.AsyncClient() as client:
        try:
            ids_param = ",".join(agent_ids)
            r = await client.get(
                f"{settings.user_backend_url}/internal/period-summary",
                params={"agent_ids": ids_param, "period": period},
                headers={"X-Internal-API-Key": settings.internal_api_key},
                timeout=15.0,
            )
            if r.status_code == 200:
                return r.json()
            return {
                "period_sales": 0,
                "period_bet_count": 0,
                "period_players": 0,
                "previous_sales": 0,
                "previous_bet_count": 0,
                "growth_pct": 0.0,
                "comparison": "vs yesterday" if period == "daily" else ("vs last week" if period == "weekly" else "vs last month"),
                "chart_data": [],
            }
        except Exception:
            return {
                "period_sales": 0,
                "period_bet_count": 0,
                "period_players": 0,
                "previous_sales": 0,
                "previous_bet_count": 0,
                "growth_pct": 0.0,
                "comparison": "vs yesterday" if period == "daily" else ("vs last week" if period == "weekly" else "vs last month"),
                "chart_data": [],
            }


async def fetch_today_summary(agent_ids: list[str]) -> dict:
    """
    Fetch today's sales and payouts from User Backend for the given agent IDs.
    Returns {"total_sales": float, "total_payouts": float, "by_agent": [{"agent_id", "sales", "payouts"}, ...]}.
    by_agent is used to compute commission from each agent's commission_rate.
    """
    if not agent_ids:
        return {"total_sales": 0, "total_payouts": 0, "by_agent": []}
    async with httpx.AsyncClient() as client:
        try:
            ids_param = ",".join(agent_ids)
            r = await client.get(
                f"{settings.user_backend_url}/internal/today-summary",
                params={"agent_ids": ids_param},
                headers={"X-Internal-API-Key": settings.internal_api_key},
                timeout=10.0,
            )
            if r.status_code == 200:
                return r.json()
            return {"total_sales": 0, "total_payouts": 0, "by_agent": []}
        except Exception:
            return {"total_sales": 0, "total_payouts": 0, "by_agent": []}


async def create_player_in_user_backend(
    agent_id: str,
    name: str,
    username: str,
    password: str,
    phone_number: str | None = None,
) -> tuple[dict | None, str, int]:
    """
    Create a player in the User Backend (and sync to Agent Backend).
    Returns (created player payload or None, error_message, status_code).
    status_code is the HTTP status from user backend (e.g. 400 for username exists, 502 for gateway error).
    """
    url = f"{settings.user_backend_url}/internal/players"
    try:
        async with httpx.AsyncClient() as client:
            r = await client.post(
                url,
                headers={"X-Internal-API-Key": settings.internal_api_key},
                json={
                    "agent_id": agent_id,
                    "name": name,
                    "username": username,
                    "password": password,
                    "phone_number": phone_number,
                },
                timeout=10.0,
            )
            if r.status_code == 200:
                return (r.json(), "", 200)
            try:
                body = r.json()
                detail = body.get("detail", r.text) if isinstance(body, dict) else r.text
            except Exception:
                detail = r.text or f"HTTP {r.status_code}"
            if not isinstance(detail, str):
                detail = str(detail)
            msg = f"User backend returned {r.status_code}: {detail}"
            logger.warning("create_player_in_user_backend failed: %s", msg)
            return (None, detail, r.status_code)
    except httpx.ConnectError as e:
        msg = f"User backend unreachable at {settings.user_backend_url}. Is it running? {e!s}"
        logger.warning("create_player_in_user_backend: %s", msg)
        return (None, msg, 502)
    except Exception as e:
        msg = f"User backend error: {e!s}"
        logger.exception("create_player_in_user_backend failed")
        return (None, msg, 502)


async def debit_player_withdrawal(player_id: str, amount: float, request_id: str | None = None) -> bool:
    """
    Debit a player's balance in the User Backend after agent approved a withdrawal (cash out).
    DEPRECATED: balance is now deducted at request time; use confirm_player_withdrawal instead.
    """
    return await confirm_player_withdrawal(player_id, amount, request_id)


async def confirm_player_withdrawal(player_id: str, amount: float, request_id: str | None = None) -> bool:
    """
    Confirm a player withdrawal (balance was already deducted at request time).
    Called when agent approves. Returns True on success.
    """
    async with httpx.AsyncClient() as client:
        try:
            r = await client.post(
                f"{settings.user_backend_url}/internal/confirm-withdrawal",
                headers={"X-Internal-API-Key": settings.internal_api_key},
                json={
                    "player_id": player_id,
                    "amount": amount,
                    "request_id": request_id,
                },
                timeout=10.0,
            )
            return r.status_code == 200
        except Exception:
            return False


async def credit_player_rejected_withdrawal(
    player_id: str, amount: float, request_id: str | None = None
) -> bool:
    """
    Credit a player's balance when agent rejects a withdrawal.
    Returns True on success.
    """
    async with httpx.AsyncClient() as client:
        try:
            r = await client.post(
                f"{settings.user_backend_url}/internal/credit-rejected-withdrawal",
                headers={"X-Internal-API-Key": settings.internal_api_key},
                json={
                    "player_id": player_id,
                    "amount": amount,
                    "request_id": request_id,
                },
                timeout=10.0,
            )
            return r.status_code == 200
        except Exception:
            return False
