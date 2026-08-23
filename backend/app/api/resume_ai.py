"""AI resume generation endpoints. POST /api/resume/generate-ai runs the full
research -> analysis -> strategy -> generation pipeline server-side."""
from __future__ import annotations

from fastapi import APIRouter, HTTPException, status

from ..ai import resume_orchestrator
from ..ai.gemini_client import GeminiError
from ..ai.resume_schemas import GenerateRequest, GenerateResponse
from ..core.config import get_settings
from ..core.dependencies import CurrentUser

router = APIRouter(prefix="/api/resume", tags=["resume-ai"])


@router.post("/generate-ai", response_model=GenerateResponse)
async def generate_resume_ai(payload: GenerateRequest, user: CurrentUser) -> GenerateResponse:
    """Run the complete AI pipeline for an authenticated user."""
    settings = get_settings()
    if not settings.gemini_api_key:
        raise HTTPException(
            status.HTTP_503_SERVICE_UNAVAILABLE,
            "AI generation is not configured. Add GEMINI_API_KEY to the backend environment.",
        )
    try:
        return await resume_orchestrator.run_pipeline(
            payload,
            model_name=settings.gemini_model,
            grounded=bool(settings.gemini_api_key),
        )
    except GeminiError as exc:
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, str(exc)) from exc
