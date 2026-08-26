"""AI resume orchestrator: research -> analyze -> strategy -> generate.

Implements the pipeline required by backend/skills/resume-builder.md.
Research data is never treated as user data; recommended skills are returned
separately and never merged into the user's skill list.
"""
from __future__ import annotations

import json
from pathlib import Path

from .gemini_client import GeminiError, GeminiQuotaError, generate_structured
from .resume_schemas import (
    GenerateRequest,
    GenerateResponse,
    GeneratedContent,
    MarketInsights,
    ResumeStrategy,
)

_SKILL_FILE = Path(__file__).resolve().parents[2] / "skills" / "resume-builder.md"


def _load_system_rules() -> str:
    try:
        return _SKILL_FILE.read_text(encoding="utf-8")
    except OSError:
        return "You are an expert ATS resume writer. Never invent facts. Return JSON only."


def _profile_block(req: GenerateRequest) -> str:
    return json.dumps(
        {
            "targetRole": req.target_role,
            "personalInfo": {
                "fullName": req.full_name,
                "email": req.email,
                "phone": req.phone,
                "location": req.location,
                "linkedin": req.linkedin,
            },
            "skills": req.skills,
            "experience": [e.model_dump() for e in req.experience],
            "projects": [p.model_dump() for p in req.projects],
            "education": [e.model_dump() for e in req.education],
            "candidateSummaryHint": req.summary_hint,
            "jobDescription": req.job_description or None,
        },
        ensure_ascii=False,
    )


async def research_market(req: GenerateRequest) -> MarketInsights:
    """Stage 2: research the target role market with grounded search when available."""
    prompt = (
        "Research the current job market for this target role. "
        "Return JSON with keys: in_demand_skills (list of strings), "
        "ats_keywords (list of strings), sources (list of URLs used).\n\n"
        f"Target role: {req.target_role}\n"
        f"Job description (may be empty): {req.job_description[:2000]}"
    )
    try:
        data = await generate_structured(
            prompt,
            system="You are a labor-market researcher. Use web search grounding when available. Return JSON only.",
            use_grounding=True,
        )
        grounded = True
    except GeminiQuotaError:
        raise
    except GeminiError:
        # Fall back to ungrounded model knowledge so the pipeline still completes.
        data = await generate_structured(
            prompt,
            system="You are a labor-market researcher using your training knowledge. Return JSON only.",
            use_grounding=False,
        )
        grounded = False

    data.setdefault("sources", [])
    if not grounded:
        data["sources"] = []
    return MarketInsights(**{k: data.get(k, []) for k in ("in_demand_skills", "ats_keywords", "missing_skills", "sources")})


async def decide_strategy(req: GenerateRequest, market: MarketInsights) -> ResumeStrategy:
    """Stage 3: choose section order and emphasis from the real profile."""
    prompt = (
        "Decide the best resume structure for this candidate. Base the decision on the "
        "candidate's actual profile (student vs experienced), not a fixed template. "
        "Return JSON with keys: layout (string), section_order (list of section names from: "
        "summary, skills, experience, projects, education, certifications), rationale (string).\n\n"
        f"Candidate profile:\n{_profile_block(req)}\n\n"
        f"Market insights (research data, NOT user data): {market.model_dump_json()}"
    )
    data = await generate_structured(
        prompt,
        system=_load_system_rules(),
        use_grounding=False,
    )
    return ResumeStrategy(**data)


async def generate_resume(req: GenerateRequest, market: MarketInsights, strategy: ResumeStrategy) -> GeneratedContent:
    """Stage 4: write the complete resume from confirmed facts only."""
    prompt = (
        "Generate the complete resume content for this candidate following the strategy. "
        "Rules: use ONLY the candidate's real skills/experience/projects/education; improve wording, "
        "never invent facts, metrics, or skills; recommended market skills must NOT appear in content.skills. "
        "Return JSON with keys: headline, summary, skills (object mapping category -> list of the "
        "candidate's own skills), experience (list of {title, company, dates, bullets}), "
        "projects (list of {name, technologies, description}), education (list of {degree, school, dates}).\n\n"
        f"Candidate profile:\n{_profile_block(req)}\n\n"
        f"Strategy: {strategy.model_dump_json()}\n\n"
        f"Market keywords for phrasing (NOT user skills): {json.dumps(market.ats_keywords[:20])}"
    )
    data = await generate_structured(
        prompt,
        system=_load_system_rules(),
        use_grounding=False,
    )
    return GeneratedContent(**data)


async def run_pipeline(req: GenerateRequest, model_name: str, grounded: bool) -> GenerateResponse:
    """Execute the full AI pipeline and return the validated final resume."""
    market = await research_market(req)
    strategy = await decide_strategy(req, market)
    content = await generate_resume(req, market, strategy)
    return GenerateResponse(strategy=strategy, market=market, content=content, model=model_name, grounded=grounded)
