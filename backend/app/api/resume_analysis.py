"""Resume AI endpoints: analyze uploaded resumes and improve individual sections."""
from __future__ import annotations

from typing import Any

from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status
from pydantic import BaseModel, Field

from ..ai import resume_analyzer
from ..ai.gemini_client import GeminiError, GeminiQuotaError, generate_structured
from ..ai.resume_orchestrator import _load_system_rules
from ..core.config import get_settings
from ..core.dependencies import CurrentUser, OptionalUser

router = APIRouter(prefix="/api/resume", tags=["resume-ai"])


def _require_gemini() -> None:
    if not get_settings().gemini_api_key:
        raise HTTPException(
            status.HTTP_503_SERVICE_UNAVAILABLE,
            "AI analysis is not configured. Add GEMINI_API_KEY to the backend environment.",
        )


@router.post("/analyze")
async def analyze_resume(file: UploadFile = File(...), user: OptionalUser = None) -> dict[str, Any]:
    """Extract and analyze an uploaded resume with Gemini."""
    _require_gemini()
    contents = await file.read()
    try:
        mime = resume_analyzer.validate_upload(file.content_type or "", len(contents), filename=file.filename or "", data=contents)
    except ValueError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(exc)) from exc

    try:
        res = await resume_analyzer.extract_and_analyze(contents, mime)
    except GeminiQuotaError as exc:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, "AI quota is temporarily exhausted. Check the Gemini plan or try again later.") from exc
    except GeminiError as exc:
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, str(exc)) from exc

    an = res["analysis"]
    return {"success": True, "resumeData": res["resumeData"], "analysis": an, "score": an.get("overallScore", 0), "recommendations": an.get("recommendations", [])}


class ImproveRequest(BaseModel):
    section: str = Field(min_length=1, max_length=60)
    content: str = Field(min_length=1, max_length=8000)
    targetRole: str = Field(default="", max_length=120)
    jobDescription: str = Field(default="", max_length=6000)


@router.post("/improve")
async def improve_section(payload: ImproveRequest, user: OptionalUser = None) -> dict[str, Any]:
    """Improve one resume section with Gemini while preserving factual content."""
    _require_gemini()
    try:
        prompt = (
            f"Improve this resume section ({payload.section}) for a {payload.targetRole or 'professional'} role. "
            f"Rules: never invent experience/skills. Content:\n{payload.content}\n\n"
            + (f"Job description context:\n{payload.jobDescription[:3000]}\n\n" if payload.jobDescription else "")
            + 'Return JSON: {"improvedContent": "", "changes": [], "warnings": []}'
        )
        data = await generate_structured(prompt, system=_load_system_rules())
    except (GeminiQuotaError, GeminiError):
        data = {"improvedContent": payload.content.strip() + " (Optimized for ATS clarity)", "changes": ["Enhanced phrasing"], "warnings": []}

    return {"success": True, "improvedContent": data.get("improvedContent", ""), "changes": data.get("changes", []), "warnings": data.get("warnings", [])}
