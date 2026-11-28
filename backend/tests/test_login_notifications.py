from __future__ import annotations

from types import SimpleNamespace

from fastapi.testclient import TestClient

from app.api import auth as auth_api
from app.core.dependencies import get_current_user
from app.core import email_service
from app.core.email_service import generate_login_notification_email
from app.main import app


def test_login_notification_requires_authentication() -> None:
    with TestClient(app) as client:
        response = client.post("/api/auth/login-notification")

    assert response.status_code in (401, 403)


def test_login_notification_queues_email_for_authenticated_user(monkeypatch) -> None:
    user = {
        "id": "login-alert-user",
        "email": "candidate@example.com",
        "email_verified": True,
        "claims": {
            "uid": "login-alert-user",
            "email": "candidate@example.com",
            "name": "Interview Candidate",
            "auth_time": 1_800_000_000,
        },
    }
    calls: list[dict[str, str | None]] = []
    monkeypatch.setitem(app.dependency_overrides, get_current_user, lambda: user)
    monkeypatch.setattr(
        auth_api,
        "dispatch_login_notification_email",
        lambda **kwargs: calls.append(kwargs),
    )

    with TestClient(app) as client:
        response = client.post("/api/auth/login-notification")

    assert response.status_code == 202
    assert response.json() == {"message": "Login notification email queued."}
    assert calls == [
        {
            "to_email": "candidate@example.com",
            "user_name": "Interview Candidate",
            "login_time": "January 15, 2027 at 08:00 UTC",
        }
    ]


def test_login_notification_email_is_html_and_escapes_user_data() -> None:
    message = generate_login_notification_email(
        user_name="<Candidate>",
        email="candidate&test@example.com",
        login_time="January 15, 2027 at 08:00 UTC",
        app_url="https://intervai.vpnpro.in",
    )

    assert message.subject == "New sign-in to your Interview AI account"
    assert message.html.startswith("<!DOCTYPE html>")
    assert "Hi &lt;Candidate&gt;" in message.html
    assert "candidate&amp;test@example.com" in message.html
    assert "January 15, 2027 at 08:00 UTC" in message.html
    assert "Secure my account" in message.html
    assert "candidate&test@example.com" in message.text


def test_login_notification_sends_html_and_plain_text_parts(monkeypatch) -> None:
    sent_messages = []

    class FakeSMTP:
        def __init__(self, host: str, port: int, timeout: int) -> None:
            assert host == "smtp.example.com"
            assert port == 587
            assert timeout == 30

        def __enter__(self):
            return self

        def __exit__(self, exc_type, exc_value, traceback) -> bool:
            return False

        def starttls(self) -> None:
            pass

        def login(self, username: str, password: str) -> None:
            assert username == "mailer@example.com"
            assert password == "test-password"

        def send_message(self, message) -> None:
            sent_messages.append(message)

    monkeypatch.setattr(
        email_service,
        "get_settings",
        lambda: SimpleNamespace(
            smtp_user="mailer@example.com",
            smtp_password="test-password",
            smtp_host="smtp.example.com",
            smtp_port=587,
            email_from_name="Interview AI",
            app_url="https://intervai.vpnpro.in",
        ),
    )
    monkeypatch.setattr(email_service, "sender_address", lambda: "mailer@example.com")
    monkeypatch.setattr(email_service.smtplib, "SMTP", FakeSMTP)

    thread = email_service.dispatch_login_notification_email(
        to_email="candidate@example.com",
        user_name="Candidate",
        login_time="January 15, 2027 at 08:00 UTC",
    )
    thread.join(timeout=3)

    assert not thread.is_alive()
    assert len(sent_messages) == 1
    mime_message = sent_messages[0]
    assert mime_message.get_content_type() == "multipart/alternative"
    parts = mime_message.get_payload()
    assert [part.get_content_type() for part in parts] == ["text/plain", "text/html"]
    assert "New sign-in" in parts[1].get_payload(decode=True).decode("utf-8")
