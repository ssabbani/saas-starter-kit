"""Tests for /api/auth endpoints."""

from unittest.mock import patch

import pytest
from httpx import AsyncClient


@pytest.fixture(autouse=True)
def mock_email():
    """Prevent real emails during tests."""
    with patch("app.api.auth.email_service") as mock:
        mock.send_verification_email = lambda *a, **kw: None
        mock.send_password_reset_email = lambda *a, **kw: None
        mock.send_welcome_email = lambda *a, **kw: None
        yield mock


class TestSignup:
    async def test_signup_success(self, client: AsyncClient):
        res = await client.post(
            "/api/auth/signup",
            json={"email": "new@test.com", "password": "securepass1", "full_name": "New User"},
        )
        assert res.status_code == 200
        data = res.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"

    async def test_signup_duplicate_email(self, client: AsyncClient, test_user):
        res = await client.post(
            "/api/auth/signup",
            json={"email": "user@test.com", "password": "securepass1", "full_name": "Dup User"},
        )
        assert res.status_code == 400

    async def test_signup_short_password(self, client: AsyncClient):
        res = await client.post(
            "/api/auth/signup",
            json={"email": "short@test.com", "password": "abc", "full_name": "Short"},
        )
        assert res.status_code == 422


class TestLogin:
    async def test_login_success(self, client: AsyncClient, test_user):
        res = await client.post(
            "/api/auth/login",
            json={"email": "user@test.com", "password": "password123"},
        )
        assert res.status_code == 200
        data = res.json()
        assert "access_token" in data

    async def test_login_wrong_password(self, client: AsyncClient, test_user):
        res = await client.post(
            "/api/auth/login",
            json={"email": "user@test.com", "password": "wrongpassword"},
        )
        assert res.status_code == 401

    async def test_login_nonexistent_user(self, client: AsyncClient):
        res = await client.post(
            "/api/auth/login",
            json={"email": "nobody@test.com", "password": "whatever123"},
        )
        assert res.status_code == 401


class TestTokenRefresh:
    async def test_refresh_token(self, client: AsyncClient, test_user):
        # Login first to get a refresh token
        login_res = await client.post(
            "/api/auth/login",
            json={"email": "user@test.com", "password": "password123"},
        )
        refresh = login_res.json()["refresh_token"]

        res = await client.post("/api/auth/refresh", json={"refresh_token": refresh})
        assert res.status_code == 200
        assert "access_token" in res.json()

    async def test_refresh_invalid_token(self, client: AsyncClient):
        res = await client.post("/api/auth/refresh", json={"refresh_token": "invalid"})
        assert res.status_code == 401


class TestPasswordReset:
    async def test_forgot_password(self, client: AsyncClient, test_user):
        res = await client.post(
            "/api/auth/forgot-password", json={"email": "user@test.com"}
        )
        assert res.status_code == 200

    async def test_forgot_password_unknown_email(self, client: AsyncClient):
        res = await client.post(
            "/api/auth/forgot-password", json={"email": "unknown@test.com"}
        )
        # Should still return 200 to prevent email enumeration
        assert res.status_code == 200

    async def test_reset_password(self, client: AsyncClient, test_user):
        from app.core.security import create_email_token

        token = create_email_token("user@test.com", "password_reset")
        res = await client.post(
            "/api/auth/reset-password",
            json={"token": token, "new_password": "newpassword123"},
        )
        assert res.status_code == 200

        # Login with new password
        login_res = await client.post(
            "/api/auth/login",
            json={"email": "user@test.com", "password": "newpassword123"},
        )
        assert login_res.status_code == 200
