"""Daily job: expire incidents past their TTL, and auto-withdraw disputed
incidents whose owning salon did not respond within 14 days."""
from datetime import datetime, timedelta, timezone

from core.db import get_db


async def expire_incidents() -> int:
    db = get_db()
    now = datetime.now(timezone.utc)
    result = await db.incidents.update_many(
        {"status": {"$in": ["active", "disputed"]}, "expires_at": {"$lte": now}},
        {"$set": {"status": "expired"}},
    )
    return result.modified_count


async def auto_withdraw_unanswered_disputes(grace_days: int = 14) -> int:
    db = get_db()
    cutoff = datetime.now(timezone.utc) - timedelta(days=grace_days)
    stale = db.disputes.find({"status": "open", "created_at": {"$lte": cutoff}})
    count = 0
    async for d in stale:
        await db.incidents.update_one({"_id": d["incident_id"]}, {"$set": {"status": "withdrawn"}})
        await db.disputes.update_one(
            {"_id": d["_id"]},
            {"$set": {
                "status": "upheld",
                "resolution_notes": "Auto-withdrawn: salon did not respond within 14 days.",
                "resolved_at": datetime.now(timezone.utc),
            }},
        )
        count += 1
    return count


async def run_daily() -> dict:
    return {
        "expired": await expire_incidents(),
        "auto_withdrawn": await auto_withdraw_unanswered_disputes(),
    }
