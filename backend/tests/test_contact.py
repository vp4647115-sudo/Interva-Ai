from __future__ import annotations

from types import SimpleNamespace

from fastapi.testclient import TestClient

from app.api import contact as contact_api
from app.core.email_service import generate_contact_email
from app.main import app


def test_contact_form_queues_notification(monkeypatch) -> None:
    calls: list[dict[str, str]] = []
    monkeypatch.setattr(
        contact_api,
        "get_settings",
        lambda: SimpleNamespace(
            contact_email="support@example.com",
            admin_email="",
            smtp_user="mailer@example.com",
            smtp_password="configured",
        ),
    )
    monkeypatch.setattr(contact_api, "send_contact_email", lambda **kwargs: calls.append(kwargs))

    with TestClient(app) as client:
        response = client.post(
            "/api/contact",
            json={
                "name": "Interview Candidate",
                "email": "candidate@example.com",
                "subject": "Partnership question",
                "message": "I would like to discuss a partnership.",
            },
        )

    assert response.status_code == 202
    assert calls == [
        {
            "to_email": "support@example.com",
            "reply_to": "candidate@example.com",
            "name": "Interview Candidate",
            "email": "candidate@example.com",
            "subject": "Partnership question",
            "message": "I would like to discuss a partnership.",
        }
    ]


def test_contact_form_rejects_missing_smtp_configuration(monkeypatch) -> None:
    monkeypatch.setattr(
        contact_api,
        "get_settings",
        lambda: SimpleNamespace(contact_email="", admin_email="", smtp_user="", smtp_password=""),
    )
    with TestClient(app) as client:
        response = client.post(
            "/api/contact",
            json={
                "name": "Candidate",
                "email": "candidate@example.com",
                "subject": "Question",
                "message": "This is a contact message.",
            },
        )

    assert response.status_code == 503


def test_contact_form_validates_payload_and_honeypot(monkeypatch) -> None:
    calls: list[dict[str, str]] = []
    monkeypatch.setattr(
        contact_api,
        "get_settings",
        lambda: SimpleNamespace(
            contact_email="support@example.com",
            admin_email="",
            smtp_user="mailer@example.com",
            smtp_password="configured",
        ),
    )
    monkeypatch.setattr(contact_api, "send_contact_email", lambda **kwargs: calls.append(kwargs))

    with TestClient(app) as client:
        invalid = client.post(
            "/api/contact",
            json={"name": "x", "email": "not-an-email", "subject": "", "message": ""},
        )
        spam = client.post(
            "/api/contact",
            json={
                "name": "Bot",
                "email": "bot@example.com",
                "subject": "Spam message",
                "message": "This is a spam submission.",
                "website": "http://example.invalid",
            },
        )

    assert invalid.status_code == 422
    assert spam.status_code == 202
    assert calls == []


def test_contact_email_escapes_user_content() -> None:
    email = generate_contact_email(
        name="<Candidate>",
        email="candidate@example.com",
        subject="Help",
        message="<script>alert(1)</script>",
    )

    assert "&lt;Candidate&gt;" in email.html
    assert "&lt;script&gt;" in email.html
    assert "<script>" not in email.html
