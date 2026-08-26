"""Outbound email service for Inter AI.

Architecture (Phase 8 of the onboarding spec):
  - `generate_welcome_email(...)` — pure template function returning
    {subject, html, text}. No I/O, fully unit-testable.
  - `send_email_sync(...)` — blocking SMTP send. Raises EmailSendError unless
    the provider ACCEPTS the message. The caller (onboarding completion
    endpoint) owns idempotency: the `welcome_email_sent` flag is set strictly
    AFTER delivery is confirmed.

Credentials come exclusively from backend env (SMTP_USER / SMTP_PASSWORD);
the sender identity is ADMIN_EMAIL (falling back to SMTP_USER). Nothing here
is ever exposed to the frontend.
"""
from __future__ import annotations

import logging
import smtplib
import threading
from dataclasses import dataclass
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.utils import formataddr

from .config import get_settings

logger = logging.getLogger("interviai.email")


class EmailSendError(RuntimeError):
    """Raised when the SMTP provider does not accept the message."""


@dataclass(frozen=True)
class EmailMessage:
    subject: str
    html: str
    text: str


def _escape(value: str) -> str:
    """Minimal HTML escaping for user-provided values inside the template."""
    return (
        value.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


def generate_welcome_email(*, user_name: str | None, dashboard_url: str) -> EmailMessage:
    """Reusable branded welcome template. Inline CSS only — email clients
    strip <style> blocks. Table-based layout for Outlook compatibility."""
    name = _escape((user_name or "there").strip() or "there")
    url = dashboard_url.rstrip("/")

    subject = "Welcome to Inter AI — You're Successfully Onboarded!"

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{subject}</title>
</head>
<body style="margin:0;padding:0;background:#f1f3f9;font-family:'Segoe UI',Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f1f3f9;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(15,23,42,0.08);">
        <!-- Header / brand -->
        <tr><td style="background:#4338ca;padding:28px 40px;text-align:center;">
          <span style="color:#ffffff;font-size:22px;font-weight:800;letter-spacing:0.5px;">Inter&nbsp;<span style="color:#a5b4fc;">AI</span></span>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:36px 40px;">
          <h1 style="margin:0 0 12px;font-size:24px;color:#0f172a;">Congratulations, {name}! 🎉</h1>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#334155;">
            You have successfully logged in and completed your onboarding with <strong>Inter AI</strong>.
          </p>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#334155;">
            Thank you for choosing Inter AI. We are excited to have you with us.
          </p>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#334155;">
            Your account is now ready, and you can access your personalized dashboard and start exploring the platform.
          </p>
          <!-- CTA -->
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr><td align="center" style="padding:0 0 28px;">
              <a href="{url}/dashboard"
                 style="display:inline-block;background:#4338ca;color:#ffffff;text-decoration:none;
                        font-size:15px;font-weight:700;padding:14px 36px;border-radius:999px;">
                Go to Dashboard
              </a>
            </td></tr>
          </table>
          <p style="margin:0 0 8px;font-size:15px;line-height:1.6;color:#334155;">
            If you have any questions or need assistance, just reply to this email — our team will get back to you within <strong>24 hours</strong>.
          </p>
          <p style="margin:0;font-size:15px;line-height:1.6;color:#334155;">
            Thank you for choosing Inter AI.<br>
            Best regards,<br>
            The Inter AI Team
          </p>
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:20px 40px;background:#f8fafc;border-top:1px solid #e2e8f0;">
          <p style="margin:0;font-size:12px;line-height:1.6;color:#94a3b8;text-align:center;">
            You received this email because you created an account at Inter AI.<br>
            © Inter AI · All rights reserved.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>"""

    text = f"""Congratulations, {name}!

You have successfully logged in and completed your onboarding with Inter AI.

Thank you for choosing Inter AI. We are excited to have you with us.

Your account is now ready, and you can access your personalized dashboard and start exploring the platform.

Go to your dashboard: {url}/dashboard

If you have any questions or need assistance, please contact us. Our team will get back to you within 24 hours.

Thank you for choosing Inter AI.

Best regards,
The Inter AI Team
"""
    return EmailMessage(subject=subject, html=html, text=text)


def sender_address() -> str:
    """Sender identity from secure env config — never hardcoded, never client-side."""
    settings = get_settings()
    return settings.admin_email or settings.smtp_user


def send_email_sync(to_email: str, message: EmailMessage) -> None:
    """Blocking send of both HTML + plain-text parts. Raises EmailSendError
    when SMTP is unconfigured or the provider rejects the message."""
    settings = get_settings()
    if not settings.smtp_user or not settings.smtp_password:
        raise EmailSendError("SMTP is not configured (SMTP_USER/SMTP_PASSWORD missing)")

    from_addr = formataddr((settings.email_from_name, sender_address()))

    msg = MIMEMultipart("alternative")
    msg["Subject"] = message.subject
    msg["From"] = from_addr
    msg["To"] = to_email
    # Plain-text fallback first, HTML last (clients render the last part).
    msg.attach(MIMEText(message.text, "plain", "utf-8"))
    msg.attach(MIMEText(message.html, "html", "utf-8"))

    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=30) as server:
            server.starttls()
            server.login(settings.smtp_user, settings.smtp_password)
            server.send_message(msg)
    except EmailSendError:
        raise
    except Exception as exc:  # noqa: BLE001 — normalize all SMTP failures
        raise EmailSendError(str(exc)) from exc


def dispatch_welcome_email(to_email: str, user_name: str | None, on_result) -> threading.Thread:
    """Send the welcome email off the request path.

    `on_result(success: bool)` runs inside the worker thread AFTER delivery is
    confirmed or has failed — the completion endpoint uses it to flip
    `welcome_email_sent` only on success (Phase 10: a failed email must never
    undo onboarding, and must be safely retryable).
    """

    def _run() -> None:
        message = generate_welcome_email(
            user_name=user_name,
            dashboard_url=get_settings().app_url,
        )
        try:
            send_email_sync(to_email, message)
        except EmailSendError as exc:
            # Log securely: no credentials, no stack trace to users.
            logger.error("Welcome email to %s failed: %s", to_email, exc)
            on_result(False)
            return
        on_result(True)

    thread = threading.Thread(target=_run, daemon=True)
    thread.start()
    return thread
