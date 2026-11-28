from __future__ import annotations

import asyncio
from collections.abc import Iterator

import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient
from firebase_admin import auth as firebase_auth
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.core import security
from app.db.session import get_db
from app.main import app
from app.models.onboarding import OnboardingState


@pytest.fixture()
def authenticated_client(
    tmp_path, monkeypatch: pytest.MonkeyPatch
) -> Iterator[tuple[TestClient, list[str]]]:
    database_url = f"sqlite+aiosqlite:///{tmp_path / 'onboarding-flow.db'}"
    engine = create_async_engine(database_url)

    async def create_schema() -> None:
        async with engine.begin() as connection:
            await connection.run_sync(OnboardingState.__table__.create)
        await engine.dispose()

    asyncio.run(create_schema())
    sessions = async_sessionmaker(engine, expire_on_commit=False)

    async def override_get_db():
        async with sessions() as session:
            yield session

    verified_tokens: list[str] = []

    def verify_token(token: str, *, app):
        verified_tokens.append(token)
        return {
            "uid": "firebase-user-123",
            "email": "candidate@example.com",
            "email_verified": True,
        }

    monkeypatch.setattr(security, "get_firebase_admin", lambda: object())
    monkeypatch.setattr(firebase_auth, "verify_id_token", verify_token)
    app.dependency_overrides[get_db] = override_get_db

    try:
        with TestClient(app) as client:
            yield client, verified_tokens
    finally:
        app.dependency_overrides.pop(get_db, None)
        asyncio.run(engine.dispose())


def test_firebase_bearer_token_creates_missing_onboarding_state(
    authenticated_client: tuple[TestClient, list[str]],
) -> None:
    client, verified_tokens = authenticated_client

    response = client.get(
        "/api/onboarding/state",
        headers={"Authorization": "Bearer test-firebase-id-token"},
    )

    assert response.status_code == 200
    assert response.json()["completed_steps"] == []
    assert response.json()["current_step"] == 0
    assert response.json()["finished"] is False
    assert verified_tokens == ["test-firebase-id-token"]


def test_onboarding_state_rejects_missing_bearer_token(
    authenticated_client: tuple[TestClient, list[str]],
) -> None:
    client, verified_tokens = authenticated_client

    response = client.get("/api/onboarding/state")

    assert response.status_code == 401
    assert verified_tokens == []


def test_invalid_firebase_token_returns_generic_unauthorized(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(security, "get_firebase_admin", lambda: object())

    def reject_token(token: str, *, app):
        raise firebase_auth.InvalidIdTokenError("sensitive verifier details")

    monkeypatch.setattr(firebase_auth, "verify_id_token", reject_token)

    with pytest.raises(HTTPException) as error:
        security.verify_firebase_id_token("invalid-token")

    assert error.value.status_code == 401
    assert "sensitive verifier details" not in str(error.value)


def test_firebase_verifier_outage_is_not_misreported_as_unauthorized(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(security, "get_firebase_admin", lambda: object())

    def fail_verifier(token: str, *, app):
        raise firebase_auth.CertificateFetchError(
            "Firebase certificate service unavailable", None
        )

    monkeypatch.setattr(firebase_auth, "verify_id_token", fail_verifier)

    with pytest.raises(firebase_auth.CertificateFetchError):
        security.verify_firebase_id_token("valid-looking-token")
