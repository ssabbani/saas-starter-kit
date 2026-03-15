"""Tests for /api/billing endpoints (Stripe mocked)."""

from unittest.mock import MagicMock, patch

import pytest
from httpx import AsyncClient


class TestCheckout:
    @patch("app.api.billing.stripe_service")
    async def test_create_checkout(self, mock_stripe, client: AsyncClient, test_user, auth_headers):
        mock_stripe.create_checkout_session.return_value = "https://checkout.stripe.com/test"
        mock_stripe.get_or_create_stripe_customer.return_value = "cus_test123"

        res = await client.post(
            "/api/billing/checkout",
            headers=auth_headers,
            json={"price_id": "price_starter_monthly"},
        )
        assert res.status_code == 200
        assert "checkout_url" in res.json()


class TestPortal:
    @patch("app.api.billing.stripe_service")
    async def test_billing_portal(self, mock_stripe, client: AsyncClient, test_user, auth_headers, db):
        # Set stripe_customer_id on user
        test_user.stripe_customer_id = "cus_test123"
        db.add(test_user)
        await db.commit()

        mock_stripe.create_billing_portal.return_value = "https://billing.stripe.com/test"

        res = await client.post("/api/billing/portal", headers=auth_headers)
        assert res.status_code == 200
        assert "url" in res.json()


class TestWebhook:
    @patch("app.api.billing.stripe_service")
    @patch("app.api.billing.stripe")
    async def test_webhook_subscription_created(
        self, mock_stripe_lib, mock_stripe_svc, client: AsyncClient
    ):
        event = MagicMock()
        event.type = "customer.subscription.created"
        event.data.object = {
            "id": "sub_test",
            "customer": "cus_test",
            "status": "active",
            "items": {"data": [{"price": {"id": "price_pro_monthly"}}]},
            "current_period_start": 1700000000,
            "current_period_end": 1702592000,
            "cancel_at_period_end": False,
        }

        mock_stripe_lib.Webhook.construct_event.return_value = event
        mock_stripe_svc.handle_webhook_event.return_value = None

        res = await client.post(
            "/api/billing/webhooks/stripe",
            content=b'{"test": true}',
            headers={
                "stripe-signature": "t=123,v1=fake",
                "content-type": "application/json",
            },
        )
        assert res.status_code == 200
