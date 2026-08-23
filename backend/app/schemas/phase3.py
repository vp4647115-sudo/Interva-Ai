"""Pydantic contracts for Phase 3 CRUD (rule.md §3)."""
from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


# --- Resumes -----------------------------------------------------------------


class ResumeIn(BaseModel):
    filename: str = Field(min_length=1, max_length=255)
    storage_key: str | None = Field(default=None, max_length=500)
    mime_type: str | None = Field(default=None, max_length=100)
    size_bytes: int | None = Field(default=None, ge=0)


class ResumeUpdate(BaseModel):
    extracted_text: str | None = None
    status: str | None = Field(default=None, pattern="^(uploaded|parsing|parsed|failed)$")


class ResumeOut(ResumeIn):
    id: str
    status: str
    created_at: datetime | None = None


# --- Interview sessions ------------------------------------------------------


class SessionIn(BaseModel):
    role: str = Field(min_length=1, max_length=120)
    interview_type: str = Field(default="behavioral", max_length=40)
    difficulty: str = Field(default="medium", pattern="^(easy|medium|hard)$")
    duration_minutes: int = Field(default=30, ge=5, le=180)


class SessionStatusUpdate(BaseModel):
    status: str = Field(pattern="^(draft|in_progress|completed|abandoned)$")
    score: float | None = Field(default=None, ge=0, le=100)


class SessionOut(SessionIn):
    id: str
    status: str
    score: float | None = None
    started_at: datetime | None = None
    finished_at: datetime | None = None
    created_at: datetime | None = None


# --- Admin question bank -----------------------------------------------------


class QuestionIn(BaseModel):
    question_text: str = Field(min_length=1)
    role: str = Field(min_length=1, max_length=120)
    topic: str | None = Field(default=None, max_length=120)
    category: str | None = Field(default=None, max_length=60)
    difficulty: str = Field(default="medium", pattern="^(easy|medium|hard)$")
    expected_concepts: list[str] = []
    ideal_answer: str | None = None
    evaluation_rubric: str | None = None
    source: str | None = Field(default=None, max_length=200)


class QuestionUpdate(BaseModel):
    question_text: str | None = None
    role: str | None = Field(default=None, max_length=120)
    topic: str | None = Field(default=None, max_length=120)
    category: str | None = Field(default=None, max_length=60)
    difficulty: str | None = Field(default=None, pattern="^(easy|medium|hard)$")
    expected_concepts: list[str] | None = None
    ideal_answer: str | None = None
    evaluation_rubric: str | None = None
    source: str | None = Field(default=None, max_length=200)
    status: str | None = Field(default=None, pattern="^(active|retired)$")


class QuestionOut(QuestionIn):
    id: str
    version: int
    status: str
    created_at: datetime | None = None
    updated_at: datetime | None = None
