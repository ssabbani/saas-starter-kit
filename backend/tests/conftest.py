"""Shared fixtures for backend tests.

Uses SQLite async (aiosqlite) so tests run without a real Postgres instance.
"""

import os
from unittest.mock import AsyncMock, patch

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

# Override env before any app code runs
os.environ.update(
    {
        "DATABASE_URL": "sqlite+aiosqlite:///./test.db",
        "SECRET_KEY": "test-secret-key-for-ci",
        "ENVIRONMENT": "test",
        "STRIPE_SECRET_KEY": "sk_test_fake",
        "STRIPE_WEBHOOK_SECRET": "whsec_test_fake",
        "RESEND_API_KEY": "re_test_fake",
        "FRONTEND_URL": "http://localhost:3000",
    }
)

from app.core.database import Base  # noqa: E402
from app.core.security import hash_password  # noqa: E402
from app.models.tracking import ActivityLog, UsageRecord  # noqa: E402
from app.models.user import PlanType, User, UserRole  # noqa: E402

TEST_DB_URL = "sqlite+aiosqlite:///./test.db"

engine = create_async_engine(TEST_DB_URL, echo=False)
TestSession = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


@pytest.fixture(autouse=True)
async def setup_db():
    """Create all tables before each test and drop them after."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture
async def db():
    async with TestSession() as session:
        yield session


@pytest.fixture
async def client(db: AsyncSession):
    """AsyncClient wired to the FastAPI app with the test DB session."""
    from app.core.database import get_db
    from main import app

    async def _override_db():
        yield db

    app.dependency_overrides[get_db] = _override_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()


@pytest.fixture
async def test_user(db: AsyncSession) -> User:
    """Insert a regular verified user and return the model."""
    user = User(
        email="user@test.com",
        password_hash=hash_password("password123"),
        full_name="Test User",
        role=UserRole.user,
        plan=PlanType.free,
        is_active=True,
        is_email_verified=True,
    )
    db.add(user)
    await db.flush()

    # Add default usage records
    for metric, limit in [("api_calls", 100), ("storage_mb", 50)]:
        db.add(UsageRecord(user_id=user.id, metric_name=metric, count=0, limit_value=limit))

    await db.commit()
    await db.refresh(user)
    return user


@pytest.fixture
async def test_admin(db: AsyncSession) -> User:
    """Insert a super_admin user."""
    user = User(
        email="admin@test.com",
        password_hash=hash_password("adminpass123"),
        full_name="Admin User",
        role=UserRole.super_admin,
        plan=PlanType.pro,
        is_active=True,
        is_email_verified=True,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@pytest.fixture
def auth_headers(test_user: User) -> dict[str, str]:
    """Bearer token headers for the test_user."""
    from app.core.security import create_access_token

    token = create_access_token(test_user.id, test_user.role.value)
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def admin_headers(test_admin: User) -> dict[str, str]:
    """Bearer token headers for the test_admin."""
    from app.core.security import create_access_token

    token = create_access_token(test_admin.id, test_admin.role.value)
    return {"Authorization": f"Bearer {token}"}
