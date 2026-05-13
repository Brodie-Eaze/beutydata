"""Stripe billing. Subscription is created via Checkout; webhook keeps status in sync.

Stub-friendly: when STRIPE_SECRET_KEY is empty, the create-checkout endpoint returns
a fake URL and the webhook is a no-op, so dev flows aren't blocked.
"""
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Header, HTTPException, Request

from core.auth import get_current_user
from core.config import settings
from core.db import get_db

router = APIRouter(prefix="/api/billing", tags=["billing"])


@router.post("/checkout")
async def create_checkout(user: dict = Depends(get_current_user)):
    db = get_db()
    salon = await db.salons.find_one({"_id": user["salon_id"]})
    if not settings.STRIPE_SECRET_KEY:
        # Dev stub: mark active immediately
        await db.salons.update_one(
            {"_id": salon["_id"]},
            {"$set": {"subscription_status": "active"}},
        )
        return {"url": "stub://stripe/checkout", "dev_mode": True}

    import stripe  # type: ignore
    stripe.api_key = settings.STRIPE_SECRET_KEY
    session = stripe.checkout.Session.create(
        mode="subscription",
        line_items=[{"price": settings.STRIPE_PRICE_ID, "quantity": 1}],
        customer_email=user["email"],
        success_url="http://localhost:3000/settings?checkout=success",
        cancel_url="http://localhost:3000/settings?checkout=cancel",
        metadata={"salon_id": salon["_id"]},
    )
    return {"url": session.url}


@router.post("/webhook")
async def webhook(request: Request, stripe_signature: str = Header(default="")):
    if not settings.STRIPE_SECRET_KEY:
        return {"ok": True, "dev_mode": True}
    import stripe  # type: ignore
    payload = await request.body()
    try:
        event = stripe.Webhook.construct_event(payload, stripe_signature, settings.STRIPE_WEBHOOK_SECRET)
    except Exception as e:
        raise HTTPException(400, f"Bad signature: {e}")

    db = get_db()
    if event["type"] == "checkout.session.completed":
        s = event["data"]["object"]
        salon_id = (s.get("metadata") or {}).get("salon_id")
        if salon_id:
            await db.salons.update_one(
                {"_id": salon_id},
                {"$set": {
                    "subscription_status": "active",
                    "stripe_customer_id": s.get("customer"),
                }},
            )
    elif event["type"] in ("customer.subscription.deleted", "customer.subscription.paused"):
        sub = event["data"]["object"]
        await db.salons.update_one(
            {"stripe_customer_id": sub.get("customer")},
            {"$set": {"subscription_status": "canceled"}},
        )
    return {"ok": True}
