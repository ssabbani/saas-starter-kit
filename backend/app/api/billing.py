from fastapi import APIRouter, Depends, HTTPException, Header, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.subscription import Subscription
from app.models.user import User
from app.schemas import CheckoutRequest, CheckoutResponse, SubscriptionResponse
from app.services.stripe_service import (
    create_billing_portal,
    create_checkout_session,
    handle_webhook_event,
)

router = APIRouter()


@router.post("/checkout", response_model=CheckoutResponse)
async def checkout(
    body: CheckoutRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    url = await create_checkout_session(current_user, body.price_id, db)
    return CheckoutResponse(checkout_url=url)


@router.post("/portal")
async def portal(current_user: User = Depends(get_current_user)):
    url = await create_billing_portal(current_user)
    return {"portal_url": url}


@router.get("/subscription", response_model=SubscriptionResponse)
async def get_subscription(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Subscription).where(Subscription.user_id == current_user.id)
    )
    subscription = result.scalar_one_or_none()
    if not subscription:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No subscription found")
    return subscription


@router.post("/webhooks/stripe")
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(alias="Stripe-Signature"),
    db: AsyncSession = Depends(get_db),
):
    payload = await request.body()
    try:
        await handle_webhook_event(payload, stripe_signature, db)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid webhook signature")
    return {"status": "ok"}
