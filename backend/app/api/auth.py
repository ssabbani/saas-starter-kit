from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import (
    create_access_token,
    create_email_token,
    create_refresh_token,
    decode_email_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.models.tracking import ActivityLog, UsageRecord
from app.models.user import User
from app.schemas import (
    LoginRequest,
    PasswordResetConfirm,
    PasswordResetRequest,
    RefreshRequest,
    SignupRequest,
    TokenResponse,
)
from app.services.email_service import (
    send_password_reset_email,
    send_verification_email,
    send_welcome_email,
)

router = APIRouter()

# Free-plan usage limits
FREE_LIMITS = {"api_calls": 100, "storage_mb": 50}


@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def signup(body: SignupRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == body.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    user = User(
        email=body.email,
        password_hash=hash_password(body.password),
        full_name=body.full_name,
        is_email_verified=False,
    )
    db.add(user)
    await db.flush()

    for metric, limit in FREE_LIMITS.items():
        db.add(UsageRecord(user_id=user.id, metric_name=metric, count=0, limit_value=limit))

    db.add(ActivityLog(user_id=user.id, action="signup", detail="Account created"))

    await db.commit()
    await db.refresh(user)

    token = create_email_token(user.email, "verify")
    send_verification_email(user.email, token)

    return TokenResponse(
        access_token=create_access_token(user.id, user.role.value),
        refresh_token=create_refresh_token(user.id),
    )


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is inactive")

    user.last_login_at = datetime.now(timezone.utc)
    db.add(ActivityLog(user_id=user.id, action="login", detail="User login"))
    await db.commit()

    return TokenResponse(
        access_token=create_access_token(user.id, user.role.value),
        refresh_token=create_refresh_token(user.id),
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh(body: RefreshRequest, db: AsyncSession = Depends(get_db)):
    payload = decode_token(body.refresh_token)
    if payload is None or payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    user_id = payload.get("sub")
    result = await db.execute(select(User).where(User.id == int(user_id)))
    user = result.scalar_one_or_none()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive")

    return TokenResponse(
        access_token=create_access_token(user.id, user.role.value),
        refresh_token=create_refresh_token(user.id),
    )


@router.post("/forgot-password")
async def forgot_password(body: PasswordResetRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()
    if user:
        token = create_email_token(user.email, "reset")
        send_password_reset_email(user.email, token)

    return {"message": "If that email exists, a reset link was sent"}


@router.post("/reset-password")
async def reset_password(body: PasswordResetConfirm, db: AsyncSession = Depends(get_db)):
    email = decode_email_token(body.token, "reset")
    if not email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired token")

    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid token")

    user.password_hash = hash_password(body.new_password)
    db.add(ActivityLog(user_id=user.id, action="password_reset", detail="Password reset via email"))
    await db.commit()

    return {"message": "Password updated successfully"}


@router.get("/verify-email")
async def verify_email(token: str = Query(...), db: AsyncSession = Depends(get_db)):
    email = decode_email_token(token, "verify")
    if not email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired token")

    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid token")

    user.is_email_verified = True
    await db.commit()

    send_welcome_email(user.email, user.full_name or user.email)

    return {"message": "Email verified"}
