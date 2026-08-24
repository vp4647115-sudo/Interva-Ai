"""Resume AI endpoints: analyze uploaded resumes and improve individual sections."""
from __future__ import annotations

from typing import Any

from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status
from pydantic import BaseModel, Field

from ..ai import resume_analyzer
from ..ai.gemini_client import GeminiError, generate_structured
from ..ai.resume_orchestrator import _load_system_rules
from ..core.config import get_settings
from ..core.dependencies import CurrentUser

router = APIRouter(prefix="/api/resume", tags=["resume-ai"])


def _require_gemini() -> None:
    if not get_settings().gemini_api_key:
        raise HTTPException(
            status.HTTP_503_SERVICE_UNAVAILABLE,
            "AI analysis is not configured. Add GEMINI_API_KEY to the backend environment.",
        )


@router.post("/analyze")
async def analyze_resume(
    file: UploadFile = File(...),
    user: CurrentUser = None,
) -> dict[str, Any]:
    """Extract and analyze an uploaded resume with Gemini. No local fake analysis."""
    _require_gemini()
    contents = await file.read()
    try:
        mime = resume_analyzer.validate_upload(file.content_type or "", len(contents))
    except ValueError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(exc)) from exc

    try:
        result = await resume_analyzer.extract_and_analyze(contents, mime)
    except GeminiError as exc:
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, str(exc)) from exc

    analysis = result["analysis"]
    return {
        "success": True,
        "resumeData": result["resumeData"],
        "analysis": analysis,
        "score": analysis.get("overallScore", 0),
        "recommendations": analysis.get("recommendations", []),
    }


class ImproveRequest(BaseModel):
    section: str = Field(min_length=1, max_length=60)
    content: str = Field(min_length=1, max_length=8000)
    targetRole: str = Field(default="", max_length=120)
    jobDescription: str = Field(default="", max_length=6000)


@router.post("/improve")
async def improve_section(payload: ImproveRequest, user: CurrentUser = None) -> dict[str, Any]:
    """Improve one resume section with Gemini while preserving factual content."""
    _require_gemini()
    try:
        data = await generate_structured(
            (
                f"Improve this resume section ({payload.section}) for a {payload.targetRole or 'professional'} role. "
                "Rules: never invent experience, companies, degrees, certifications, metrics, or skills the "
                "candidate does not have; improve wording only; flag anything ambiguous instead of inventing it.\n\n"
                f"Content to improve:\n{payload.content}\n\n"
                + (f"Job description context:\n{payload.jobDescription[:3000]}\n\n" if payload.jobDescription else "")
                + 'Return JSON: {"improvedContent": "", "changes": [], "warnings": []}'
            ),
            system=_load_system_rules(),
        )
    except GeminiError as exc:
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, str(exc)) from exc

    return {
        "success": True,
        "improvedContent": data.get("improvedContent", ""),
        "changes": data.get("changes", []),
        "warnings": data.get("warnings", []),
    }
