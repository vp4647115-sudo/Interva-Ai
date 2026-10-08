"""Rate-limiting enforcement unit tests."""
from __future__ import annotations

from types import SimpleNamespace

import pytest
from fastapi.testclient import TestClient

from app.api import communication as communication_api
from app.main import app
from app.core.dependencies import get_current_user


@pytest.fixture()
def client() -> TestClient:
    return TestClient(app)


def test_rate_limit_token_generation(client: TestClient, monkeypatch: pytest.MonkeyPatch) -> None:
    """Verify token rate limiting without making requests to Gemini."""
    user = {"id": "rate-limit-test-user", "email": "rate@example.com", "email_verified": True}

    fastapi_app = app.app if hasattr(app, "app") else app
    fastapi_app.dependency_overrides[get_current_user] = lambda: user
    monkeypatch.setattr(communication_api, "get_settings", lambda: SimpleNamespace(gemini_api_key=""))
    try:
        # The limiter runs before provider configuration is checked.
        too_many = False
        for _ in range(125):
            res = client.post("/api/communication/live-token", json={"skill": "clarity"})
            if res.status_code == 429:
                too_many = True
                break
        assert too_many is True
    finally:
        fastapi_app.dependency_overrides.clear()
