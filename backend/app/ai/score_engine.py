"""Score Engine for weighted rubric aggregate.

Rubric Weights:
- Technical: 30%
- Communication: 20%
- Problem Solving: 15%
- Relevance: 15%
- Confidence: 10%
- Fluency: 5%
- Grammar: 5%
"""
from __future__ import annotations

from typing import Any, TypedDict


class RubricBreakdown(TypedDict):
    technical: float
    communication: float
    problem_solving: float
    relevance: float
    confidence: float
    fluency: float
    grammar: float


def clamp(value: float, minimum: float = 0.0, maximum: float = 100.0) -> float:
    """Clamp a numeric value into a bounded range."""
    return max(minimum, min(maximum, value))


def compute_weighted_score(breakdown: RubricBreakdown) -> float:
    """Compute overall 0-100 score from the 7 rubric breakdown scores."""
    total = (
        (breakdown.get("technical", 0.0) * 0.30)
        + (breakdown.get("communication", 0.0) * 0.20)
        + (breakdown.get("problem_solving", 0.0) * 0.15)
        + (breakdown.get("relevance", 0.0) * 0.15)
        + (breakdown.get("confidence", 0.0) * 0.10)
        + (breakdown.get("fluency", 0.0) * 0.05)
        + (breakdown.get("grammar", 0.0) * 0.05)
    )
    return round(max(0.0, min(100.0, total)), 1)


def compute_face_presentation_score(face_analysis: dict[str, Any] | None) -> tuple[None, str, str]:
    """Return descriptive-only status; facial signals are never scored."""
    if not isinstance(face_analysis, dict) or not face_analysis:
        return None, "Not available", "No camera summary was provided; facial presentation was not scored."

    if face_analysis.get("schemaVersion") != 2:
        return None, "Not scored", "Legacy facial metrics are not reported because they included unvalidated emotion and engagement scores."

    if face_analysis.get("status") != "available" or int(face_analysis.get("usableSampleCount") or 0) < 5:
        return None, "Insufficient data", "There were not enough quality-qualified frames for descriptive camera signals. Facial presentation was not scored."

    face_presence = face_analysis.get("facePresenceRatio")
    frame_quality = face_analysis.get("frameQuality")
    details = []
    if isinstance(face_presence, (int, float)):
        details.append(f"Face detected in {round(clamp(float(face_presence), 0.0, 1.0) * 100)}% of sampled frames")
    if isinstance(frame_quality, (int, float)):
        details.append(f"average frame quality was {round(clamp(float(frame_quality), 0.0, 1.0) * 100)}%")
    summary = "; ".join(details) if details else "Quality-qualified camera signals were captured."
    return None, "Not scored", f"{summary}. Movement proxies do not identify emotion or determine interview performance."


def grade_for_score(score: float | None) -> str:
    """Convert a percentage into a letter grade."""
    if score is None:
        return "N/A"
    if score >= 95:
        return "A+"
    if score >= 90:
        return "A"
    if score >= 85:
        return "A-"
    if score >= 80:
        return "B+"
    if score >= 75:
        return "B"
    if score >= 70:
        return "B-"
    if score >= 65:
        return "C+"
    if score >= 60:
        return "C"
    if score >= 50:
        return "C-"
    if score >= 40:
        return "D"
    return "F"
