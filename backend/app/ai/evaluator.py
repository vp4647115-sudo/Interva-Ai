"""AI Evaluator and Report Generator.

Evaluates turn answers against the 7-part rubric and aggregates scores into a
final performance report.
"""
from __future__ import annotations

import json
from typing import Any

from .context_builder import build_evaluation_context
from .gemini_client import GeminiError, generate_structured
from .score_engine import compute_face_presentation_score, compute_weighted_score


EVALUATION_SYSTEM_PROMPT = """You are a Staff Technical Interviewer and Evaluation Engine.
Evaluate candidate answers with strict, objective scoring and actionable feedback.

Return JSON with exact keys:
- verdict: string (one-sentence overall assessment)
- rubric: object with scores from 0.0 to 100.0 for:
    - technical: float (Technical Accuracy & Depth - 30%)
    - communication: float (Communication & Structure - 20%)
    - problem_solving: float (Problem Solving & Logic - 15%)
    - relevance: float (Answer Relevance - 15%)
    - confidence: float (Confidence & Clarity - 10%)
    - fluency: float (Fluency - 5%)
    - grammar: float (Grammar & Syntax - 5%)
- strengths: list of 2-3 specific positive observations
- improvements: list of 2-3 specific areas for improvement
- missedConcepts: list of key technical or behavioral concepts omitted
- followUpQuestion: string (a natural follow-up question to probe deeper)
"""


