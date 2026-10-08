"""Phase 4 domain models: Interview turns and report summaries."""
from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from ..db.session import Base


def _uuid() -> uuid.UUID:
    return uuid.uuid4()


class InterviewTurn(Base):
    """A single question-answer exchange within an interview session."""

    __tablename__ = "interview_turns"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    session_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), index=True)
    turn_number: Mapped[int] = mapped_column(Integer, default=1)
    question_text: Mapped[str] = mapped_column(Text)
    topic: Mapped[str | None] = mapped_column(String(120), nullable=True)
    difficulty: Mapped[str] = mapped_column(String(20), default="medium")
    answer_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    score: Mapped[float | None] = mapped_column(Float, nullable=True)
    evaluation_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class InterviewReport(Base):
    """Comprehensive performance report generated upon interview completion."""

    __tablename__ = "interview_reports"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    session_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), unique=True, index=True)
    user_id: Mapped[str] = mapped_column(String(64), index=True)
    overall_score: Mapped[float] = mapped_column(Float, default=0.0)
    
    # Weighted rubric breakdowns
    technical_score: Mapped[float] = mapped_column(Float, default=0.0)  # 30%
    communication_score: Mapped[float] = mapped_column(Float, default=0.0)  # 20%
    problem_solving_score: Mapped[float] = mapped_column(Float, default=0.0)  # 15%
    relevance_score: Mapped[float] = mapped_column(Float, default=0.0)  # 15%
    confidence_score: Mapped[float] = mapped_column(Float, default=0.0)  # 10%
    fluency_score: Mapped[float] = mapped_column(Float, default=0.0)  # 5%
    grammar_score: Mapped[float] = mapped_column(Float, default=0.0)  # 5%

    strengths_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    improvements_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    missed_concepts_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    recommendations_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
