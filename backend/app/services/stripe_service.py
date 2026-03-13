import logging
from datetime import datetime, timezone

import stripe
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.models.subscription import Subscription, SubscriptionStatus
from app.models.tracking import ActivityLog, UsageRecord
from app.models.user import PlanType, User

settings = get_settings()
stripe.api_key = settings.STRIPE_SECRET_KEY
logger = logging.getLogger("uvicorn.error")

# Map Stripe price IDs → plan tier
PRICE_TO_PLAN: dict[str, PlanType] = {
    settings.STRIPE_STARTER_PRICE_ID: PlanType.starter,
    settings.STRIPE_PRO_PRICE_ID: PlanType.pro,
    settings.STRIPE_ENTERPRISE_PRICE_ID: PlanType.enterprise,
    settings.STRIPE_STARTER_ANNUAL_PRICE_ID: PlanType.starter,
    settings.STRIPE_PRO_ANNUAL_PRICE_ID: PlanType.pro,
    settings.STRIPE_ENTERPRISE_ANNUAL_PRICE_ID: PlanType.enterprise,
}

# Plan-level usage limits
PLAN_LIMITS: dict[PlanType, dict[str, int]] = {
    PlanType.free: {"api_calls": 100, "storage_mb": 100},
    PlanType.starter: {"api_calls": 5000, "storage_mb": 1000},
    PlanType.pro: {"api_calls": 50000, "storage_mb": 10000},
    PlanType.enterprise: {"api_calls": 500000, "storage_mb": 100000},
}


async def get_or_create_stripe_customer(user: User) -> str:
    if user.stripe_customer_id:
        return user.stripe_customer_id
    customer = stripe.Customer.create(
        email=user.email,
        name=user.full_name,
        metadata={"user_id": str(user.id)},
    )
    return customer.id


async def create_checkout_session(user: User, price_id: str, db: AsyncSession) -> str:
    customer_id = await get_or_create_stripe_customer(user)
    if not user.stripe_customer_id:
        user.stripe_customer_id = customer_id
        await db.commit()

    session = stripe.checkout.Session.create(
        customer=customer_id,
        payment_method_types=["card"],
        mode="subscription",
        subscription_data={"trial_period_days": 14},
        line_items=[{"price": price_id, "quantity": 1}],
        success_url=f"{settings.FRONTEND_URL}/billing?success=true",
        cancel_url=f"{settings.FRONTEND_URL}/billing?canceled=true",
        metadata={"user_id": str(user.id)},
    )
    return session.url


async def create_billing_portal(user: User) -> str:
    customer_id = await get_or_create_stripe_customer(user)
    session = stripe.billing_portal.Session.create(
        customer=customer_id,
        return_url=f"{settings.FRONTEND_URL}/billing",
    )
    return session.url


async def handle_webhook_event(payload: bytes, sig_header: str, db: AsyncSession) -> None:
    try:
        event = stripe.Webhook.construct_event(payload, sig_header, settings.STRIPE_WEBHOOK_SECRET)
    except (ValueError, stripe.SignatureVerificationError):
        raise ValueError("Invalid webhook signature")

    event_type = event["type"]
    data = event["data"]["object"]

    if event_type in ("customer.subscription.created", "customer.subscription.updated"):
        await _upsert_subscription(data, db)
    elif event_type == "customer.subscription.deleted":
        await _cancel_subscription(data, db)
    elif event_type == "invoice.payment_failed":
        logger.warning("Payment failed for customer %s", data.get("customer"))


async def _upsert_subscription(sub_data: dict, db: AsyncSession) -> None:
    customer_id = sub_data["customer"]
    result = await db.execute(select(User).where(User.stripe_customer_id == customer_id))
    user = result.scalar_one_or_none()
    if not user:
        logger.warning("No user found for Stripe customer %s", customer_id)
        return

    price_id = sub_data["items"]["data"][0]["price"]["id"] if sub_data.get("items") else None
    plan = PRICE_TO_PLAN.get(price_id, PlanType.free) if price_id else PlanType.free
    status_str = sub_data.get("status", "incomplete")

    # Update user plan
    user.plan = plan

    # Update usage limits for new plan
    limits = PLAN_LIMITS.get(plan, PLAN_LIMITS[PlanType.free])
    for record in user.usage_records:
        if record.metric_name in limits:
            record.limit_value = limits[record.metric_name]

    # Upsert subscription record
    result = await db.execute(select(Subscription).where(Subscription.user_id == user.id))
    subscription = result.scalar_one_or_none()

    period_start = (
        datetime.fromtimestamp(sub_data["current_period_start"], tz=timezone.utc)
        if sub_data.get("current_period_start")
        else None
    )
    period_end = (
        datetime.fromtimestamp(sub_data["current_period_end"], tz=timezone.utc)
        if sub_data.get("current_period_end")
        else None
    )

    if subscription:
        subscription.stripe_subscription_id = sub_data["id"]
        subscription.stripe_price_id = price_id
        subscription.status = SubscriptionStatus(status_str)
        subscription.current_period_start = period_start
        subscription.current_period_end = period_end
        subscription.cancel_at_period_end = str(sub_data.get("cancel_at_period_end", False)).lower()
    else:
        db.add(Subscription(
            user_id=user.id,
            stripe_subscription_id=sub_data["id"],
            stripe_price_id=price_id,
            status=SubscriptionStatus(status_str),
            current_period_start=period_start,
            current_period_end=period_end,
            cancel_at_period_end=str(sub_data.get("cancel_at_period_end", False)).lower(),
        ))

    db.add(ActivityLog(
        user_id=user.id,
        action="plan_upgrade",
        detail=f"Subscription updated to {plan.value} ({status_str})",
    ))
    await db.commit()


async def _cancel_subscription(sub_data: dict, db: AsyncSession) -> None:
    result = await db.execute(
        select(Subscription).where(Subscription.stripe_subscription_id == sub_data["id"])
    )
    subscription = result.scalar_one_or_none()
    if not subscription:
        return

    subscription.status = SubscriptionStatus.canceled

    # Downgrade user to free
    result = await db.execute(select(User).where(User.id == subscription.user_id))
    user = result.scalar_one_or_none()
    if user:
        user.plan = PlanType.free
        limits = PLAN_LIMITS[PlanType.free]
        for record in user.usage_records:
            if record.metric_name in limits:
                record.limit_value = limits[record.metric_name]
        db.add(ActivityLog(
            user_id=user.id,
            action="plan_downgrade",
            detail="Subscription canceled, downgraded to free",
        ))

    await db.commit()
