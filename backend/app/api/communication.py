"""Communication coach endpoints: analyze transcripts, list skills, track progress."""
from __future__ import annotations

import time
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select

from ..ai import communication_coach
from ..ai.communication_coach import MODES, SKILL_LIBRARY
from ..ai.gemini_client import GeminiError
from ..core.config import get_settings
from ..core.dependencies import CurrentUser
from ..db.session import get_db
from ..models.communication import CommunicationSession

router = APIRouter(prefix="/api/communication", tags=["communication"])

_RATE_LIMIT = 30
_RATE_WINDOW_SECONDS = 60
_user_hits: dict[str, list[float]] = {}


def _check_rate_limit(user_id: str) -> None:
    now = time.monotonic()
    hits = [t for t in _user_hits.get(user_id, []) if now - t < _RATE_WINDOW_SECONDS]
    if len(hits) >= _RATE_LIMIT:
        raise HTTPException(status.HTTP_429_TOO_MANY_REQUESTS, "Too many requests. Please wait a moment.")
    hits.append(now)
    _user_hits[user_id] = hits


class AnalyzeRequest(BaseModel):
    transcript: str = Field(min_length=1, max_length=12000)
    skill: str = Field(default="clarity", max_length=60)
    mode: str = Field(default="free", max_length=40)
    durationSeconds: int = Field(default=0, ge=0, le=3600)


@router.get("/skills")
async def list_skills(user: CurrentUser) -> dict[str, Any]:
    """Skill library + training modes. Data-driven from the registry."""
    return {
        "skills": [
            {"id": sid, **meta, "hasTraining": communication_coach.load_skill_markdown(sid) != ""}
            for sid, meta in SKILL_LIBRARY.items()
        ],
        "modes": [{"id": mid, **meta} for mid, meta in MODES.items()],
    }


@router.post("/analyze")
async def analyze_response(payload: AnalyzeRequest, user: CurrentUser, db=Depends(get_db)) -> dict[str, Any]:
    """Analyze one spoken response via Gemini. No local fake analysis."""
    _check_rate_limit(user["id"])
    settings = get_settings()
    if not settings.gemini_api_key:
        raise HTTPException(
            status.HTTP_503_SERVICE_UNAVAILABLE,
            "AI coaching is not configured. Add GEMINI_API_KEY to the backend environment.",
        )
    if not communication_coach.validate_skill(payload.skill):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, f"Unknown skill: {payload.skill}")
    if not communication_coach.validate_mode(payload.mode):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, f"Unknown mode: {payload.mode}")

    metrics = communication_coach.derive_transcript_metrics(payload.transcript, payload.durationSeconds)

    # Load the user's recent scores to personalize coaching.
    recent = (await db.scalars(
        select(CommunicationSession)
        .where(CommunicationSession.user_id == user["id"])
        .order_by(CommunicationSession.created_at.desc())
        .limit(5)
    )).all()
    profile = {
        "recentOverallScores": [s.overall_score for s in recent if s.overall_score is not None],
        "sessionsCompleted": len(recent),
    }

    try:
        result = await communication_coach.analyze_transcript(
            transcript=payload.transcript,
            skill_id=payload.skill,
            mode=payload.mode,
            duration_seconds=payload.durationSeconds,
            profile=profile,
        )
    except GeminiError as exc:
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, str(exc)) from exc

    session = CommunicationSession(
        user_id=user["id"],
        mode=payload.mode,
        skill=payload.skill,
        duration_seconds=payload.durationSeconds,
        overall_score=result["overallScore"],
        skills=result["skills"],
        strengths=result["strengths"],
        weaknesses=result["weaknesses"],
        evidence=result["evidence"],
        next_exercise=result["nextExercise"],
        transcript=payload.transcript[:12000],
        metrics=metrics,
    )
    db.add(session)
    await db.commit()

    return {"success": True, "sessionId": str(session.id), **result, "metrics": metrics}


@router.get("/history")
async def history(user: CurrentUser, db=Depends(get_db)) -> dict[str, Any]:
    """User's session history with progress summary. Text only — no audio stored."""
    sessions = (await db.scalars(
        select(CommunicationSession)
        .where(CommunicationSession.user_id == user["id"])
        .order_by(CommunicationSession.created_at.desc())
        .limit(50)
    )).all()

    scored = [s for s in reversed(sessions) if s.overall_score is not None]
    overall = round(sum(s.overall_score for s in scored) / len(scored)) if scored else None

    # Average per-skill-category scores across sessions.
    skill_totals: dict[str, list[int]] = {}
    for s in scored:
        for k, v in (s.skills or {}).items():
            skill_totals.setdefault(k, []).append(int(v))
    skill_averages = {k: round(sum(v) / len(v)) for k, v in skill_totals.items()}

    strongest = max(skill_averages, key=skill_averages.get) if skill_averages else None
    weakest = min(skill_averages, key=skill_averages.get) if skill_averages else None

    return {
        "sessions": [
            {
                "id": str(s.id),
                "mode": s.mode,
                "skill": s.skill,
                "durationSeconds": s.duration_seconds,
                "overallScore": s.overall_score,
                "createdAt": s.created_at.isoformat() if s.created_at else None,
            }
            for s in sessions
        ],
        "progress": {
            "overallScore": overall,
            "skillAverages": skill_averages,
            "sessionCount": len(sessions),
            "totalSpeakingMinutes": round(sum(s.duration_seconds for s in sessions) / 60),
            "strongestSkill": strongest,
            "weakestSkill": weakest,
            "improvement": (scored[-1].overall_score - scored[0].overall_score) if len(scored) >= 2 else 0,
        },
    }


@router.delete("/history")
async def delete_history(user: CurrentUser, db=Depends(get_db)) -> dict[str, Any]:
    """User-controlled deletion of their communication history (spec §27)."""
    sessions = (await db.scalars(
        select(CommunicationSession).where(CommunicationSession.user_id == user["id"])
    )).all()
    for s in sessions:
        await db.delete(s)
    await db.commit()
    return {"success": True, "deleted": len(sessions)}
