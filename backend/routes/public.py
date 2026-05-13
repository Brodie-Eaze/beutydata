"""Public, unauthenticated routes used by the consumer dispute portal."""
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException

from core.db import get_db
from core.hashing import hash_email, hash_phone
from models.schemas import (DisputeCreate, PublicIncidentView, SearchRequest)

router = APIRouter(prefix="/api/public", tags=["public"])


def _member_ref(salon_id: str) -> str:
    """Stable, de-identified label for a salon. Never reveals real name."""
    return f"Member salon #{salon_id[:6].upper()}"


@router.post("/lookup", response_model=list[PublicIncidentView])
async def lookup(req: SearchRequest):
    if not (req.phone or req.email):
        raise HTTPException(400, "Provide phone or email")
    db = get_db()
    ph = hash_phone(req.phone)
    eh = hash_email(req.email)
    clauses = []
    if ph:
        clauses.append({"phone_hash": ph})
    if eh:
        clauses.append({"email_hash": eh})
    consumer = await db.consumers.find_one({"$or": clauses})
    if not consumer:
        return []
    cursor = db.incidents.find(
        {"consumer_id": consumer["_id"], "status": {"$in": ["active", "disputed"]}}
    )
    return [
        PublicIncidentView(
            id=d["_id"],
            member_ref=_member_ref(d["reporting_salon_id"]),
            incident_type=d["incident_type"],
            incident_date=d["incident_date"],
            status=d["status"],
        )
        async for d in cursor
    ]


@router.post("/dispute/{incident_id}")
async def file_dispute(incident_id: str, body: DisputeCreate):
    db = get_db()
    incident = await db.incidents.find_one({"_id": incident_id})
    if not incident or incident["status"] not in ("active", "disputed"):
        raise HTTPException(404, "Incident not found or no longer active")

    # Verify the disputant supplied a contact that matches the incident's consumer.
    consumer = await db.consumers.find_one({"_id": incident["consumer_id"]})
    ph = hash_phone(body.phone)
    eh = hash_email(body.email)
    if not (
        (ph and consumer.get("phone_hash") == ph)
        or (eh and consumer.get("email_hash") == eh)
    ):
        raise HTTPException(403, "Contact does not match the incident's consumer")

    contact = body.phone or body.email
    now = datetime.now(timezone.utc)
    dispute_id = uuid.uuid4().hex
    await db.disputes.insert_one({
        "_id": dispute_id,
        "incident_id": incident_id,
        "disputant_contact": contact,
        "disputant_statement": body.statement,
        "evidence_files": body.evidence_keys,
        "status": "open",
        "reviewed_by": None,
        "resolution_notes": None,
        "created_at": now,
        "resolved_at": None,
    })
    await db.incidents.update_one({"_id": incident_id}, {"$set": {"status": "disputed"}})
    return {"ok": True, "dispute_id": dispute_id}
