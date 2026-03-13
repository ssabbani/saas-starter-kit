import math
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import require_admin, require_super_admin
from app.models.subscription import Subscription, SubscriptionStatus
from app.models.tracking import ActivityLog, UsageRecord
from app.models.user import PlanType, User, UserRole
from app.schemas import (
    ActivityResponse,
    AdminStatsResponse,
    AdminUserUpdate,
    SubscriptionResponse,
    UsageResponse,
    UserResponse,
)

router = APIRouter()

PLAN_MRR = {
    PlanType.starter: 19.0,
    PlanType.pro: 49.0,
    PlanType.enterprise: 149.0,
}


@router.get("/stats", response_model=AdminStatsResponse)
async def get_stats(
    _admin=Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    now = datetime.now(timezone.utc)
    first_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    total_users = (await db.execute(select(func.count(User.id)))).scalar() or 0

    active_subs = (await db.execute(
        select(func.count(Subscription.id)).where(
            Subscription.status.in_([SubscriptionStatus.active, SubscriptionStatus.trialing])
        )
    )).scalar() or 0

    # MRR: count active paid users per plan
    mrr = 0.0
    for plan, price in PLAN_MRR.items():
        count = (await db.execute(
            select(func.count(User.id)).where(User.plan == plan).where(
                User.id.in_(
                    select(Subscription.user_id).where(Subscription.status == SubscriptionStatus.active)
                )
            )
        )).scalar() or 0
        mrr += count * price

    trial_users = (await db.execute(
        select(func.count(User.id)).where(
            User.trial_ends_at > now,
            User.plan == PlanType.free,
        )
    )).scalar() or 0

    new_this_month = (await db.execute(
        select(func.count(User.id)).where(User.created_at >= first_of_month)
    )).scalar() or 0

    return AdminStatsResponse(
        total_users=total_users,
        active_subscriptions=active_subs,
        mrr=mrr,
        trial_users=trial_users,
        new_users_this_month=new_this_month,
    )


@router.get("/users")
async def list_users(
    search: Optional[str] = Query(None),
    role: Optional[str] = Query(None),
    plan: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    _admin=Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    query = select(User)
    count_query = select(func.count(User.id))

    if search:
        pattern = f"%{search}%"
        filter_ = or_(User.email.ilike(pattern), User.full_name.ilike(pattern))
        query = query.where(filter_)
        count_query = count_query.where(filter_)
    if role:
        query = query.where(User.role == UserRole(role))
        count_query = count_query.where(User.role == UserRole(role))
    if plan:
        query = query.where(User.plan == PlanType(plan))
        count_query = count_query.where(User.plan == PlanType(plan))
    if is_active is not None:
        query = query.where(User.is_active == is_active)
        count_query = count_query.where(User.is_active == is_active)

    total = (await db.execute(count_query)).scalar() or 0
    pages = math.ceil(total / per_page) if total else 1

    result = await db.execute(
        query.order_by(User.created_at.desc())
        .offset((page - 1) * per_page)
        .limit(per_page)
    )
    users = result.scalars().all()

    return {
        "users": [UserResponse.model_validate(u) for u in users],
        "total": total,
        "page": page,
        "pages": pages,
    }


@router.get("/users/{user_id}")
async def get_user_detail(
    user_id: int,
    _admin=Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    sub_result = await db.execute(select(Subscription).where(Subscription.user_id == user_id))
    subscription = sub_result.scalar_one_or_none()

    usage_result = await db.execute(select(UsageRecord).where(UsageRecord.user_id == user_id))
    usage_records = usage_result.scalars().all()

    activity_result = await db.execute(
        select(ActivityLog)
        .where(ActivityLog.user_id == user_id)
        .order_by(ActivityLog.created_at.desc())
        .limit(20)
    )
    activities = activity_result.scalars().all()

    return {
        "user": UserResponse.model_validate(user),
        "subscription": SubscriptionResponse.model_validate(subscription) if subscription else None,
        "usage": [
            UsageResponse(
                metric_name=r.metric_name,
                count=r.count,
                limit_value=r.limit_value,
                percentage=min((r.count / r.limit_value * 100) if r.limit_value > 0 else 0, 100),
            )
            for r in usage_records
        ],
        "activity": [ActivityResponse.model_validate(a) for a in activities],
    }


@router.patch("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    body: AdminUserUpdate,
    admin=Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    changes = []
    update_data = body.model_dump(exclude_unset=True)

    if "role" in update_data:
        if admin.role.value != "super_admin":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only super_admin can change roles")
        old = user.role.value
        user.role = UserRole(update_data["role"])
        changes.append(f"role: {old} → {update_data['role']}")

    if "plan" in update_data:
        old = user.plan.value
        user.plan = PlanType(update_data["plan"])
        changes.append(f"plan: {old} → {update_data['plan']}")

    if "is_active" in update_data:
        old = user.is_active
        user.is_active = update_data["is_active"]
        changes.append(f"is_active: {old} → {update_data['is_active']}")

    if changes:
        db.add(ActivityLog(
            user_id=user.id,
            action="admin_user_update",
            detail=f"Admin updated: {', '.join(changes)}",
        ))
        await db.commit()
        await db.refresh(user)

    return user


@router.get("/activity")
async def list_activity(
    user_id: Optional[int] = Query(None),
    action: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    _admin=Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    query = select(ActivityLog, User.email.label("user_email")).join(User, ActivityLog.user_id == User.id)
    count_query = select(func.count(ActivityLog.id))

    if user_id:
        query = query.where(ActivityLog.user_id == user_id)
        count_query = count_query.where(ActivityLog.user_id == user_id)
    if action:
        query = query.where(ActivityLog.action == action)
        count_query = count_query.where(ActivityLog.action == action)

    total = (await db.execute(count_query)).scalar() or 0
    pages = math.ceil(total / per_page) if total else 1

    result = await db.execute(
        query.order_by(ActivityLog.created_at.desc())
        .offset((page - 1) * per_page)
        .limit(per_page)
    )
    rows = result.all()

    logs = []
    for log, user_email in rows:
        entry = ActivityResponse.model_validate(log).model_dump()
        entry["user_email"] = user_email
        logs.append(entry)

    return {"logs": logs, "total": total, "page": page, "pages": pages}


@router.get("/subscriptions")
async def list_subscriptions(
    status_filter: Optional[str] = Query(None, alias="status"),
    _admin=Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(Subscription, User.email.label("user_email"), User.full_name.label("user_name"))
        .join(User, Subscription.user_id == User.id)
    )
    count_query = select(func.count(Subscription.id))

    if status_filter:
        query = query.where(Subscription.status == SubscriptionStatus(status_filter))
        count_query = count_query.where(Subscription.status == SubscriptionStatus(status_filter))

    total = (await db.execute(count_query)).scalar() or 0

    result = await db.execute(query.order_by(Subscription.created_at.desc()))
    rows = result.all()

    subs = []
    for sub, user_email, user_name in rows:
        entry = SubscriptionResponse.model_validate(sub).model_dump()
        entry["user_email"] = user_email
        entry["user_name"] = user_name
        subs.append(entry)

    return {"subscriptions": subs, "total": total}
