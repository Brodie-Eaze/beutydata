import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException

from core.auth import get_current_salon, get_current_user
from core.config import settings
from core.db import get_db
from core.hashing import email_masked, hash_email, hash_phone, phone_last4
from models.schemas import IncidentCreate, IncidentOut
from services.email import listing_notice_html, send_email

router = APIRouter(prefix="/api/incidents", tags=["incidents"])


async def _get_or_create_consumer(db, phone: str, email: str) -> str:
    ph = hash_phone(phone)
    eh = hash_email(email)
    query = {"$or": []}
    if ph:
        query["$or"].append({"phone_hash": ph})
    if eh:
        query["$or"].append({"email_hash": eh})
    if not query["$or"]:
        raise HTTPException(400, "Must provide phone or email")

    existing = await db.consumers.find_one(query)
    if existing:
        # Patch in missing hash if user added second contact
        patch = {}
        if ph and not existing.get("phone_hash"):
            patch["phone_hash"] = ph
            patch["phone_last4"] = phone_last4(phone)
        if eh and not existing.get("email_hash"):
            patch["email_hash"] = eh
            patch["email_masked"] = email_masked(email)
        if patch:
            await db.consumers.update_one({"_id": existing["_id"]}, {"$set": patch})
        return existing["_id"]

    cid = uuid.uuid4().hex
    await db.consumers.insert_one({
        "_id": cid,
        "phone_hash": ph or None,
        "email_hash": eh or None,
        "phone_last4": phone_last4(phone) if ph else None,
        "email_masked": email_masked(email) if eh else None,
        "first_seen_at": datetime.now(timezone.utc),
    })
    return cid


@router.post("", response_model=IncidentOut)
async def create_incident(
    body: IncidentCreate,
    salon: dict = Depends(get_current_salon),
    user: dict = Depends(get_current_user),
):
    if not body.attestation:
        raise HTTPException(400, "Attestation required")
    if not body.has_contact():
        raise HTTPException(400, "Consumer phone or email required")
    if not body.evidence_keys:
        raise HTTPException(400, "At least one evidence file required")

    db = get_db()
    consumer_id = await _get_or_create_consumer(db, body.consumer_phone, body.consumer_email)
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(days=settings.INCIDENT_TTL_DAYS)
    incident_id = uuid.uuid4().hex

    doc = {
        "_id": incident_id,
        "consumer_id": consumer_id,
        "reporting_salon_id": salon["_id"],
        "created_by_user_id": user["_id"],
        "incident_type": body.incident_type.value,
        "incident_date": body.incident_date,
        "amount_aud": body.amount_aud,
        "description": body.description,
        "evidence_keys": body.evidence_keys,
        "status": "active",
        "expires_at": expires_at,
        "created_at": now,
        # Salon-owned plaintext (visible only to reporting salon)
        "consumer_first_name": body.consumer_first_name or None,
        "consumer_phone": body.consumer_phone or None,
        "consumer_email": body.consumer_email or None,
    }
    await db.incidents.insert_one(doc)

    # Notify consumer if email present
    if body.consumer_email:
        await send_email(
            body.consumer_email,
            "Notice: an incident has been logged against your contact details",
            listing_notice_html(salon["business_name"], body.incident_type.value, settings.DISPUTE_PORTAL_URL),
        )
        await db.consent_notifications.insert_one({
            "_id": uuid.uuid4().hex,
            "incident_id": incident_id,
            "notification_channel": "email",
            "sent_at": now,
            "delivery_status": "sent",
        })

    return _to_out(doc, include_pii=True)


@router.get("", response_model=list[IncidentOut])
async def list_my_incidents(salon: dict = Depends(get_current_salon)):
    db = get_db()
    cursor = db.incidents.find({"reporting_salon_id": salon["_id"]}).sort("created_at", -1)
    return [_to_out(d, include_pii=True) async for d in cursor]


@router.post("/{incident_id}/withdraw", response_model=IncidentOut)
async def withdraw_incident(incident_id: str, salon: dict = Depends(get_current_salon)):
    db = get_db()
    inc = await db.incidents.find_one({"_id": incident_id, "reporting_salon_id": salon["_id"]})
    if not inc:
        raise HTTPException(404, "Not found")
    await db.incidents.update_one({"_id": incident_id}, {"$set": {"status": "withdrawn"}})
    inc["status"] = "withdrawn"
    return _to_out(inc, include_pii=True)


def _to_out(doc: dict, include_pii: bool) -> IncidentOut:
    return IncidentOut(
        id=doc["_id"],
        consumer_id=doc["consumer_id"],
        incident_type=doc["incident_type"],
        incident_date=doc["incident_date"],
        amount_aud=doc.get("amount_aud"),
        description=doc["description"],
        evidence_keys=doc.get("evidence_keys", []),
        status=doc["status"],
        expires_at=doc["expires_at"],
        created_at=doc["created_at"],
        consumer_first_name=doc.get("consumer_first_name") if include_pii else None,
        consumer_phone=doc.get("consumer_phone") if include_pii else None,
        consumer_email=doc.get("consumer_email") if include_pii else None,
    )
