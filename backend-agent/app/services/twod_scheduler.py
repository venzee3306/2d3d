"""Refresh 2D live cache and capture 12:01/4:30 session results to DB."""
import asyncio
import logging
from zoneinfo import ZoneInfo

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger

from app.config import settings
from app.services.twod_service import (
    capture_session,
    is_myanmar_market_hours,
    refresh_live_cache,
)

logger = logging.getLogger(__name__)
MYANMAR_TZ = ZoneInfo(getattr(settings, "timezone", "Asia/Yangon"))

_scheduler: AsyncIOScheduler | None = None


async def _refresh_job() -> None:
    if not is_myanmar_market_hours():
        return
    try:
        await refresh_live_cache()
    except Exception as e:
        logger.warning("2D refresh job failed: %s", e)


async def _capture_1201() -> None:
    try:
        await capture_session("1201")
    except Exception as e:
        logger.warning("2D capture 12:01 failed: %s", e)


async def _capture_1630() -> None:
    try:
        await capture_session("1630")
    except Exception as e:
        logger.warning("2D capture 4:30 failed: %s", e)


def start_twod_scheduler(loop: asyncio.AbstractEventLoop | None = None) -> None:
    global _scheduler
    if _scheduler is not None:
        return
    _scheduler = AsyncIOScheduler(timezone=MYANMAR_TZ, event_loop=loop)
    _scheduler.add_job(_refresh_job, IntervalTrigger(seconds=2), id="twod_refresh")
    _scheduler.add_job(_capture_1201, CronTrigger(minute=1, hour=12), id="twod_capture_1201")
    _scheduler.add_job(_capture_1630, CronTrigger(minute=30, hour=16), id="twod_capture_1630")
    _scheduler.start()
    logger.info("2D scheduler started: refresh every 2s (market hours), capture 12:01 & 16:30 Myanmar")


def shutdown_twod_scheduler() -> None:
    global _scheduler
    if _scheduler is not None:
        _scheduler.shutdown(wait=False)
        _scheduler = None
        logger.info("2D scheduler stopped")
