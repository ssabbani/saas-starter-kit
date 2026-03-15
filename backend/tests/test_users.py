"""Tests for /api/users endpoints."""

import pytest
from httpx import AsyncClient


class TestGetMe:
    async def test_get_me(self, client: AsyncClient, test_user, auth_headers):
        res = await client.get("/api/users/me", headers=auth_headers)
        assert res.status_code == 200
        data = res.json()
        assert data["email"] == "user@test.com"
        assert data["full_name"] == "Test User"

    async def test_get_me_unauthenticated(self, client: AsyncClient):
        res = await client.get("/api/users/me")
        assert res.status_code == 403


class TestUpdateProfile:
    async def test_update_profile(self, client: AsyncClient, test_user, auth_headers):
        res = await client.patch(
            "/api/users/me",
            headers=auth_headers,
            json={"full_name": "Updated Name"},
        )
        assert res.status_code == 200
        assert res.json()["full_name"] == "Updated Name"

    async def test_update_theme(self, client: AsyncClient, test_user, auth_headers):
        res = await client.patch(
            "/api/users/me",
            headers=auth_headers,
            json={"theme": "dark"},
        )
        assert res.status_code == 200


class TestChangePassword:
    async def test_change_password(self, client: AsyncClient, test_user, auth_headers):
        res = await client.post(
            "/api/users/me/change-password",
            headers=auth_headers,
            json={"current_password": "password123", "new_password": "newpassword123"},
        )
        assert res.status_code == 200

    async def test_change_password_wrong_current(self, client: AsyncClient, test_user, auth_headers):
        res = await client.post(
            "/api/users/me/change-password",
            headers=auth_headers,
            json={"current_password": "wrongone", "new_password": "newpassword123"},
        )
        assert res.status_code == 400


class TestApiKey:
    async def test_generate_api_key(self, client: AsyncClient, test_user, auth_headers):
        res = await client.post("/api/users/me/generate-api-key", headers=auth_headers)
        assert res.status_code == 200
        data = res.json()
        assert "api_key" in data
        assert data["api_key"].startswith("sk_")


class TestUsageAndActivity:
    async def test_get_usage(self, client: AsyncClient, test_user, auth_headers):
        res = await client.get("/api/users/me/usage", headers=auth_headers)
        assert res.status_code == 200
        data = res.json()
        assert isinstance(data, list)
        assert any(u["metric_name"] == "api_calls" for u in data)

    async def test_get_activity(self, client: AsyncClient, test_user, auth_headers):
        res = await client.get("/api/users/me/activity", headers=auth_headers)
        assert res.status_code == 200
        assert isinstance(res.json(), list)


class TestDeleteAccount:
    async def test_delete_account(self, client: AsyncClient, test_user, auth_headers):
        res = await client.delete("/api/users/me", headers=auth_headers)
        assert res.status_code == 200

        # Should no longer be able to access
        me_res = await client.get("/api/users/me", headers=auth_headers)
        assert me_res.status_code == 401
