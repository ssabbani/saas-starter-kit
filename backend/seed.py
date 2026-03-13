"""Seed script — run with: python seed.py (from the backend directory)."""

import asyncio
import random
from datetime import datetime, timedelta, timezone

from sqlalchemy import select, text

from app.core.database import async_session, engine, Base
from app.core.security import hash_password
from app.models import User, Subscription, UsageRecord, ActivityLog
from app.models.user import UserRole, PlanType
from app.models.subscription import SubscriptionStatus

PLAN_LIMITS = {
    PlanType.free: {"api_calls": 100, "storage_mb": 100},
    PlanType.starter: {"api_calls": 5000, "storage_mb": 1000},
    PlanType.pro: {"api_calls": 50000, "storage_mb": 10000},
    PlanType.enterprise: {"api_calls": 500000, "storage_mb": 100000},
}

SAMPLE_USERS = [
    # (email, full_name, role, plan, verified, active)
    ("admin@saaskit.com", "Super Admin", UserRole.super_admin, PlanType.enterprise, True, True),
    ("alice@example.com", "Alice Johnson", UserRole.user, PlanType.starter, True, True),
    ("bob@example.com", "Bob Smith", UserRole.user, PlanType.free, False, True),
    ("carol@example.com", "Carol Williams", UserRole.user, PlanType.pro, True, True),
    ("dave@example.com", "Dave Brown", UserRole.user, PlanType.starter, True, True),
    ("eve@example.com", "Eve Davis", UserRole.admin, PlanType.enterprise, True, True),
    ("frank@example.com", "Frank Miller", UserRole.user, PlanType.free, True, True),
    ("grace@example.com", "Grace Wilson", UserRole.user, PlanType.pro, True, True),
    ("hank@example.com", "Hank Moore", UserRole.user, PlanType.starter, True, True),
    ("ivy@example.com", "Ivy Taylor", UserRole.user, PlanType.free, False, True),
    ("jack@example.com", "Jack Anderson", UserRole.user, PlanType.pro, True, True),
    ("kate@example.com", "Kate Thomas", UserRole.user, PlanType.enterprise, True, True),
    ("leo@example.com", "Leo Jackson", UserRole.user, PlanType.free, True, True),
    ("mia@example.com", "Mia White", UserRole.user, PlanType.starter, True, True),
    ("nick@example.com", "Nick Harris", UserRole.user, PlanType.free, False, False),
]

ACTIONS = [
    ("signup", "Account created"),
    ("login", "User login"),
    ("login", "User login"),
    ("profile_update", "Profile updated"),
    ("password_change", "Password changed"),
    ("plan_upgrade", "Upgraded plan"),
    ("api_key_generated", "New API key generated"),
    ("login", "User login"),
]


async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as db:
        existing = await db.execute(select(User).where(User.email == "admin@saaskit.com"))
        if existing.scalar_one_or_none():
            print("Database already seeded. Clearing and re-seeding...")
            await db.execute(text("DELETE FROM activity_logs"))
            await db.execute(text("DELETE FROM usage_records"))
            await db.execute(text("DELETE FROM subscriptions"))
            await db.execute(text("DELETE FROM users"))
            await db.commit()

        now = datetime.now(timezone.utc)
        pw = hash_password("password123")
        admin_pw = hash_password("admin123")

        users = []
        for i, (email, name, role, plan, verified, active) in enumerate(SAMPLE_USERS):
            created_ago = timedelta(days=random.randint(1, 90))
            created_at = now - created_ago

            user = User(
                email=email,
                password_hash=admin_pw if role == UserRole.super_admin else pw,
                full_name=name,
                role=role,
                is_email_verified=verified,
                is_active=active,
                plan=plan,
                trial_ends_at=(now + timedelta(days=14)) if plan == PlanType.free else None,
                last_login_at=now - timedelta(hours=random.randint(1, 48)) if active else None,
            )
            db.add(user)
            users.append(user)

        await db.flush()

        # Subscriptions for paid users
        sub_count = 0
        for user in users:
            if user.plan == PlanType.free:
                continue
            status = SubscriptionStatus.active
            if user.plan == PlanType.free:
                status = SubscriptionStatus.trialing
            db.add(Subscription(
                user_id=user.id,
                status=status,
                current_period_start=now - timedelta(days=random.randint(1, 25)),
                current_period_end=now + timedelta(days=random.randint(5, 30)),
            ))
            sub_count += 1

        # Also give trialing sub to a couple of free users
        for user in users:
            if user.plan == PlanType.free and user.is_active and random.random() > 0.5:
                db.add(Subscription(
                    user_id=user.id,
                    status=SubscriptionStatus.trialing,
                    current_period_start=now,
                    current_period_end=now + timedelta(days=14),
                ))
                sub_count += 1

        # Usage records
        usage_count = 0
        for user in users:
            limits = PLAN_LIMITS[user.plan]
            for metric, limit in limits.items():
                count = random.randint(0, limit // 2)
                db.add(UsageRecord(
                    user_id=user.id,
                    metric_name=metric,
                    count=count,
                    limit_value=limit,
                ))
                usage_count += 1

        # Activity logs — varied per user
        log_count = 0
        for user in users:
            num_actions = random.randint(2, len(ACTIONS))
            chosen = random.sample(ACTIONS, num_actions)
            for action, detail in chosen:
                db.add(ActivityLog(
                    user_id=user.id,
                    action=action,
                    detail=detail,
                    ip_address=f"192.168.1.{random.randint(2, 254)}",
                ))
                log_count += 1

        await db.commit()
        print(f"Seeded: {len(users)} users, {sub_count} subscriptions, "
              f"{usage_count} usage records, {log_count} activity logs.")


if __name__ == "__main__":
    asyncio.run(seed())
