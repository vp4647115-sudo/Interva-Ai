"""Contract tests for auth routes (Phase 5 seed — AI structured-output and
auth contracts are tested before UI work proceeds)."""
from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture()
def client() -> TestClient:
    return TestClient(app)


def test_health(client: TestClient) -> None:
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


def test_root_endpoint(client: TestClient) -> None:
    resp = client.get("/")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


def test_me_requires_token(client: TestClient) -> None:
    assert client.get("/api/auth/me").status_code in (401, 403)


def test_sync_requires_token(client: TestClient) -> None:
    assert client.post("/api/auth/sync").status_code in (401, 403)


def test_preflight_allows_production_origin(client: TestClient) -> None:
    response = client.options(
        "/api/auth/sync",
        headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "authorization,content-type",
        },
    )
    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://localhost:3000"
    assert "POST" in response.headers["access-control-allow-methods"]
    assert "Authorization" in response.headers["access-control-allow-headers"]
    assert response.headers["access-control-allow-credentials"] == "true"
    assert response.headers.get_all("access-control-allow-origin") == ["http://localhost:3000"]


def test_error_response_includes_cors_and_rejects_other_origins(client: TestClient) -> None:
    allowed = client.get("/api/auth/me", headers={"Origin": "http://localhost:3000"})
    assert allowed.status_code in (401, 403)
    assert allowed.headers["access-control-allow-origin"] == "http://localhost:3000"

    blocked = client.get("/api/auth/me", headers={"Origin": "https://evil.example.com"})
    assert blocked.status_code in (401, 403)
    assert "access-control-allow-origin" not in blocked.headers
