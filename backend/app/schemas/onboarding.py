"""Pydantic contracts for the onboarding wizard and dashboard (rule.md §3:
no raw dicts across the API boundary)."""
from __future__ import annotations

import re
from datetime import date, datetime

from pydantic import AliasChoices, BaseModel, EmailStr, Field, field_validator


class OnboardingContactIn(BaseModel):
    """Final-step contact details collected at onboarding completion.

    The recipient of the welcome email is NEVER taken from here — it always
    comes from the verified Firebase token server-side (Phase 5/9)."""

    email: EmailStr = Field(max_length=320)
    address: str = Field(min_length=1, max_length=500)
    certificate_number: str | None = Field(default=None, max_length=100)
    certificate_storage_key: str | None = Field(
        default=None,
        max_length=500,
        validation_alias=AliasChoices("certificate_storage_key", "certificateStorageKey"),
    )

    @field_validator("email")
    @classmethod
    def _normalize_email(cls, value: str) -> str:
        return value.strip().lower()

    @field_validator("address")
    @classmethod
    def _strip(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("must not be blank")
        return cleaned

    @field_validator("certificate_number")
    @classmethod
    def _validate_certificate(cls, value: str | None) -> str | None:
        # Alphanumeric with optional dashes/underscores/slashes — blocks
        # injection-style payloads while accepting real certificate formats.
        if value is not None and not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9/_-]*", value):
            raise ValueError("certificate number may contain only letters, digits, - _ /")
        return value

    @field_validator("certificate_storage_key")
    @classmethod
    def _validate_certificate_key(cls, value: str | None) -> str | None:
        if value is not None and not value.startswith("users/"):
            raise ValueError("invalid certificate attachment")
        return value


class OnboardingCompleteIn(OnboardingContactIn):
    """Body for POST /api/onboarding/complete."""


class OnboardingStatusOut(BaseModel):
    """Backend-owned onboarding state — the single source of truth the
    frontend reads after login (never localStorage)."""

    onboarding_completed: bool
    welcome_email_sent: bool
    onboarding_completed_at: datetime | None = None
    welcome_email_claimed: bool = False


class OnboardingCompleteOut(OnboardingStatusOut):
    email_sent_accepted: bool = False  # False => retry will happen; onboarding stays complete


class EducationIn(BaseModel):
    school: str = Field(min_length=1, max_length=200)
    degree: str | None = Field(default=None, max_length=200)
    field_of_study: str | None = Field(default=None, max_length=200)
    start_date: date | None = None
    end_date: date | None = None  # null = ongoing


class EducationOut(EducationIn):
    id: str
    created_at: datetime | None = None


class ExperienceIn(BaseModel):
    company: str = Field(min_length=1, max_length=200)
    title: str = Field(min_length=1, max_length=200)
    description: str | None = None
    years: float | None = Field(default=None, ge=0, le=50)
    start_date: date | None = None
    end_date: date | None = None  # null = current


class ExperienceOut(ExperienceIn):
    id: str
    created_at: datetime | None = None


class SkillIn(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    level: int = Field(default=3, ge=1, le=5)


class SkillOut(SkillIn):
    id: str


class PreferencesIn(BaseModel):
    target_roles: list[str] = []
    seniority: str | None = Field(default=None, max_length=50)
    preferred_industries: list[str] = []


class WizardStateIn(BaseModel):
    completed_steps: list[str] = []
    current_step: int = Field(default=0, ge=0)
    finished: bool = False


class WizardStateOut(WizardStateIn):
    updated_at: datetime | None = None


class CompletionOut(BaseModel):
    completion_percent: int = Field(ge=0, le=100)


class DashboardOut(BaseModel):
    completion_percent: int
    education_count: int
    experience_count: int
    skill_count: int


# Backwards-compatible alias used by auth routes.
OnboardingStatus = OnboardingStatusOut
