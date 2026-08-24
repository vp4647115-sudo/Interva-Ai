"""AI endpoints for cover letters, interview practice, and mock interviews.

All intelligence comes from the existing server-side Gemini adapter; no local
fake generation. Every endpoint requires authentication.
"""
from __future__ import annotations

from typing import Any, Literal

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from ..ai.gemini_client import GeminiError, generate_structured
from ..ai.resume_orchestrator import _load_system_rules
from ..core.config import get_settings
from ..core.dependencies import CurrentUser

router = APIRouter(prefix="/api/ai", tags=["ai-tools"])

RESUME_RULES = _load_system_rules()


def _require_gemini() -> None:
    if not get_settings().gemini_api_key:
        raise HTTPException(
            status.HTTP_503_SERVICE_UNAVAILABLE,
            "AI features are not configured. Add GEMINI_API_KEY to the backend environment.",
        )


async def _ai(system: str, prompt: str) -> dict[str, Any]:
    _require_gemini()
    try:
        return await generate_structured(prompt, system=system)
    except GeminiError as exc:
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, str(exc)) from exc


# --- Cover letters -------------------------------------------------------

class CoverLetterRequest(BaseModel):
    jobTitle: str = Field(min_length=1, max_length=160)
    company: str = Field(min_length=1, max_length=160)
    jobDescription: str = Field(default="", max_length=6000)
    candidateName: str = Field(default="", max_length=120)
    skills: list[str] = Field(default_factory=list, max_length=40)
    experience: str = Field(default="", max_length=4000)
    tone: Literal["professional", "enthusiastic", "concise"] = "professional"


@router.post("/cover-letter")
async def generate_cover_letter(payload: CoverLetterRequest, user: CurrentUser) -> dict[str, Any]:
    """Generate a truthful, role-targeted cover letter."""
    result = await _ai(
        RESUME_RULES
        + "\n\nYou are also an expert cover letter writer. Never invent experience, companies, or achievements. Use only the candidate's real information. Return JSON with keys: subject (string), body (string, 3-4 short paragraphs separated by \\n\\n), highlights (list of the candidate's strongest matching points used).",
        (
            f"Write a {payload.tone} cover letter.\n\n"
            f"Job title: {payload.jobTitle}\nCompany: {payload.company}\n"
            f"Candidate name: {payload.candidateName or 'the candidate'}\n"
            f"Candidate skills: {', '.join(payload.skills) or 'not provided'}\n"
            f"Candidate experience summary: {payload.experience or 'not provided'}\n"
            f"Job description: {payload.jobDescription[:3000] or 'not provided'}\n\n"
            "Keep it under 300 words. Reference only real candidate facts."
        ),
    )
    return {"success": True, **result}


# --- Interview Buddy (chat) ---------------------------------------------

class BuddyRequest(BaseModel):
    question: str = Field(min_length=1, max_length=2000)
    targetRole: str = Field(default="", max_length=120)
    history: list[dict[str, str]] = Field(default_factory=list, max_length=20)


@router.post("/interview-buddy")
async def interview_buddy(payload: BuddyRequest, user: CurrentUser) -> dict[str, Any]:
    """Answer an interview-prep question with a model answer and coaching."""
    history_text = "\n".join(
        f"{m.get('role', 'user')}: {m.get('content', '')[:500]}" for m in payload.history[-6:]
    )
    result = await _ai(
        "You are an expert interview coach. Help candidates prepare with honest, practical guidance. "
        "Return JSON with keys: answer (string, clear explanation with an example model answer if the question "
        "is an interview question), tips (list of 2-4 short coaching tips).",
        (
            f"Target role: {payload.targetRole or 'general'}\n"
            f"Conversation so far:\n{history_text or '(new conversation)'}\n\n"
            f"Candidate asks: {payload.question}"
        ),
    )
    return {"success": True, **result}


# --- Mock interviews ----------------------------------------------------

class MockStartRequest(BaseModel):
    role: str = Field(min_length=1, max_length=120)
    difficulty: Literal["easy", "medium", "hard"] = "medium"
    interviewType: Literal["technical", "behavioral", "mixed"] = "technical"


class MockAnswerRequest(BaseModel):
    role: str = Field(min_length=1, max_length=120)
    question: str = Field(min_length=1, max_length=2000)
    answer: str = Field(min_length=1, max_length=6000)
    difficulty: Literal["easy", "medium", "hard"] = "medium"


@router.post("/mock/question")
async def mock_question(payload: MockStartRequest, user: CurrentUser) -> dict[str, Any]:
    """Generate the next mock interview question."""
    result = await _ai(
        "You are a senior technical interviewer. Ask one realistic interview question at a time. "
        "Return JSON with keys: question (string), topic (string), whatWeLookFor (list of 3-5 concepts a strong answer covers).",
        (
            f"Conduct a {payload.difficulty} {payload.interviewType} interview for a {payload.role} position. "
            "Ask the next question. Do not repeat common warm-up questions like 'tell me about yourself' unless this is the first question."
        ),
    )
    return {"success": True, **result}


@router.post("/mock/evaluate")
async def mock_evaluate(payload: MockAnswerRequest, user: CurrentUser) -> dict[str, Any]:
    """Evaluate a candidate's answer with structured, evidence-based feedback."""
    result = await _ai(
        "You are a senior technical interviewer evaluating a candidate's answer. Be fair and specific. "
        "Return JSON with keys: score (integer 0-100), verdict (string, one sentence), "
        "strengths (list of strings), improvements (list of strings), "
        "missedConcepts (list of strings), followUpQuestion (string).",
        (
            f"Role: {payload.role} | Difficulty: {payload.difficulty}\n\n"
            f"Question: {payload.question}\n\n"
            f"Candidate's answer: {payload.answer}\n\n"
            "Score based on correctness, completeness, depth, and communication. "
            "Do not reward buzzwords without substance."
        ),
    )
    return {"success": True, **result}
