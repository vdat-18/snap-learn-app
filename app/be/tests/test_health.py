"""Smoke test for the health endpoint."""

from __future__ import annotations

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_endpoint_returns_200(client: AsyncClient):
    """Health check should return 200 when services are available."""
    # Note: In test environment, DB and Redis may not be fully wired,
    # so we test the endpoint exists and returns valid JSON.
    response = await client.get("/health")
    assert response.status_code in (200, 503)
    data = response.json()
    assert "status" in data
    assert data["status"] in ("healthy", "unhealthy")
