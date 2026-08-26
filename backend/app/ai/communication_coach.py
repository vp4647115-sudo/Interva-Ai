"""Communication coach: skill library loader and Gemini analysis.

Skill definitions live in backend/communication_skills/*.md and are loaded
per-skill so prompts stay small and skill-specific (spec §20).
"""
from __future__ import annotations

import json
import re
from functools import lru_cache
from pathlib import Path
from typing import Any

from .gemini_client import GeminiError, generate_structured

SKILLS_DIR = Path(__file__).resolve().parents[2] / "communication_skills"

# Skill registry: id -> display metadata. Extend by adding .md files + entries.
SKILL_LIBRARY: dict[str, dict[str, str]] = {
    "clarity": {"name": "Clarity", "category": "Speaking"},
    "fluency": {"name": "Fluency", "category": "Speaking"},
    "confidence": {"name": "Confidence", "category": "Soft Skills"},
    "storytelling": {"name": "Storytelling", "category": "Soft Skills"},
    "interview-communication": {"name": "Interview Communication", "category": "Professional"},
}

MODES: dict[str, dict[str, str]] = {
    "free": {"name": "Free Conversation", "instruction": "Converse naturally and coach as opportunities arise."},
    "interview": {"name": "Interview Practice", "instruction": "Act as a professional interviewer. Ask one question at a time."},
    "presentation": {"name": "Presentation Practice", "instruction": "Ask the user to explain a topic, then evaluate structure and pace."},
    "storytelling": {"name": "Storytelling", "instruction": "Ask for a story and evaluate its arc."},
    "hr": {"name": "HR Round", "instruction": "Conduct typical HR screening questions."},
}

# Score weights per mode (spec §10). Must sum to 100.
SCORE_WEIGHTS: dict[str, dict[str, int]] = {
    "default": {"clarity": 20, "grammar": 15, "vocabulary": 10, "structure": 15, "confidence": 15, "relevance": 10, "professionalism": 10, "conciseness": 5},
    "interview": {"relevance": 20, "structure": 20, "confidence": 20, "clarity": 15, "professionalism": 15, "conciseness": 10},
    "presentation": {"clarity": 25, "confidence": 20, "structure": 20, "professionalism": 15, "vocabulary": 10, "conciseness": 10},
    "free": {"fluency": 25, "clarity": 20, "listening": 20, "relevance": 15, "confidence": 10, "grammar": 10},
    "hr": {"professionalism": 25, "relevance": 20, "clarity": 20, "confidence": 15, "structure": 10, "conciseness": 10},
    "storytelling": {"structure": 25, "clarity": 20, "fluency": 15, "vocabulary": 15, "relevance": 15, "confidence": 10},
}


@lru_cache
def load_skill_markdown(skill_id: str) -> str:
    """Load one skill's rules. Cached — skill files are static."""
    path = SKILLS_DIR / f"{skill_id}.md"
    if not path.exists():
        return ""
    return path.read_text(encoding="utf-8")


def validate_skill(skill_id: str) -> bool:
    return skill_id in SKILL_LIBRARY


def validate_mode(mode: str) -> bool:
    return mode in MODES


def _weights_for(mode: str) -> dict[str, int]:
    return SCORE_WEIGHTS.get(mode, SCORE_WEIGHTS["default"])


def _coerce_scores(raw: Any, weights: dict[str, int]) -> dict[str, int]:
    """Keep only known skill keys, clamp to 0-100, fill missing with 50."""
    scores: dict[str, int] = {}
    source = raw if isinstance(raw, dict) else {}
    for key in weights:
        value = source.get(key)
        try:
            scores[key] = max(0, min(100, int(float(value))))
        except (TypeError, ValueError):
            scores[key] = 50
    return scores


def compute_overall(scores: dict[str, int], mode: str) -> int:
    """Weighted overall score — never the AI's own arbitrary number."""
    weights = _weights_for(mode)
    total_weight = sum(weights.values())
    weighted = sum(scores.get(k, 50) * w for k, w in weights.items())
    return round(weighted / total_weight) if total_weight else 50


