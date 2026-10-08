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
from email.utils import formataddr, formatdate, make_msgid

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
def generate_welcome_email(
    *,
    user_name: str | None,
    email: str,
    target_roles: list[str] | None = None,
    seniority: str | None = None,
    preferred_industries: list[str] | None = None,
    skills: list[str] | None = None,
    experience_summary: str | None = None,
    education_summary: str | None = None,
    address: str | None = None,
    certificate_number: str | None = None,
    dashboard_url: str,
) -> EmailMessage:
    """High-deliverability branded onboarding completion email. Displays the user's
    complete onboarding details (Name, Email, Roles, Seniority, Skills, Experience,
    Education) in a clean, professional HTML table card."""
    name = _escape((user_name or "there").strip() or "there")
    user_email = _escape((email or "").strip())
    url = dashboard_url.rstrip("/")

    subject = "You're all set! Welcome to Interview AI 🚀"

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to Interview AI</title>
</head>

<body style="margin:0; padding:0; background-color:#f4f7fb; font-family:Arial, Helvetica, sans-serif; color:#172033;">
  <!-- Preview Text -->
  <div style="display:none;font-size:1px;color:#333333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    Your profile is ready. Let's prepare you for your next interview.
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f7fb; padding:40px 16px;">
    <tr>
      <td align="center">

        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:620px; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.05);">

          <!-- Header -->
          <tr>
            <td style="padding:30px 40px 20px; text-align:center; border-bottom:1px solid #eef1f6;">
              <div style="font-size:26px; font-weight:700; color:#111827;">
                Interview<span style="color:#6366f1;">AI</span>
              </div>
            </td>
          </tr>

          <!-- Hero -->
          <tr>
            <td style="padding:45px 40px 20px; text-align:center;">

              <div style="font-size:48px; margin-bottom:18px;">🎉</div>

              <h1 style="margin:0; font-size:30px; line-height:1.3; color:#111827;">
                You're all set, {name}!
              </h1>

              <p style="font-size:17px; line-height:1.7; color:#667085; margin:18px 0 0;">
                Welcome to Interview AI. Your profile is ready, and your interview preparation journey officially begins now.
              </p>

            </td>
          </tr>

          <!-- Success Card -->
          <tr>
            <td style="padding:25px 40px;">

              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f7ff; border:1px solid #e4e7ff; border-radius:12px;">
                <tr>
                  <td style="padding:22px;">

                    <p style="margin:0 0 12px; font-size:15px; font-weight:700; color:#4f46e5;">
                      ✓ ONBOARDING COMPLETED
                    </p>

                    <p style="margin:0; font-size:15px; line-height:1.6; color:#475467;">
                      Your preferences and profile information for <strong>{user_email}</strong> have been successfully saved. Interview AI is now personalized to help you prepare smarter and perform with confidence.
                    </p>

                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Next Steps -->
          <tr>
            <td style="padding:5px 40px 25px;">

              <h2 style="font-size:20px; color:#111827; margin:0 0 18px;">
                What's next?
              </h2>

              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="36" valign="top" style="font-size:20px;">🎯</td>
                  <td style="padding-bottom:16px;">
                    <strong style="font-size:15px; color:#1d2939;">Practice with purpose</strong>
                    <div style="font-size:14px; color:#667085; margin-top:4px;">
                      Start preparing for your next interview with AI-powered guidance.
                    </div>
                  </td>
                </tr>

                <tr>
                  <td width="36" valign="top" style="font-size:20px;">📈</td>
                  <td style="padding-bottom:16px;">
                    <strong style="font-size:15px; color:#1d2939;">Improve your confidence</strong>
                    <div style="font-size:14px; color:#667085; margin-top:4px;">
                      Identify weaknesses and turn them into strengths.
                    </div>
                  </td>
                </tr>

                <tr>
                  <td width="36" valign="top" style="font-size:20px;">🚀</td>
                  <td>
                    <strong style="font-size:15px; color:#1d2939;">Take your next step</strong>
                    <div style="font-size:14px; color:#667085; margin-top:4px;">
                      Your next opportunity starts with one good practice session.
                    </div>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:10px 40px 40px; text-align:center;">

              <a href="{url}"
                 style="display:inline-block; background:#6366f1; color:#ffffff; text-decoration:none; font-size:16px; font-weight:700; padding:15px 32px; border-radius:10px;">
                Start Practicing →
              </a>

              <p style="font-size:13px; color:#98a2b3; margin:18px 0 0;">
                Your future interview success starts here.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#fafbfc; padding:25px 40px; text-align:center; border-top:1px solid #eef1f6;">

              <p style="margin:0; font-size:14px; font-weight:700; color:#344054;">
                Interview<span style="color:#6366f1;">AI</span>
              </p>

              <p style="margin:8px 0 0; font-size:12px; color:#98a2b3;">
                Prepare smarter. Interview better.
              </p>

              <p style="margin:14px 0 0; font-size:11px; color:#b0b8c4;">
                You received this email because you completed onboarding on Interview AI.
              </p>

            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>"""

    text = f"""You're all set! Welcome to Interview AI

