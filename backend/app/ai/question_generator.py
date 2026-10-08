"""AI Question Generator for Interview Sessions."""
from __future__ import annotations

from typing import Any

from .context_builder import build_question_context
from .gemini_client import GeminiError, generate_structured


QUESTION_SYSTEM_PROMPT = """You are a Lead Technical Interviewer at a premier technology company.
Generate the next interview question or follow-up question for the candidate.

Return JSON with exact keys:
- question: string (the actual question to ask the candidate)
- topic: string (the main topic or domain category, e.g. System Design, Algorithms, Behavioral, React)
- difficulty: string ("easy", "medium", or "hard")
- lookFors: list of strings (3-4 key concepts or points a top-tier answer should cover)
"""


async def generate_next_question(
    role: str,
    interview_type: str,
    difficulty: str,
    turn_number: int,
    candidate_profile: dict[str, Any] | None = None,
    history: list[dict[str, Any]] | None = None,
) -> dict[str, Any]:
    """Generate the next adaptive interview question."""
    prompt = build_question_context(
        role, interview_type, difficulty, turn_number, candidate_profile, history
    )

    try:
        res = await generate_structured(prompt, system=QUESTION_SYSTEM_PROMPT)
    except GeminiError:
        # Fallback question set if AI service is offline/unreachable
        fallback_questions = {
            1: f"Could you explain your overall approach to designing scalable systems or solutions in your work as a {role}?",
            2: "Walk me through a challenging technical problem you recently solved. What trade-offs did you consider?",
            3: "How do you handle edge cases, testing, and error recovery in production software?",
        }
        res = {
            "question": fallback_questions.get(turn_number, f"Tell me about a complex project you worked on relevant to {role}."),
            "topic": f"{interview_type.capitalize()} Core",
            "difficulty": difficulty,
            "lookFors": ["Clear architecture description", "Trade-off analysis", "Practical problem-solving steps"],
        }

    return {
        "question": res.get("question", f"What is your approach to {role} development?"),
        "topic": res.get("topic", "General"),
        "difficulty": res.get("difficulty", difficulty),
        "lookFors": res.get("lookFors", []),
    }
