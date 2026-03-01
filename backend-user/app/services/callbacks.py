"""Webhook callbacks to external platforms for seamless wallet sync.

Events:
- bet.placed: when a bet is placed (payload includes balance_after).
- bet.settled: when a round is settled (payload includes balance_after, settled_bets).
- balance.updated: when balance changes (e.g. after settlement; payload includes balance_after, reason).
All requests are signed with HMAC-SHA256 (X-Webhook-Signature) using the platform's api_key.
"""
import asyncio
import hashlib
import hmac
import json
from typing import Any

import httpx

from app.config import settings


def _sign_payload(payload: dict, secret: str | None) -> str:
    if not secret:
        return ""
    body = json.dumps(payload, sort_keys=True)
    return hmac.new(secret.encode(), body.encode(), hashlib.sha256).hexdigest()


async def _post_callback(url: str, payload: dict, signature: str) -> bool:
    async with httpx.AsyncClient() as client:
        try:
            r = await client.post(
                url,
                json=payload,
                headers={"X-Webhook-Signature": signature, "Content-Type": "application/json"},
                timeout=10.0,
            )
            return 200 <= r.status_code < 300
        except Exception:
            return False


async def send_callback(platform_id: str, event: str, payload: dict, callback_url: str, api_key: str | None) -> None:
    """Send webhook with retries."""
    payload["event"] = event
    payload["platform_id"] = platform_id
    signature = _sign_payload(payload, api_key)
    for attempt in range(settings.callback_retry_attempts):
        if await _post_callback(callback_url, payload, signature):
            return
        await asyncio.sleep(2 ** attempt)


async def send_callback_for_platform(platform_id: str, event: str, payload: dict, callback_url: str, api_key: str | None) -> None:
    """Fire-and-forget callback with retries. Call from route after loading CallbackConfig."""
    await send_callback(platform_id, event, payload, callback_url, api_key)
