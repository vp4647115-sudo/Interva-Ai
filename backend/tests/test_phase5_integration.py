"""Phase 5 Integration and Multi-Tenant Security Tests.

Verifies complete registration -> onboarding -> interview session -> turn evaluation -> report generation pipeline,
and asserts strict multi-tenant authorization boundaries (User A cannot access User B's data).
"""
from __future__ import annotations

import asyncio
import pytest
from fastapi.testclient import TestClient

from app.db.session import Base, engine
from app.main import app
from app.core.dependencies import get_current_user


async def _init_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


@pytest.fixture(autouse=True)
def setup_test_db():
    """Ensure database tables exist for test run."""
    asyncio.run(_init_tables())
    yield


@pytest.fixture()
def client() -> TestClient:
    return TestClient(app)


def test_full_interview_pipeline_e2e(client: TestClient) -> None:
    """Verify complete end-to-end interview flow: start -> turn 1 answer -> finish -> report generation."""
    user = {"id": "p5-user-1", "email": "p5_user1@example.com", "email_verified": True}

    fastapi_app = app.app if hasattr(app, "app") else app
    fastapi_app.dependency_overrides[get_current_user] = lambda: user
    try:
        # Step 1: Start Interview Session
        start_res = client.post(
            "/api/interview-engine/start",
            json={
                "role": "Fullstack Software Engineer",
                "interviewType": "technical",
                "difficulty": "medium",
                "durationMinutes": 30,
            },
        )
        assert start_res.status_code == 201
        start_data = start_res.json()
        session_id = start_data["sessionId"]
        assert start_data["currentTurn"] == 1
        assert len(start_data["question"]) > 0

        # Step 2: Submit Turn #1 Answer
        ans_res = client.post(
            f"/api/interview-engine/{session_id}/answer",
            json={
                "turnNumber": 1,
                "answer": "In Fullstack development, React handles dynamic DOM updates while FastAPI processes async HTTP requests.",
            },
        )
        assert ans_res.status_code == 200
        ans_data = ans_res.json()
        assert "evaluation" in ans_data
        assert ans_data["evaluation"]["score"] >= 0

        # Step 3: Finish Interview Session
        finish_res = client.post(f"/api/interview-engine/{session_id}/finish")
        assert finish_res.status_code == 200
        finish_data = finish_res.json()
        assert finish_data["success"] is True
        assert "report" in finish_data
        assert finish_data["report"]["overall_score"] >= 0

        # Step 4: Retrieve Report
        rep_res = client.get(f"/api/interview-engine/{session_id}/report")
        assert rep_res.status_code == 200
        rep_data = rep_res.json()
        assert rep_data["sessionId"] == session_id
        assert "rubricScores" in rep_data
    finally:
        fastapi_app.dependency_overrides.clear()


def test_tenant_data_boundary_security(client: TestClient) -> None:
    """Verify that User B cannot access or modify User A's interview session."""
    user_a = {"id": "user-a-123", "email": "usera@example.com", "email_verified": True}
    user_b = {"id": "user-b-456", "email": "userb@example.com", "email_verified": True}

    fastapi_app = app.app if hasattr(app, "app") else app

    # Step 1: User A creates a session
    fastapi_app.dependency_overrides[get_current_user] = lambda: user_a
    try:
        start_res = client.post(
            "/api/interview-engine/start",
            json={"role": "DevOps Engineer", "interviewType": "technical", "difficulty": "hard"},
        )
        assert start_res.status_code == 201
        session_id = start_res.json()["sessionId"]
    finally:
        fastapi_app.dependency_overrides.clear()

    # Step 2: User B tries to access User A's session -> Must return 403 Forbidden or 404 Not Found
    fastapi_app.dependency_overrides[get_current_user] = lambda: user_b
    try:
        get_res = client.get(f"/api/interview-engine/{session_id}")
        assert get_res.status_code in (403, 404)

        submit_res = client.post(
            f"/api/interview-engine/{session_id}/answer",
            json={"turnNumber": 1, "answer": "Unauthorized attempt"},
        )
        assert submit_res.status_code in (403, 404)

        report_res = client.get(f"/api/interview-engine/{session_id}/report")
        assert report_res.status_code in (403, 404)
    finally:
        fastapi_app.dependency_overrides.clear()
