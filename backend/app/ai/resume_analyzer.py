"""Resume analysis: Gemini extracts structured data from an uploaded resume,
then evaluates it against professional resume standards with evidence-based scores."""
from __future__ import annotations

from typing import Any

from .gemini_client import GeminiError, analyze_document
from .resume_orchestrator import _load_system_rules

MAX_FILE_BYTES = 10 * 1024 * 1024  # 10 MB
ALLOWED_MIME = {
    "application/pdf": ".pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
}

EXTRACTION_SCHEMA_HINT = """Return JSON with this exact shape. Use null for missing single values and [] for missing lists. NEVER invent data:
{
  "personalInfo": {"fullName": null, "email": null, "phone": null, "location": null, "linkedin": null, "github": null, "portfolio": null},
  "summary": null,
  "skills": [],
  "technicalSkills": [],
  "softSkills": [],
  "education": [{"degree": null, "school": null, "dates": null}],
  "experience": [{"title": null, "company": null, "dates": null, "description": null}],
  "projects": [{"name": null, "technologies": null, "description": null}],
  "certifications": [],
  "achievements": []
}"""

ANALYSIS_SCHEMA_HINT = """Return JSON with this exact shape. Scores are integers 0-100 based ONLY on the stated criteria:
{
  "overallScore": 0,
  "categoryScores": {
    "atsCompatibility": 0, "contentQuality": 0, "skillsRelevance": 0,
    "experienceQuality": 0, "projectQuality": 0, "education": 0,
    "professionalSummary": 0, "keywordOptimization": 0, "formatting": 0
  },
  "strengths": [],
  "weaknesses": [{"category": "", "score": 0, "problem": "", "whyItMatters": "", "howToImprove": "", "example": ""}],
  "atsWarnings": [],
  "missingSections": [],
  "keywordSuggestions": [],
  "recommendations": []
}"""


def validate_upload(content_type: str, size: int) -> str:
    """Validate an uploaded resume file; returns the mime type or raises ValueError."""
    if content_type not in ALLOWED_MIME:
        raise ValueError("Unsupported file format. Please upload a PDF or DOCX resume.")
    if size <= 0:
        raise ValueError("The uploaded file is empty.")
    if size > MAX_FILE_BYTES:
        raise ValueError("File is too large. Maximum size is 10 MB.")
    return content_type


async def extract_and_analyze(document_bytes: bytes, mime_type: str) -> dict[str, Any]:
    """Run Gemini extraction + analysis on an uploaded resume. Raises GeminiError on failure."""
    system = _load_system_rules()

    extraction = await analyze_document(
        document_bytes,
        mime_type,
        system=system,
        prompt=(
            "Extract all information from this resume document into the following schema. "
            "Only include information that actually exists in the document — never invent companies, "
            "degrees, certifications, skills, dates, or achievements.\n\n"
            f"{EXTRACTION_SCHEMA_HINT}"
        ),
    )

    analysis = await analyze_document(
        document_bytes,
        mime_type,
        system=system,
        prompt=(
            "Analyze this resume against professional resume standards. Base every score on the "
            "defined criteria (ATS compatibility: standard headings, parseable structure, contact info, "
            "keywords; content quality: specificity, action verbs, measurable outcomes; experience: role "
            "clarity, accomplishments, metrics). For each weak category provide problem, why it matters, "
            "how to improve, and a concrete example improvement.\n\n"
            f"{ANALYSIS_SCHEMA_HINT}"
        ),
    )

    return {"resumeData": extraction, "analysis": analysis}
