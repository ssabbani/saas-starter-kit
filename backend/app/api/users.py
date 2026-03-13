import logging

import stripe
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.security import generate_api_key, hash_password, verify_password
from app.models.subscription import Subscription
from app.models.tracking import ActivityLog, UsageRecord
from app.models.user import User
from app.schemas import (
    ActivityResponse,
    PasswordChange,
    UsageResponse,
    UserResponse,
    UserUpdate,
)

router = APIRouter()
logger = logging.getLogger("uvicorn.error")


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=UserResponse)
async def update_me(
    body: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(current_user, field, value)

    db.add(ActivityLog(user_id=current_user.id, action="profile_update", detail="Profile updated"))
    await db.commit()
    await db.refresh(current_user)
    return current_user


@router.post("/me/change-password")
async def change_password(
    body: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not verify_password(body.current_password, current_user.password_hash):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password is incorrect")

    current_user.password_hash = hash_password(body.new_password)
    db.add(ActivityLog(user_id=current_user.id, action="password_change", detail="Password changed"))
    await db.commit()
    return {"message": "Password changed"}


@router.get("/me/usage", response_model=list[UsageResponse])
async def get_usage(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(UsageRecord).where(UsageRecord.user_id == current_user.id)
    )
    records = result.scalars().all()
    return [
        UsageResponse(
            metric_name=r.metric_name,
            count=r.count,
            limit_value=r.limit_value,
            percentage=min((r.count / r.limit_value * 100) if r.limit_value > 0 else 0, 100),
        )
        for r in records
    ]


@router.get("/me/activity", response_model=list[ActivityResponse])
async def get_activity(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ActivityLog)
        .where(ActivityLog.user_id == current_user.id)
        .order_by(ActivityLog.created_at.desc())
        .limit(50)
    )
    return result.scalars().all()


@router.post("/me/generate-api-key")
async def gen_api_key(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    key = generate_api_key()
    current_user.api_key = key
    db.add(ActivityLog(user_id=current_user.id, action="api_key_generated", detail="New API key generated"))
    await db.commit()
    return {"api_key": key}


@router.delete("/me")
async def delete_account(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    current_user.is_active = False

    # Cancel Stripe subscription if exists
    if current_user.subscription and current_user.subscription.stripe_subscription_id:
        try:
            stripe.Subscription.cancel(current_user.subscription.stripe_subscription_id)
        except stripe.StripeError:
            logger.warning("Failed to cancel Stripe subscription for user %s", current_user.id)

    db.add(ActivityLog(user_id=current_user.id, action="account_deleted", detail="Account soft-deleted"))
    await db.commit()
    return {"message": "Account deleted"}
