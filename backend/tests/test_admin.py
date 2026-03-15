"""Tests for /api/admin endpoints."""

import pytest
from httpx import AsyncClient


class TestAdminStats:
    async def test_admin_stats(self, client: AsyncClient, test_admin, admin_headers):
        res = await client.get("/api/admin/stats", headers=admin_headers)
        assert res.status_code == 200
        data = res.json()
        assert "total_users" in data
        assert "mrr" in data

    async def test_non_admin_rejected(self, client: AsyncClient, test_user, auth_headers):
        res = await client.get("/api/admin/stats", headers=auth_headers)
        assert res.status_code == 403


class TestAdminUsers:
    async def test_list_users(self, client: AsyncClient, test_admin, admin_headers, test_user):
        res = await client.get("/api/admin/users", headers=admin_headers)
        assert res.status_code == 200
        data = res.json()
        assert "users" in data
        assert len(data["users"]) >= 1

    async def test_get_user_detail(self, client: AsyncClient, test_admin, admin_headers, test_user):
        res = await client.get(f"/api/admin/users/{test_user.id}", headers=admin_headers)
        assert res.status_code == 200
        assert res.json()["email"] == "user@test.com"

    async def test_update_user(self, client: AsyncClient, test_admin, admin_headers, test_user):
        res = await client.patch(
            f"/api/admin/users/{test_user.id}",
            headers=admin_headers,
            json={"plan": "pro"},
        )
        assert res.status_code == 200
        assert res.json()["plan"] == "pro"


class TestAdminActivity:
    async def test_list_activity(self, client: AsyncClient, test_admin, admin_headers):
        res = await client.get("/api/admin/activity", headers=admin_headers)
        assert res.status_code == 200
        data = res.json()
        assert "logs" in data