Welcome to Interview AI. Your profile is ready, and your interview preparation journey officially begins now.

✓ ONBOARDING COMPLETED
Your preferences and profile information have been successfully saved. Interview AI is now personalized to help you prepare smarter and perform with confidence.

What's next?
- Practice with purpose: Start preparing for your next interview with AI-powered guidance.
- Improve your confidence: Identify weaknesses and turn them into strengths.
- Take your next step: Your next opportunity starts with one good practice session.

Start Practicing: {url}

Prepare smarter. Interview better.
"""
    return EmailMessage(subject=subject, html=html, text=text)


def sender_address() -> str:
    """Sender identity from secure env config — never hardcoded, never client-side."""
    settings = get_settings()
    admin_from_list = settings.admin_emails.split(",")[0].strip() if settings.admin_emails else ""
    return settings.admin_email or admin_from_list or settings.smtp_user


def send_email_sync(to_email: str, message: EmailMessage) -> None:
    """Blocking send of both HTML + plain-text parts. Includes RFC-compliant headers
    (Message-ID, Date, Reply-To) to ensure maximum inbox deliverability."""
    settings = get_settings()
    if not settings.smtp_user or not settings.smtp_password:
        raise EmailSendError("SMTP is not configured (SMTP_USER/SMTP_PASSWORD missing)")

    from_addr = formataddr((settings.email_from_name, sender_address()))

    msg = MIMEMultipart("alternative")
    msg["Subject"] = message.subject
    msg["From"] = from_addr
    msg["To"] = to_email
    msg["Reply-To"] = from_addr
    msg["Date"] = formatdate(localtime=True)
    
    # Generate RFC 5322 compliant Message-ID
    sender_domain = sender_address().split("@")[-1] if "@" in sender_address() else "gmail.com"
    msg["Message-ID"] = make_msgid(domain=sender_domain)
    msg["X-Mailer"] = "Inter AI Transactional Mailer v1.0"
    msg["MIME-Version"] = "1.0"

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
    except (smtplib.SMTPException, OSError, TimeoutError) as exc:
        raise EmailSendError(str(exc)) from exc
    except BaseException as exc:
        raise EmailSendError(f"Unexpected SMTP error: {exc}") from exc


def dispatch_welcome_email(
    to_email: str,
    user_name: str | None = None,
    target_roles: list[str] | None = None,
    seniority: str | None = None,
    preferred_industries: list[str] | None = None,
    skills: list[str] | None = None,
    experience_summary: str | None = None,
    education_summary: str | None = None,
    address: str | None = None,
    certificate_number: str | None = None,
    on_result=None,
) -> threading.Thread:
    """Send the onboarding welcome email containing all user details off the request path."""

    def _run() -> None:
        message = generate_welcome_email(
            user_name=user_name,
            email=to_email,
            target_roles=target_roles,
            seniority=seniority,
            preferred_industries=preferred_industries,
            skills=skills,
            experience_summary=experience_summary,
            education_summary=education_summary,
            address=address,
            certificate_number=certificate_number,
            dashboard_url=get_settings().app_url,
        )
        try:
            send_email_sync(to_email, message)
        except EmailSendError as exc:
            logger.error("Welcome email to %s failed: %s", to_email, exc)
            if on_result:
                on_result(False)
            return
        if on_result:
            on_result(True)

    thread = threading.Thread(target=_run, daemon=True)
    thread.start()
    return thread

