import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException

from core.abn import verify_abn
from core.auth import create_access_token, hash_password, verify_password
from core.db import get_db
from models.schemas import LoginRequest, SignupRequest, TokenResponse

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/signup", response_model=TokenResponse)
async def signup(req: SignupRequest):
    db = get_db()
    if await db.users.find_one({"email": req.email.lower()}):
        raise HTTPException(409, "Email already registered")

    abn_result = await verify_abn(req.abn)
    if not abn_result["valid"]:
        raise HTTPException(400, f"ABN not valid: {abn_result['status']}")

    if await db.salons.find_one({"abn": req.abn}):
        raise HTTPException(409, "ABN already registered")

    salon_id = uuid.uuid4().hex
    user_id = uuid.uuid4().hex
    now = datetime.now(timezone.utc)

    await db.salons.insert_one({
        "_id": salon_id,
        "business_name": req.business_name,
        "abn": req.abn,
        "abn_verified_at": now,
        "abn_entity_name": abn_result.get("entity_name"),
        "address": req.address,
        "phone": req.phone,
        "owner_user_id": user_id,
        "stripe_customer_id": None,
        "subscription_status": "trialing",
        "member_agreement_accepted_at": None,
        "created_at": now,
    })
    await db.users.insert_one({
        "_id": user_id,
        "salon_id": salon_id,
        "email": req.email.lower(),
        "password_hash": hash_password(req.password),
        "role": "owner",
        "created_at": now,
        "last_login_at": now,
    })

    return TokenResponse(access_token=create_access_token(user_id, {"salon_id": salon_id}))


@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest):
    db = get_db()
    user = await db.users.find_one({"email": req.email.lower()})
    if not user or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(401, "Invalid credentials")
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"last_login_at": datetime.now(timezone.utc)}},
    )
    return TokenResponse(access_token=create_access_token(user["_id"], {"salon_id": user["salon_id"]}))
