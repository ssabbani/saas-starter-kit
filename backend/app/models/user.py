import enum
from datetime import datetime, timedelta, timezone

from sqlalchemy import Boolean, DateTime, Enum, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class UserRole(str, enum.Enum):
    user = "user"
    admin = "admin"
    super_admin = "super_admin"


class PlanType(str, enum.Enum):
    free = "free"
    starter = "starter"
    pro = "pro"
    enterprise = "enterprise"


def _default_trial_end():
    return datetime.now(timezone.utc) + timedelta(days=14)


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), default="")
    avatar_url: Mapped[str] = mapped_column(Text, default="")
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), default=UserRole.user)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_email_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    plan: Mapped[PlanType] = mapped_column(Enum(PlanType), default=PlanType.free)
    stripe_customer_id: Mapped[str | None] = mapped_column(String(255), unique=True, nullable=True)
    trial_ends_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), default=_default_trial_end
    )
    notification_email: Mapped[bool] = mapped_column(Boolean, default=True)
    notification_product: Mapped[bool] = mapped_column(Boolean, default=True)
    theme: Mapped[str] = mapped_column(String(20), default="system")
    api_key: Mapped[str | None] = mapped_column(String(255), unique=True, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    subscription: Mapped["Subscription"] = relationship(
        "Subscription", back_populates="user", uselist=False, lazy="selectin"
    )
    usage_records: Mapped[list["UsageRecord"]] = relationship(
        "UsageRecord", back_populates="user", lazy="selectin"
    )
    activity_logs: Mapped[list["ActivityLog"]] = relationship(
        "ActivityLog", back_populates="user", lazy="selectin"
    )


from .subscription import Subscription  # noqa: E402
from .tracking import UsageRecord, ActivityLog  # noqa: E402
