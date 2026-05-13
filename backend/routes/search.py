import uuid
from collections import Counter
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException

from core.auth import get_current_salon, get_current_user
from core.db import get_db
from core.hashing import email_masked, hash_email, hash_phone, phone_last4
from models.schemas import (IncidentTypeBreakdown, OwnIncidentSummary,
                            SearchRequest, SearchResponse)

router = APIRouter(prefix="/api/search", tags=["search"])


@router.post("", response_model=SearchResponse)
async def search(
    req: SearchRequest,
    salon: dict = Depends(get_current_salon),
    user: dict = Depends(get_current_user),
):
    if not (req.phone or req.email):
        raise HTTPException(400, "Provide phone or email")

    db = get_db()
    ph = hash_phone(req.phone)
    eh = hash_email(req.email)

    or_clauses = []
    if ph:
        or_clauses.append({"phone_hash": ph})
    if eh:
        or_clauses.append({"email_hash": eh})
    consumer = await db.consumers.find_one({"$or": or_clauses}) if or_clauses else None

    # Audit log every search, hit or miss.
    await db.searches.insert_one({
        "_id": uuid.uuid4().hex,
        "salon_id": salon["_id"],
        "user_id": user["_id"],
        "query_phone_hash": ph or None,
        "query_email_hash": eh or None,
        "result_count": 0 if not consumer else None,  # patched below
        "searched_at": datetime.now(timezone.utc),
    })

    if not consumer:
        return SearchResponse(
            matched=False, total_active_flags=0, breakdown=[],
            own_incidents=[], other_salons_count=0,
        )

    # Active incidents only
    cursor = db.incidents.find({"consumer_id": consumer["_id"], "status": "active"})
    all_active = [d async for d in cursor]
    total = len(all_active)

    own = [d for d in all_active if d["reporting_salon_id"] == salon["_id"]]
    others = [d for d in all_active if d["reporting_salon_id"] != salon["_id"]]

    breakdown = [
        IncidentTypeBreakdown(incident_type=t, count=c)
        for t, c in Counter(d["incident_type"] for d in all_active).items()
    ]

    # Update audit row with count
    await db.searches.update_one(
        {"salon_id": salon["_id"], "user_id": user["_id"]},
        {"$set": {"result_count": total}},
        sort=[("searched_at", -1)],
    )

    display = None
    if consumer.get("email_masked"):
        display = consumer["email_masked"]
    elif consumer.get("phone_last4"):
        display = f"****{consumer['phone_last4']}"

    return SearchResponse(
        matched=True,
        total_active_flags=total,
        breakdown=breakdown,
        own_incidents=[
            OwnIncidentSummary(
                id=d["_id"],
                incident_type=d["incident_type"],
                incident_date=d["incident_date"],
                status=d["status"],
            )
            for d in own
        ],
        other_salons_count=len({d["reporting_salon_id"] for d in others}),
        consumer_display=display,
    )
