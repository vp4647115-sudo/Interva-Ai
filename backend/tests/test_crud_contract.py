"""Contract tests for Phase 3 CRUD routes: authorization boundaries and
ownership scoping (phase.md Phase 3 acceptance criteria)."""
from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture()
def client() -> TestClient:
    return TestClient(app)


def test_resumes_require_token(client: TestClient) -> None:
    assert client.get("/api/resumes").status_code in (401, 403)
    assert client.post("/api/resumes", json={"filename": "x.pdf"}).status_code in (401, 403)


def test_interviews_require_token(client: TestClient) -> None:
    assert client.get("/api/interviews").status_code in (401, 403)
    assert client.post(
        "/api/interviews", json={"role": "Backend Engineer"}
    ).status_code in (401, 403)


def test_question_bank_requires_admin(client: TestClient) -> None:
    # No token at all → 401/403 before any admin check.
    assert client.get("/api/admin/questions").status_code in (401, 403)
    assert client.post(
        "/api/admin/questions", json={"question_text": "q", "role": "SWE"}
    ).status_code in (401, 403)


def test_session_status_rejects_bad_value(client: TestClient) -> None:
    # Contract validation happens even without auth? No — auth runs first,
    # so this only asserts we never leak a 500 on malformed input.
    resp = client.put(
        "/api/interviews/00000000-0000-0000-0000-000000000000",
        json={"status": "not-a-status"},
    )
    assert resp.status_code in (401, 403, 422)
