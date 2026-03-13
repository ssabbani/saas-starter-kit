from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


# Auth
class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    full_name: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str = Field(min_length=8)


# User
class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    avatar_url: str
    role: str
    plan: str
    is_email_verified: bool
    stripe_customer_id: Optional[str] = None
    trial_ends_at: Optional[datetime] = None
    created_at: datetime
    last_login_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    notification_email: Optional[bool] = None
    notification_product: Optional[bool] = None
    theme: Optional[str] = None


class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8)


# Billing
class CheckoutRequest(BaseModel):
    price_id: str


class CheckoutResponse(BaseModel):
    checkout_url: str


class SubscriptionResponse(BaseModel):
    id: int
    status: str
    stripe_subscription_id: Optional[str] = None
    stripe_price_id: Optional[str] = None
    current_period_start: Optional[datetime] = None
    current_period_end: Optional[datetime] = None
    cancel_at_period_end: str

    model_config = {"from_attributes": True}


# Usage / Activity
class UsageResponse(BaseModel):
    metric_name: str
    count: int
    limit_value: int
    percentage: float


class ActivityResponse(BaseModel):
    id: int
    action: str
    detail: str
    created_at: datetime

    model_config = {"from_attributes": True}


# Admin
class AdminUserUpdate(BaseModel):
    role: Optional[str] = None
    plan: Optional[str] = None
    is_active: Optional[bool] = None


class AdminStatsResponse(BaseModel):
    total_users: int
    active_subscriptions: int
    mrr: float
    trial_users: int
    new_users_this_month: int
