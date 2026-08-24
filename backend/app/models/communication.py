"""Communication training domain: sessions and per-user skill profile.

Raw microphone audio is never stored — only transcripts and derived metrics
(spec §22, §18).
"""
from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import JSON, DateTime, Integer, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from ..db.session import Base


def _uuid() -> uuid.UUID:
    return uuid.uuid4()


class CommunicationSession(Base):
    __tablename__ = "communication_sessions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(String(64), index=True)
    mode: Mapped[str] = mapped_column(String(40), default="free")
    skill: Mapped[str] = mapped_column(String(60), default="clarity")
    duration_seconds: Mapped[int] = mapped_column(Integer, default=0)
    overall_score: Mapped[int | None] = mapped_column(nullable=True)
    skills: Mapped[dict | None] = mapped_column(JSON, nullable=True)  # category scores
    strengths: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    weaknesses: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    evidence: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    next_exercise: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    transcript: Mapped[str | None] = mapped_column(nullable=True)  # text only, no audio
    metrics: Mapped[dict | None] = mapped_column(JSON, nullable=True)  # derived signals
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
