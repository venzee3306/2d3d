"""Fetch live 2D from 2DBoss API, cache in-memory, and persist 12:01/4:30 to DB for history."""
import asyncio
import logging
import re
from datetime import date, datetime, timedelta
from zoneinfo import ZoneInfo

import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import AsyncSessionLocal
from app.models.session_result_2d import SessionResult2D

logger = logging.getLogger(__name__)
MYANMAR_TZ = ZoneInfo(getattr(settings, "timezone", "Asia/Yangon"))

TWOD_UPSTREAM = getattr(settings, "twod_upstream_url", "https://luke.2dboss.com/api/luke/twod-result-live")

HEADERS = {
    "Accept": "application/json, text/plain, */*",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
    "Referer": "https://luke.2dboss.com/",
}

# In-memory cache: { "two_d", "set_index", "market_value", "timestamp" } or None
_live_cache: dict | None = None
_cache_lock = asyncio.Lock()
_capture_lock = asyncio.Lock()


def _parse_number(s) -> float | None:
    if s is None or (isinstance(s, str) and not s.strip()):
        return None
    try:
        return float(re.sub(r",", "", str(s).strip()))
    except (ValueError, TypeError):
        return None


def _compute_2d(set_index: float, market_value: float) -> str:
    d1 = int(set_index) % 10
    d2 = int(market_value) % 10
    return f"{d1}{d2}"


def _extract_data(payload) -> dict | None:
    """Normalize API response to a single data dict. Handles [] or {} or { data: {} } or list of objects."""
    if payload is None:
        return None
    if isinstance(payload, list):
        if not payload:
            return None
        payload = payload[0] if isinstance(payload[0], dict) else {}
    if not isinstance(payload, dict):
        return None
    return payload.get("data") if "data" in payload else payload


def _parse_live(data: dict) -> dict | None:
    """From data dict get set_index, market_value, optional live 2D string. Returns dict or None."""
    if not data:
        return None
    set_raw = data.get("live_set") or data.get("set_430") or data.get("set") or data.get("setIndex")
    val_raw = data.get("live_val") or data.get("val_430") or data.get("val") or data.get("marketValue") or data.get("value")
    set_index = _parse_number(set_raw)
    market_value = _parse_number(val_raw)
    if set_index is None or market_value is None:
        return None
    two_d = _compute_2d(set_index, market_value)
    upstream_live = str(data.get("live") or data.get("twoD") or "").strip()
    if len(upstream_live) == 2 and upstream_live.isdigit():
        two_d = upstream_live
    return {"two_d": two_d, "set_index": set_index, "market_value": market_value}


async def fetch_live_2d() -> dict | None:
    """Fetch from 2DBoss API and return { two_d, set_index, market_value } or None."""
    try:
        async with httpx.AsyncClient(timeout=10.0, headers=HEADERS) as client:
            r = await client.get(TWOD_UPSTREAM)
            r.raise_for_status()
            payload = r.json()
    except Exception as e:
        logger.warning("2DBoss fetch failed: %s", e)
        return None
    data = _extract_data(payload)
    return _parse_live(data) if data else None


async def get_live_cached() -> dict | None:
    """Return current live from cache (no fetch)."""
    async with _cache_lock:
        return _live_cache.copy() if _live_cache else None


async def refresh_live_cache() -> dict | None:
    """Fetch from API and update cache. Returns current cache entry (with timestamp) or None."""
    global _live_cache
    raw = await fetch_live_2d()
    if raw is None:
        return await get_live_cached()
    entry = {
        "two_d": raw["two_d"],
        "set_index": raw["set_index"],
        "market_value": raw["market_value"],
        "timestamp": datetime.now(MYANMAR_TZ).isoformat(),
    }
    async with _cache_lock:
        _live_cache = entry
    return entry


def is_myanmar_market_hours() -> bool:
    now = datetime.now(MYANMAR_TZ)
    if now.weekday() >= 5:
        return False
    h, m = now.hour, now.minute
    if h == 9 and m >= 30:
        return True
    if 10 <= h < 12:
        return True
    if h == 12 and m <= 1:
        return True
    if 14 <= h < 16:
        return True
    if h == 16 and m <= 30:
        return True
    return False


async def capture_session(slot: str) -> None:
    """Save current live cache as today's session result (slot 1201 or 1630)."""
    async with _capture_lock:
        entry = await get_live_cached()
        if not entry:
            logger.warning("Capture %s: no live cache", slot)
            return
        today = datetime.now(MYANMAR_TZ).date()
        async with AsyncSessionLocal() as db:
            existing = await db.execute(
                select(SessionResult2D).where(
                    SessionResult2D.date == today,
                    SessionResult2D.slot == slot,
                )
            )
            if existing.scalar_one_or_none():
                logger.info("Capture %s: already exists for %s", slot, today)
                return
            db.add(
                SessionResult2D(
                    date=today,
                    slot=slot,
                    two_d=entry["two_d"],
                    set_index=entry.get("set_index"),
                    market_value=entry.get("market_value"),
                )
            )
            await db.commit()
        logger.info("Captured 2D session %s for %s: %s", slot, today, entry["two_d"])


