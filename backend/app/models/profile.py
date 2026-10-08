"""Candidate profile domain model. Auth identity lives in Supabase — we only
store a profile row keyed to the Supabase user id (rule.md §2: no credential
duplication)."""
from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import JSON, DateTime, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from ..db.session import Base


def _uuid() -> uuid.UUID:
    return uuid.uuid4()


class CandidateProfile(Base):
    __tablename__ = "candidate_profiles"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    supabase_user_id: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    email: Mapped[str] = mapped_column(String(320), index=True)
    full_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    location: Mapped[str | None] = mapped_column(String(200), nullable=True)
    birth_date: Mapped[str | None] = mapped_column(String(20), nullable=True)
    target_role: Mapped[str | None] = mapped_column(String(200), nullable=True)
    bio: Mapped[str | None] = mapped_column(String(2000), nullable=True)
    consent_terms: Mapped[bool] = mapped_column(default=False)
    consent_analytics: Mapped[bool] = mapped_column(default=False)

    # One-time onboarding state — the database is the source of truth; the
    # frontend only reads these flags (never writes them).
    onboarding_completed: Mapped[bool] = mapped_column(default=False, index=True)
    onboarding_completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    onboarding_data: Mapped[dict | None] = mapped_column(JSON, nullable=True)  # email/address/certificate snapshot

    # Welcome email bookkeeping — set only after SMTP accepts the message.
    welcome_email_sent: Mapped[bool] = mapped_column(default=False)
    welcome_email_sent_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    welcome_email_claimed: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
