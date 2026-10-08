"""Unit and contract tests for /api/communication endpoints."""
from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.core.dependencies import get_current_user


@pytest.fixture()
def client() -> TestClient:
    return TestClient(app)


def test_communication_endpoints_require_auth(client: TestClient) -> None:
    """Unauthenticated requests must be rejected with 401 or 403."""
    assert client.get("/api/communication/skills").status_code in (401, 403)
    assert client.post("/api/communication/analyze", json={"transcript": "Hello"}).status_code in (401, 403)
    assert client.post("/api/communication/live-token", json={"skill": "clarity"}).status_code in (401, 403)
    assert client.post("/api/communication/live-session", json={"userTranscript": "Hello"}).status_code in (401, 403)
    assert client.get("/api/communication/history").status_code in (401, 403)
    assert client.delete("/api/communication/history").status_code in (401, 403)


def test_list_skills_authenticated(client: TestClient) -> None:
    """Authenticated users can retrieve available skills and coaching modes."""
    def mock_user():
        return {"id": "test-user-123", "email": "test@example.com", "email_verified": True}

    fastapi_app = app.app if hasattr(app, "app") else app
    fastapi_app.dependency_overrides[get_current_user] = mock_user
    try:
        res = client.get("/api/communication/skills")
        assert res.status_code == 200
        data = res.json()
        assert "skills" in data
        assert "modes" in data
        assert len(data["skills"]) > 0
        skill_ids = [s["id"] for s in data["skills"]]
        assert "clarity" in skill_ids or "conciseness" in skill_ids
    finally:
        fastapi_app.dependency_overrides.clear()

