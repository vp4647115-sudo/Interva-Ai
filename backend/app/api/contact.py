"""Public contact form endpoint."""
from __future__ import annotations

import logging

from fastapi import APIRouter, BackgroundTasks, HTTPException, status
from pydantic import BaseModel, EmailStr, Field, field_validator

from ..core.config import get_settings
from ..core.email_service import send_contact_email

logger = logging.getLogger("interviai.contact")
router = APIRouter(prefix="/api/contact", tags=["contact"])


class ContactRequest(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    subject: str = Field(min_length=3, max_length=150)
    message: str = Field(min_length=10, max_length=5000)
    website: str = Field(default="", max_length=200)

    @field_validator("name", "subject", "message")
    @classmethod
    def normalize_text(cls, value: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise ValueError("This field cannot be blank")
        return normalized

    @field_validator("subject")
    @classmethod
    def reject_subject_control_characters(cls, value: str) -> str:
        if any(ord(character) < 32 for character in value):
            raise ValueError("Subject cannot contain control characters")
        return value


@router.post("", status_code=status.HTTP_202_ACCEPTED)
async def submit_contact_message(
    payload: ContactRequest,
    background_tasks: BackgroundTasks,
) -> dict[str, str]:
    if payload.website:
        return {"message": "Thank you. Your message has been received."}

    settings = get_settings()
    recipient = settings.contact_email or settings.admin_email or settings.smtp_user
    if not recipient or not settings.smtp_user or not settings.smtp_password:
        logger.error("Contact form submission rejected because SMTP recipient/configuration is missing")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Contact form is temporarily unavailable. Please email our support address.",
        )

    background_tasks.add_task(
        send_contact_email,
        to_email=recipient,
        reply_to=str(payload.email),
        name=payload.name,
        email=str(payload.email),
        subject=payload.subject,
        message=payload.message,
    )
    return {"message": "Thank you. Your message has been received."}
