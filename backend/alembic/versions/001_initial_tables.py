"""Initial tables

Revision ID: 001
Revises:
Create Date: 2026-03-13

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("full_name", sa.String(255), server_default="", nullable=False),
        sa.Column("avatar_url", sa.Text(), server_default="", nullable=False),
        sa.Column(
            "role",
            sa.Enum("user", "admin", "super_admin", name="userrole"),
            server_default="user",
            nullable=False,
        ),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("is_email_verified", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column(
            "plan",
            sa.Enum("free", "starter", "pro", "enterprise", name="plantype"),
            server_default="free",
            nullable=False,
        ),
        sa.Column("stripe_customer_id", sa.String(255), nullable=True),
        sa.Column("trial_ends_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("notification_email", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("notification_product", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("theme", sa.String(20), server_default="system", nullable=False),
        sa.Column("api_key", sa.String(255), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column("last_login_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
        sa.UniqueConstraint("stripe_customer_id"),
        sa.UniqueConstraint("api_key"),
    )
    op.create_index("ix_users_email", "users", ["email"])

    op.create_table(
        "subscriptions",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("stripe_subscription_id", sa.String(255), nullable=True),
        sa.Column("stripe_price_id", sa.String(255), nullable=True),
        sa.Column(
            "status",
            sa.Enum(
                "trialing", "active", "past_due", "canceled", "unpaid", "incomplete",
                name="subscriptionstatus",
            ),
            server_default="trialing",
            nullable=False,
        ),
        sa.Column("current_period_start", sa.DateTime(timezone=True), nullable=True),
        sa.Column("current_period_end", sa.DateTime(timezone=True), nullable=True),
        sa.Column("cancel_at_period_end", sa.String(10), server_default="false", nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("user_id"),
        sa.UniqueConstraint("stripe_subscription_id"),
    )

    op.create_table(
        "usage_records",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("metric_name", sa.String(100), nullable=False),
        sa.Column("count", sa.Integer(), server_default="0", nullable=False),
        sa.Column("limit_value", sa.Integer(), server_default="0", nullable=False),
        sa.Column("reset_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
    )

    op.create_table(
        "activity_logs",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("action", sa.String(100), nullable=False),
        sa.Column("detail", sa.Text(), server_default="", nullable=False),
        sa.Column("ip_address", sa.String(45), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
    )


def downgrade() -> None:
    op.drop_table("activity_logs")
    op.drop_table("usage_records")
    op.drop_table("subscriptions")
    op.drop_table("users")
    op.execute("DROP TYPE IF EXISTS subscriptionstatus")
    op.execute("DROP TYPE IF EXISTS plantype")
    op.execute("DROP TYPE IF EXISTS userrole")