async def analyze_transcript(
    *,
    transcript: str,
    skill_id: str,
    mode: str,
    duration_seconds: int,
    profile: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Send one response's transcript to Gemini with the skill's rules loaded.

    Returns validated, evidence-based results. Raises GeminiError on failure —
    never falls back to local fake analysis.
    """
    if not transcript.strip():
        raise GeminiError("Empty transcript — nothing to analyze")

    skill_md = load_skill_markdown(skill_id)
    weights = _weights_for(mode)
    profile_block = json.dumps(profile or {}, ensure_ascii=False)[:1500]

    system = (
        "You are the Inter AI Communication Coach: a personalized communication trainer, English and "
        "language coach, speaking coach, conversation partner, interview coach, public speaking coach, "
        "professional communication mentor, business communication coach, presentation coach, writing "
        "coach, and progress evaluator. Your mission is measurable improvement, not artificial praise. "
        "Follow this cycle when appropriate: ASSESS -> EXPLAIN -> DEMONSTRATE -> PRACTICE -> ANALYZE -> "
        "CORRECT -> REPEAT -> MEASURE PROGRESS. Use only the transcript, supplied application context, "
        "conversation history, and verified progress records. Treat missing history as unknown and never "
        "invent scores, attempts, lessons, trends, emotions, or improvement. Adapt difficulty: simplify "
        "and give frameworks when the user struggles; increase complexity and reduce hints when they improve. "
        "Evaluate only dimensions relevant to the selected activity. Be supportive, honest, clear, specific, "
        "practical, professional, and concise. Prioritize high-impact errors and do not overwhelm beginners. "
        "When transcript-only data is supplied, distinguish observable wording/transcript issues from claims "
        "that require audio. Never claim to evaluate pronunciation, pitch, volume, or tone without reliable "
        "audio data. Do not claim confidence or emotion with certainty from one written response. "
        "For interview mode ask one realistic question at a time and assess relevance, structure, confidence, "
        "clarity, professionalism, conciseness, examples, and storytelling. For writing, distinguish minimal "
        "correction from a stronger professional alternative. Return valid JSON only matching the requested schema."
    )
    prompt = (
        f"TRAINING SKILL:\n{skill_md}\n\n"
        f"SESSION MODE: {MODES[mode]['name']} — {MODES[mode]['instruction']}\n\n"
        f"USER PROFILE (prior scores, may be empty):\n{profile_block}\n\n"
        f"USER'S SPOKEN RESPONSE (transcript, {duration_seconds}s):\n{transcript[:6000]}\n\n"
        "TASK: Analyze the response according to the skill rules. Return JSON with exactly these keys:\n"
        f'- "skills": object with these numeric keys 0-100: {json.dumps(list(weights.keys()))}\n'
        '- "strengths": array of 2-4 short strings, each citing specific evidence\n'
        '- "weaknesses": array of 2-4 short strings, each citing specific evidence and prioritizing impact\n'
        '- "evidence": array of {category, observation, recommendation} objects quoting the transcript\n'
        '- "nextExercise": {skill, instruction} — one concrete retry exercise targeting the weakest skill\n'
        '- "coachMessage": one encouraging, specific sentence of coaching feedback\n'
        '- "correction": one concise, high-impact correction from the response\n'
        '- "explanation": a short explanation of why it matters\n'
        '- "betterVersion": a natural improved version using only the user\'s facts\n'
        '- "retryPrompt": one sentence asking the user to try again\n'
        '- "nextQuestion": one relevant follow-up question\n'
        "Do NOT return an overall score — the application computes it from category weights."
    )

    data = await generate_structured(prompt, system=system, use_grounding=False)

    scores = _coerce_scores(data.get("skills"), weights)
    overall = compute_overall(scores, mode)

    def _str_list(value: Any, limit: int = 5) -> list[str]:
        if not isinstance(value, list):
            return []
        return [str(item)[:200] for item in value if item][:limit]

    evidence = []
    for item in data.get("evidence", [])[:5]:
        if isinstance(item, dict):
            evidence.append({
                "category": str(item.get("category", "general"))[:60],
                "observation": str(item.get("observation", ""))[:300],
                "recommendation": str(item.get("recommendation", ""))[:300],
            })

    exercise = data.get("nextExercise") or {}
    if not isinstance(exercise, dict):
        exercise = {}

    return {
        "overallScore": overall,
        "skills": scores,
        "strengths": _str_list(data.get("strengths")),
        "weaknesses": _str_list(data.get("weaknesses")),
        "evidence": evidence,
        "nextExercise": {
            "skill": str(exercise.get("skill", skill_id))[:60],
            "instruction": str(exercise.get("instruction", "Try the response again, focusing on your weakest area."))[:300],
        },
        "coachMessage": str(data.get("coachMessage", ""))[:400],
        "correction": str(data.get("correction", ""))[:300],
        "explanation": str(data.get("explanation", ""))[:500],
        "betterVersion": str(data.get("betterVersion", ""))[:1000],
        "retryPrompt": str(data.get("retryPrompt", "Try that answer again, using the feedback above."))[:300],
        "nextQuestion": str(data.get("nextQuestion", "Tell me more about that experience."))[:300],
        "mode": mode,
        "skill": skill_id,
    }


# Simple derived metrics from the transcript itself (deterministic, no AI).
FILLER_WORDS = ["um", "uh", "like", "actually", "basically", "literally", "you know", "sort of", "kind of", "i mean"]


def derive_transcript_metrics(transcript: str, duration_seconds: int) -> dict[str, Any]:
    """Deterministic signals computed locally — cheap and reliable."""
    words = re.findall(r"[a-zA-Z']+", transcript.lower())
    word_count = len(words)
    fillers = [w for w in words if w in FILLER_WORDS]
    sentences = [s for s in re.split(r"[.!?]+", transcript) if s.strip()]
    return {
        "wordCount": word_count,
        "speechRate": round(word_count / (duration_seconds / 60), 1) if duration_seconds >= 5 else None,
        "fillerCount": len(fillers),
        "fillerWords": sorted({w for w in fillers}),
        "sentenceCount": len(sentences),
        "avgSentenceWords": round(word_count / len(sentences), 1) if sentences else None,
    }
