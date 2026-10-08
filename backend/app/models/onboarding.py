"""Phase 2 domain models: education, experience, skills, languages, certificates,
career preferences, and resumable onboarding wizard state. All rows are keyed
to the Firebase uid stored on the candidate profile (rule.md §2)."""
from __future__ import annotations

import uuid
from datetime import date, datetime

from sqlalchemy import Date, DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from ..db.session import Base


def _uuid() -> uuid.UUID:
    return uuid.uuid4()


class Education(Base):
    __tablename__ = "education_entries"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(String(64), index=True)
    school: Mapped[str] = mapped_column(String(200))
    degree: Mapped[str | None] = mapped_column(String(200), nullable=True)
    field_of_study: Mapped[str | None] = mapped_column(String(200), nullable=True)
    qualification_type: Mapped[str | None] = mapped_column(String(50), nullable=True)  # 10th/12th/Diploma/Degree
    score_type: Mapped[str | None] = mapped_column(String(20), nullable=True)  # percentage / cgpa
    score_value: Mapped[float | None] = mapped_column(Float, nullable=True)  # numeric score
    start_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    end_date: Mapped[date | None] = mapped_column(Date, nullable=True)  # null = ongoing
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Experience(Base):
    __tablename__ = "experience_entries"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(String(64), index=True)
    company: Mapped[str] = mapped_column(String(200))
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    years: Mapped[float | None] = mapped_column(Float, nullable=True)  # duration in years
    start_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    end_date: Mapped[date | None] = mapped_column(Date, nullable=True)  # null = current
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Skill(Base):
    __tablename__ = "skills"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(String(64), index=True)
    name: Mapped[str] = mapped_column(String(100))
    level: Mapped[int] = mapped_column(Integer, default=3)  # 1-5 self-assessed
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Language(Base):
    __tablename__ = "languages"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(String(64), index=True)
    name: Mapped[str] = mapped_column(String(100))
    proficiency: Mapped[str] = mapped_column(String(30), default="Intermediate")  # Beginner/Basic/Intermediate/Advanced/Fluent/Professional
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Certificate(Base):
    __tablename__ = "certificates"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(String(64), index=True)
    name: Mapped[str] = mapped_column(String(200))
    link: Mapped[str | None] = mapped_column(String(500), nullable=True)  # URL to certificate
    cert_id: Mapped[str | None] = mapped_column(String(100), nullable=True)  # Certificate ID
    storage_key: Mapped[str | None] = mapped_column(String(500), nullable=True)  # uploaded file key
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class CareerPreference(Base):
    __tablename__ = "career_preferences"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    target_roles: Mapped[str] = mapped_column(Text, default="")  # comma-separated for MVP
    seniority: Mapped[str | None] = mapped_column(String(50), nullable=True)
    preferred_industries: Mapped[str | None] = mapped_column(Text, nullable=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class OnboardingState(Base):
    """Resumable wizard state — a candidate can leave and resume any step."""
    __tablename__ = "onboarding_state"

    user_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    completed_steps: Mapped[str] = mapped_column(Text, default="")  # comma-separated step ids
    current_step: Mapped[int] = mapped_column(Integer, default=0)
    finished: Mapped[bool] = mapped_column(default=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
