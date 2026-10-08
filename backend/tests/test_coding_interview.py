"""Unit and contract tests for coding interview mode and code runner endpoints."""
from __future__ import annotations

import asyncio
import pytest
from fastapi.testclient import TestClient

from app.core.code_executor import execute_code_snippet
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


def test_code_runner_endpoints_require_auth(client: TestClient) -> None:
    """Unauthenticated requests to code runner endpoints must be rejected."""
    assert client.post("/api/interview-engine/code-run", json={"code": "print(1)"}).status_code in (401, 403)


@pytest.mark.asyncio
async def test_code_executor_python_execution():
    """Directly test python execution engine and test case runner."""
    code = (
        "def two_sum(nums, target):\n"
        "    seen = {}\n"
        "    for i, n in enumerate(nums):\n"
        "        diff = target - n\n"
        "        if diff in seen:\n"
        "            return [seen[diff], i]\n"
        "        seen[n] = i\n"
        "    return []\n"
    )
    test_cases = [
        {"functionName": "two_sum", "inputs": [[2, 7, 11, 15], 9], "expectedOutput": [0, 1]},
        {"functionName": "two_sum", "inputs": [[3, 2, 4], 6], "expectedOutput": [1, 2]},
    ]
    res = await execute_code_snippet(code, language="python", test_cases=test_cases)
    assert res["success"] is True
    assert len(res["testResults"]) == 2
    assert all(t["passed"] for t in res["testResults"])


def test_authenticated_code_run_endpoint(client: TestClient) -> None:
    """Authenticated users can execute code via the API endpoint."""
    def mock_user():
        return {"id": "test-coder-123", "email": "coder@example.com", "email_verified": True}

    fastapi_app = app.app if hasattr(app, "app") else app
    fastapi_app.dependency_overrides[get_current_user] = mock_user
    try:
        code_str = "def solution(a, b):\n    return a + b\n"
        res = client.post(
            "/api/interview-engine/code-run",
            json={
                "code": code_str,
                "language": "python",
                "testCases": [{"functionName": "solution", "inputs": [2, 3], "expectedOutput": 5}],
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is True
        assert len(data["testResults"]) == 1
        assert data["testResults"][0]["passed"] is True
    finally:
        fastapi_app.dependency_overrides.clear()
