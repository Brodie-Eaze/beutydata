import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException

from core.auth import get_current_salon
from core.db import get_db
from models.schemas import DisputeOut, DisputeResolution

router = APIRouter(prefix="/api/disputes", tags=["disputes"])


@router.get("", response_model=list[DisputeOut])
async def list_disputes_against_me(salon: dict = Depends(get_current_salon)):
    db = get_db()
    incident_ids = [d["_id"] async for d in db.incidents.find(
        {"reporting_salon_id": salon["_id"]}, {"_id": 1}
    )]
    cursor = db.disputes.find({"incident_id": {"$in": incident_ids}}).sort("created_at", -1)
    return [
        DisputeOut(
            id=d["_id"],
            incident_id=d["incident_id"],
            statement=d["disputant_statement"],
            evidence_keys=d.get("evidence_files", []),
            status=d["status"],
            created_at=d["created_at"],
            resolved_at=d.get("resolved_at"),
        )
        async for d in cursor
    ]


@router.post("/{dispute_id}/resolve", response_model=DisputeOut)
async def resolve_dispute(
    dispute_id: str,
    body: DisputeResolution,
    salon: dict = Depends(get_current_salon),
):
    db = get_db()
    dispute = await db.disputes.find_one({"_id": dispute_id})
    if not dispute:
        raise HTTPException(404, "Not found")
    incident = await db.incidents.find_one({"_id": dispute["incident_id"]})
    if not incident or incident["reporting_salon_id"] != salon["_id"]:
        raise HTTPException(403, "Not your incident")

    now = datetime.now(timezone.utc)
    new_incident_status = "withdrawn" if body.decision.value == "upheld" else "active"

    await db.disputes.update_one(
        {"_id": dispute_id},
        {"$set": {
            "status": body.decision.value,
            "resolution_notes": body.notes,
            "resolved_at": now,
        }},
    )
    await db.incidents.update_one(
        {"_id": dispute["incident_id"]},
        {"$set": {"status": new_incident_status}},
    )

    dispute = await db.disputes.find_one({"_id": dispute_id})
    return DisputeOut(
        id=dispute["_id"],
        incident_id=dispute["incident_id"],
        statement=dispute["disputant_statement"],
        evidence_keys=dispute.get("evidence_files", []),
        status=dispute["status"],
        created_at=dispute["created_at"],
        resolved_at=dispute.get("resolved_at"),
    )
