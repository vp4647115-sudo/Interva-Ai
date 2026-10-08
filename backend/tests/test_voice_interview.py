"""Unit and contract tests for voice interview mode and TTS endpoints."""
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


def test_voice_interview_endpoints_require_auth(client: TestClient) -> None:
    """Unauthenticated requests to voice/TTS endpoints must be rejected."""
    assert client.post("/api/interview-engine/tts", json={"text": "Hello"}).status_code in (401, 403)


def test_voice_interview_start_and_tts(client: TestClient) -> None:
    """Authenticated users can start a voice interview and request question TTS audio configuration."""
    def mock_user():
        return {"id": "test-voice-user-123", "email": "voice@example.com", "email_verified": True}

    fastapi_app = app.app if hasattr(app, "app") else app
    fastapi_app.dependency_overrides[get_current_user] = mock_user
    try:
        # 1. Start voice mode interview session
        start_res = client.post(
            "/api/interview-engine/start",
            json={
                "role": "Frontend Developer",
                "interviewType": "technical",
                "difficulty": "medium",
                "durationMinutes": 30,
                "mode": "voice",
            },
        )
        assert start_res.status_code == 201
        start_data = start_res.json()
        assert "sessionId" in start_data
        assert "question" in start_data
        assert start_data["currentTurn"] == 1

        # 2. Test TTS endpoint
        tts_res = client.post(
            "/api/interview-engine/tts",
            json={"text": start_data["question"], "voice": "en-US-Standard-A"},
        )
        assert tts_res.status_code == 200
        tts_data = tts_res.json()
        assert tts_data["success"] is True
        assert tts_data["supported"] is True
        assert tts_data["text"] == start_data["question"]
    finally:
        fastapi_app.dependency_overrides.clear()