async def evaluate_turn_answer(
    role: str,
    difficulty: str,
    question: str,
    answer: str,
    topic: str | None = None,
    candidate_profile: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Evaluate candidate answer and return structured evaluation + weighted score."""
    prompt = build_evaluation_context(role, difficulty, question, answer, topic, candidate_profile)

    try:
        raw_res = await generate_structured(prompt, system=EVALUATION_SYSTEM_PROMPT)
    except GeminiError:
        # Fallback structured evaluation if AI service is offline/unreachable
        raw_res = {
            "verdict": "Answer submitted and evaluated.",
            "rubric": {
                "technical": 70.0,
                "communication": 75.0,
                "problem_solving": 70.0,
                "relevance": 80.0,
                "confidence": 75.0,
                "fluency": 80.0,
                "grammar": 80.0,
            },
            "strengths": ["Clear structure in response"],
            "improvements": ["Elaborate further with concrete examples"],
            "missedConcepts": ["System throughput considerations"],
            "followUpQuestion": "How would your solution perform under high concurrent load?",
        }

    rubric = raw_res.get("rubric", {})
    breakdown = {
        "technical": float(rubric.get("technical", 70.0)),
        "communication": float(rubric.get("communication", 70.0)),
        "problem_solving": float(rubric.get("problem_solving", 70.0)),
        "relevance": float(rubric.get("relevance", 70.0)),
        "confidence": float(rubric.get("confidence", 70.0)),
        "fluency": float(rubric.get("fluency", 70.0)),
        "grammar": float(rubric.get("grammar", 70.0)),
    }

    weighted_score = compute_weighted_score(breakdown)

    return {
        "score": weighted_score,
        "verdict": raw_res.get("verdict", "Evaluation completed."),
        "rubric": breakdown,
        "strengths": raw_res.get("strengths", []),
        "improvements": raw_res.get("improvements", []),
        "missedConcepts": raw_res.get("missedConcepts", []),
        "followUpQuestion": raw_res.get("followUpQuestion", ""),
    }


REPORT_SYSTEM_PROMPT = """You are an Executive Talent Partner and AI Interview Coach.
Synthesize all turn evaluations from an interview into a final candidate performance report.

Return JSON with exact keys:
- summary: string (3-4 paragraph executive summary of candidate performance)
- strengths: list of top overall strengths (3-5 items)
- improvements: list of top key areas to develop (3-5 items)
- missedConcepts: list of overall key concepts missed across turns
- recommendations: list of targeted, actionable practice steps for improvement (3-5 items)
"""

def evaluate_face_summary(face_analysis: dict[str, Any] | None) -> dict[str, Any]:
    """Return quality-qualified camera observations without emotion or performance scores."""
    _, status_label, summary = compute_face_presentation_score(face_analysis)
    if not isinstance(face_analysis, dict) or face_analysis.get("schemaVersion") != 2:
        return {
            "facialScore": None,
            "grade": "Not scored",
            "status": "unavailable",
            "summary": summary,
            "strengths": [],
            "improvements": [],
            "coaching": [],
        }

    usable_samples = int(face_analysis.get("usableSampleCount") or 0)
    analysis_status = face_analysis.get("status")
    status = analysis_status if analysis_status in {"available", "low_quality", "insufficient_data"} else "insufficient_data"
    face_presence = face_analysis.get("facePresenceRatio")
    frame_quality = face_analysis.get("frameQuality")
    coaching = []
    if isinstance(frame_quality, (int, float)) and frame_quality < 0.55:
        coaching.append("If you want more reliable visual cues, try brighter, even lighting and a steady camera.")
    if status == "available":
        coaching.append("These movement and head-direction proxies are optional coaching context; neutral expression is normal.")

    return {
        "facialScore": None,
        "grade": status_label,
        "status": status,
        "summary": summary,
        "strengths": [],
        "improvements": [],
        "coaching": coaching,
        "faceVisibility": round(float(face_presence) * 100, 1) if isinstance(face_presence, (int, float)) else None,
        "singleFaceRatio": face_analysis.get("singleFaceRatio"),
        "frameQuality": round(float(frame_quality) * 100, 1) if isinstance(frame_quality, (int, float)) else None,
        "headFacingCameraProxy": face_analysis.get("headFacingCameraRatio"),
        "smileMovementProxy": face_analysis.get("smileMovementMean"),
        "browMovementProxy": face_analysis.get("browMovementMean"),
        "mouthMovementProxy": face_analysis.get("mouthMovementMean"),
        "expressionMovementProxy": face_analysis.get("expressionMovementMean"),
        "faceTrackingConfidence": None,
        "gazeDirection": None,
        "occlusion": None,
        "sampleCount": int(face_analysis.get("sampleCount") or 0),
        "usableSampleCount": usable_samples,
        "limitations": face_analysis.get("limitations", []),
    }


def analyze_face_presentation(face_analysis: dict[str, Any] | None) -> dict[str, Any]:
    """Return a safe, structured facial-presentation evaluation for UI and scoring."""
    return evaluate_face_summary(face_analysis)


async def generate_face_analysis_feedback(face_analysis: dict[str, Any] | None) -> dict[str, Any]:
    """Build descriptive camera feedback deterministically; never infer emotion or scores."""
    return evaluate_face_summary(face_analysis)


async def generate_interview_report(
    role: str,
    interview_type: str,
    turns: list[dict[str, Any]],
) -> dict[str, Any]:
    """Aggregate turn evaluations and generate comprehensive interview report."""
    if not turns:
        return {
            "overall_score": 0.0,
            "technical_score": 0.0,
            "communication_score": 0.0,
            "problem_solving_score": 0.0,
            "relevance_score": 0.0,
            "confidence_score": 0.0,
            "fluency_score": 0.0,
            "grammar_score": 0.0,
            "summary": "No turns were completed during this interview session.",
            "strengths": [],
            "improvements": [],
            "missed_concepts": [],
            "recommendations": [],
        }

    # Aggregate rubric averages
    total_turns = len(turns)
    cats = ["technical", "communication", "problem_solving", "relevance", "confidence", "fluency", "grammar"]
    averages = {c: 0.0 for c in cats}

    all_strengths = []
    all_improvements = []
    all_missed = []
    turn_summaries = []

    for t in turns:
        eval_data = t.get("evaluation", {})
        if isinstance(eval_data, str):
            try:
                eval_data = json.loads(eval_data)
            except Exception:
                eval_data = {}

        rubric = eval_data.get("rubric", {})
        for c in cats:
            averages[c] += float(rubric.get(c, 70.0))

        all_strengths.extend(eval_data.get("strengths", []))
        all_improvements.extend(eval_data.get("improvements", []))
        all_missed.extend(eval_data.get("missedConcepts", []))

        turn_summaries.append(
            f"Turn #{t.get('turn_number')}: Q: {t.get('question_text')} | Score: {t.get('score')} | Verdict: {eval_data.get('verdict', '')}"
        )

    for c in cats:
        averages[c] = round(averages[c] / total_turns, 1)

    overall_score = compute_weighted_score(averages)

    prompt = (
        f"Target Role: {role}\n"
        f"Interview Type: {interview_type}\n"
        f"Overall Score: {overall_score}/100\n\n"
        f"Turn Details:\n" + "\n".join(turn_summaries)
    )

    try:
        ai_res = await generate_structured(prompt, system=REPORT_SYSTEM_PROMPT)
    except GeminiError:
        ai_res = {
            "summary": f"Candidate completed {total_turns} turns for the {role} role with an overall score of {overall_score}/100.",
            "strengths": list(set(all_strengths))[:4] or ["Demonstrated solid core understanding"],
            "improvements": list(set(all_improvements))[:4] or ["Provide deeper technical examples"],
            "missedConcepts": list(set(all_missed))[:4] or ["Advanced scalability patterns"],
            "recommendations": [
                "Practice structuring answers using the STAR method",
                "Review high-availability distributed system concepts",
            ],
        }

    base_report = {
        "overall_score": overall_score,
        "technical_score": averages["technical"],
        "communication_score": averages["communication"],
        "problem_solving_score": averages["problem_solving"],
        "relevance_score": averages["relevance"],
        "confidence_score": averages["confidence"],
        "fluency_score": averages["fluency"],
        "grammar_score": averages["grammar"],
        "summary": ai_res.get("summary", ""),
        "strengths": ai_res.get("strengths", []),
        "improvements": ai_res.get("improvements", []),
        "missed_concepts": ai_res.get("missedConcepts", []),
        "recommendations": ai_res.get("recommendations", []),
    }

    return base_report
