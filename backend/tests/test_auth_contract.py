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


def test_me_requires_token(client: TestClient) -> None:
    assert client.get("/api/auth/me").status_code in (401, 403)


def test_sync_requires_token(client: TestClient) -> None:
    assert client.post("/api/auth/sync").status_code in (401, 403)
