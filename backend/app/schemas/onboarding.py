"""Pydantic contracts for the onboarding wizard and dashboard (rule.md §3:
no raw dicts across the API boundary)."""
from __future__ import annotations

from datetime import date, datetime

from pydantic import BaseModel, Field


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
