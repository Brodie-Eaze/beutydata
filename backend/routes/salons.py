from datetime import datetime, timezone

from fastapi import APIRouter, Depends

from core.auth import get_current_user
from core.db import get_db
from models.schemas import SalonOut

router = APIRouter(prefix="/api/salons", tags=["salons"])


@router.get("/me", response_model=SalonOut)
async def get_my_salon(user: dict = Depends(get_current_user)):
    db = get_db()
    s = await db.salons.find_one({"_id": user["salon_id"]})
    return SalonOut(
        id=s["_id"],
        business_name=s["business_name"],
        abn=s["abn"],
        abn_verified_at=s.get("abn_verified_at"),
        abn_entity_name=s.get("abn_entity_name"),
        subscription_status=s.get("subscription_status", "inactive"),
        member_agreement_accepted_at=s.get("member_agreement_accepted_at"),
    )


@router.post("/me/accept-agreement")
async def accept_agreement(user: dict = Depends(get_current_user)):
    db = get_db()
    await db.salons.update_one(
        {"_id": user["salon_id"]},
        {"$set": {"member_agreement_accepted_at": datetime.now(timezone.utc)}},
    )
    return {"ok": True}
