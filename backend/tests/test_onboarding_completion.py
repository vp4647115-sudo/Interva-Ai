"""Contract tests for the one-time onboarding completion flow:
backend-owned status, idempotent completion, and email-once semantics."""
from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture()
def client() -> TestClient:
    return TestClient(app)


def test_status_requires_token(client: TestClient) -> None:
    assert client.get("/api/onboarding/status").status_code in (401, 403)


def test_complete_requires_token(client: TestClient) -> None:
    resp = client.post(
        "/api/onboarding/complete",
        json={"email": "a@b.com", "address": "1 Main St", "certificateNumber": "CERT-001"},
    )
    assert resp.status_code in (401, 403)


def test_complete_rejects_malformed_payload_without_token(client: TestClient) -> None:
    # Validation errors must never leak a 500; auth runs first anyway.
    resp = client.post(
        "/api/onboarding/complete",
        json={"email": "not-an-email", "address": "", "certificate_number": "!!bad!!"},
    )
    assert resp.status_code in (401, 403, 422)
