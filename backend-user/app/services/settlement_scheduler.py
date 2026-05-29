"""Scheduler: after 12:01 PM and 4:30 PM Myanmar time, read 2D result from local DB and settle that round's bets."""
import logging
from zoneinfo import ZoneInfo

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

from app.database import AsyncSessionLocal
from app.routers.bets import run_settle_round_for_date
from app.services.twod_service import get_today_session_two_d

logger = logging.getLogger(__name__)
MYANMAR_TZ = ZoneInfo("Asia/Yangon")


def _today_myanmar_ymd() -> str:
    """Today's date in Myanmar timezone, YYYY-MM-DD."""
    from datetime import datetime
    return datetime.now(MYANMAR_TZ).strftime("%Y-%m-%d")


async def _run_settle_morning() -> None:
    """Cron: run after 12:01 PM Myanmar — settle Morning 2D round with 12:01 result from local DB."""
    two_d = await get_today_session_two_d("1201")
    if not two_d or not str(two_d).strip():
        logger.info("Settlement (Morning): no 12:01 PM 2D value in local DB, skipping")
        return
    today = _today_myanmar_ymd()
    async with AsyncSessionLocal() as db:
        try:
            out = await run_settle_round_for_date(db, today, "Morning", "2D", str(two_d).strip())
            logger.info("Settlement (Morning) completed: %s", out)
        except Exception as e:
            logger.exception("Settlement (Morning) failed: %s", e)


async def _run_settle_evening() -> None:
    """Cron: run after 4:30 PM Myanmar — settle Evening 2D round with 4:30 result from local DB."""
    two_d = await get_today_session_two_d("1630")
    if not two_d or not str(two_d).strip():
        logger.info("Settlement (Evening): no 4:30 PM 2D value in local DB, skipping")
        return
    today = _today_myanmar_ymd()
    async with AsyncSessionLocal() as db:
        try:
            out = await run_settle_round_for_date(db, today, "Evening", "2D", str(two_d).strip())
            logger.info("Settlement (Evening) completed: %s", out)
        except Exception as e:
            logger.exception("Settlement (Evening) failed: %s", e)


_scheduler: AsyncIOScheduler | None = None


def start_settlement_scheduler() -> None:
    """Start cron jobs: 12:05 and 16:35 Myanmar time to settle Morning and Evening 2D rounds."""
    global _scheduler
    if _scheduler is not None:
        return
    _scheduler = AsyncIOScheduler(timezone=MYANMAR_TZ)
    # Run a few minutes after result is captured by 2D scheduler (12:01 and 16:30)
    _scheduler.add_job(_run_settle_morning, CronTrigger(minute=5, hour=12), id="settle_morning")
    _scheduler.add_job(_run_settle_evening, CronTrigger(minute=35, hour=16), id="settle_evening")
    _scheduler.start()
    logger.info("Settlement scheduler started: Morning 12:05, Evening 16:35 (Asia/Yangon)")


def shutdown_settlement_scheduler() -> None:
    """Stop the settlement scheduler."""
    global _scheduler
    if _scheduler is not None:
        _scheduler.shutdown(wait=False)
        _scheduler = None
        logger.info("Settlement scheduler stopped")
