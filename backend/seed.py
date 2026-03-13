"""Seed script — run with: python seed.py (from the backend directory)."""

import asyncio
from datetime import datetime, timedelta, timezone

from sqlalchemy import select

from app.core.database import async_session, engine, Base
from app.core.security import hash_password
from app.models import User, Subscription, UsageRecord, ActivityLog
from app.models.user import UserRole, PlanType
from app.models.subscription import SubscriptionStatus


async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as db:
        existing = await db.execute(select(User).where(User.email == "admin@saaskit.com"))
        if existing.scalar_one_or_none():
            print("Database already seeded.")
            return

        now = datetime.now(timezone.utc)

        # Super admin
        admin = User(
            email="admin@saaskit.com",
            password_hash=hash_password("admin123"),
            full_name="Super Admin",
            role=UserRole.super_admin,
            is_email_verified=True,
            plan=PlanType.enterprise,
            trial_ends_at=None,
        )
        # Sample user 1 — starter plan
        user1 = User(
            email="alice@example.com",
            password_hash=hash_password("password123"),
            full_name="Alice Johnson",
            role=UserRole.user,
            is_email_verified=True,
            plan=PlanType.starter,
            trial_ends_at=None,
        )
        # Sample user 2 — free / trialing
        user2 = User(
            email="bob@example.com",
            password_hash=hash_password("password123"),
            full_name="Bob Smith",
            role=UserRole.user,
            plan=PlanType.free,
            trial_ends_at=now + timedelta(days=14),
        )

        db.add_all([admin, user1, user2])
        await db.flush()

        # Subscriptions
        db.add(
            Subscription(
                user_id=user1.id,
                status=SubscriptionStatus.active,
                current_period_start=now,
                current_period_end=now + timedelta(days=30),
            )
        )
        db.add(
            Subscription(
                user_id=user2.id,
                status=SubscriptionStatus.trialing,
                current_period_start=now,
                current_period_end=now + timedelta(days=14),
            )
        )

        # Usage records
        db.add_all([
            UsageRecord(user_id=user1.id, metric_name="api_calls", count=142, limit_value=1000),
            UsageRecord(user_id=user1.id, metric_name="storage_mb", count=56, limit_value=500),
            UsageRecord(user_id=user2.id, metric_name="api_calls", count=8, limit_value=100),
        ])

        # Activity logs
        db.add_all([
            ActivityLog(user_id=admin.id, action="login", detail="Initial admin login"),
            ActivityLog(user_id=user1.id, action="plan_upgrade", detail="Upgraded from free to starter"),
            ActivityLog(user_id=user1.id, action="login", detail="Regular login"),
            ActivityLog(user_id=user2.id, action="signup", detail="Account created"),
        ])

        await db.commit()
        print("Seeded: 3 users, 2 subscriptions, 3 usage records, 4 activity logs.")


if __name__ == "__main__":
    asyncio.run(seed())