async def ensure_today_sessions_captured() -> None:
    """
    Backfill today's 12:01 / 4:30 rows if service was down at cron time.
    - If now >= 12:01 (Myanmar) and 1201 missing => capture from latest live data.
    - If now >= 16:30 (Myanmar) and 1630 missing => capture from latest live data.
    """
    now = datetime.now(MYANMAR_TZ)
    if now.weekday() >= 5:
        return
    today = now.date()

    # Determine which slots should already exist at current time.
    due_slots: list[str] = []
    if (now.hour, now.minute) >= (12, 1):
        due_slots.append("1201")
    if (now.hour, now.minute) >= (16, 30):
        due_slots.append("1630")
    if not due_slots:
        return

    async with AsyncSessionLocal() as db:
        rows = await db.execute(
            select(SessionResult2D.slot).where(
                SessionResult2D.date == today,
                SessionResult2D.slot.in_(due_slots),
            )
        )
        existing = {r[0] for r in rows.all()}

    missing = [slot for slot in due_slots if slot not in existing]
    if not missing:
        return

    # Ensure we have latest cache before capturing missing slots.
    cached = await get_live_cached()
    if cached is None:
        await refresh_live_cache()

    for slot in missing:
        await capture_session(slot)


async def get_today_session_two_d(slot: str) -> str | None:
    """Return today's 2D value for the given slot ("1201" or "1630") from local DB. Used by settlement."""
    today = datetime.now(MYANMAR_TZ).date()
    async with AsyncSessionLocal() as db:
        row = await db.execute(
            select(SessionResult2D).where(
                SessionResult2D.date == today,
                SessionResult2D.slot == slot,
            ).limit(1)
        )
        r = row.scalar_one_or_none()
        return r.two_d if r else None


async def get_today_results(db: AsyncSession) -> list[dict]:
    """Return today's 12:01 and 4:30 from DB as list of { time, set, value, twoD, timestamp }."""
    today = datetime.now(MYANMAR_TZ).date()
    rows = await db.execute(
        select(SessionResult2D)
        .where(SessionResult2D.date == today)
        .order_by(SessionResult2D.slot, SessionResult2D.created_at.desc(), SessionResult2D.id.desc())
    )
    out = []
    now = datetime.now(MYANMAR_TZ)
    allow_1201 = (now.hour, now.minute) >= (12, 1)
    allow_1630 = (now.hour, now.minute) >= (16, 30)
    seen_slots: set[str] = set()
    for row in rows.scalars().all():
        if row.slot == "1201" and not allow_1201:
            continue
        if row.slot == "1630" and not allow_1630:
            continue
        # Defensive de-duplication: keep latest row per slot.
        if row.slot in seen_slots:
            continue
        seen_slots.add(row.slot)
        time_label = "12:01 PM" if row.slot == "1201" else "4:30 PM"
        out.append({
            "time": time_label,
            "set": row.set_index or 0,
            "value": row.market_value or 0,
            "twoD": row.two_d,
            "timestamp": row.created_at.isoformat() if row.created_at else "",
        })
    return out


async def get_history(db: AsyncSession, days: int) -> list[dict]:
    """Return history for DATE table: [{ date, "12:01": "...", "4:30": "..." }], weekdays only."""
    end = datetime.now(MYANMAR_TZ).date()
    start = end - timedelta(days=days)
    rows = await db.execute(
        select(SessionResult2D)
        .where(SessionResult2D.date >= start, SessionResult2D.date <= end)
        .order_by(
            SessionResult2D.date.desc(),
            SessionResult2D.slot,
            SessionResult2D.created_at.desc(),
            SessionResult2D.id.desc(),
        )
    )
    by_date: dict[str, dict] = {}
    seen_date_slot: set[tuple[str, str]] = set()
    now = datetime.now(MYANMAR_TZ)
    today_iso = now.date().isoformat()
    allow_1201_today = (now.hour, now.minute) >= (12, 1)
    allow_1630_today = (now.hour, now.minute) >= (16, 30)
    for row in rows.scalars().all():
        d = row.date.isoformat()
        if d == today_iso and row.slot == "1201" and not allow_1201_today:
            continue
        if d == today_iso and row.slot == "1630" and not allow_1630_today:
            continue
        key = (d, row.slot)
        # Defensive de-duplication: keep latest row per (date, slot).
        if key in seen_date_slot:
            continue
        seen_date_slot.add(key)
        if d not in by_date:
            by_date[d] = {"date": d, "12:01": None, "4:30": None}
        if row.slot == "1201":
            by_date[d]["12:01"] = row.two_d
        else:
            by_date[d]["4:30"] = row.two_d
    result = []
    for d in sorted(by_date.keys(), reverse=True):
        dt = datetime.strptime(d, "%Y-%m-%d").date()
        if dt.weekday() < 5:
            result.append(by_date[d])
    return result
