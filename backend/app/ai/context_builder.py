"""Context Builder for AI Orchestration.

Assembles bounded candidate profile facts, session configuration, target role,
and past turn performance into structured context for the LLM.
"""
from __future__ import annotations

from typing import Any

from .rag_engine import rag_engine


def build_question_context(
    role: str,
    interview_type: str,
    difficulty: str,
    turn_number: int,
    candidate_profile: dict[str, Any] | None = None,
    history: list[dict[str, Any]] | None = None,
) -> str:
    """Build bounded text context for generating the next interview question or follow-up."""
    candidate_profile = candidate_profile or {}
    history = history or []

    skills = ", ".join(candidate_profile.get("skills", [])) or "Standard industry skills"
    title = candidate_profile.get("title", role)
    experience_level = candidate_profile.get("experience_years", "Mid-level")

    history_summary = []
    for turn in history:
        t_num = turn.get("turn_number", 1)
        q = turn.get("question", "")[:200]
        a = (turn.get("answer", "") or "(No answer provided)")[:200]
        score = turn.get("score", 0)
        history_summary.append(f"Turn {t_num} [Score {score}/100]: Q: {q} | A: {a}")

    history_text = "\n".join(history_summary) if history_summary else "No prior turns. This is the first question."

    # RAG Knowledge Retrieval
    query_text = f"{role} {interview_type} {difficulty}"
    rag_chunks = rag_engine.retrieve_context(query_text, topic=interview_type, top_k=2)
    rag_text = "\n".join([f"- [{c['title']}]: {c['content']}" for c in rag_chunks]) if rag_chunks else "N/A"

    return (
        f"Target Role: {role}\n"
        f"Interview Type: {interview_type}\n"
        f"Target Difficulty: {difficulty}\n"
        f"Current Turn: #{turn_number}\n"
        f"Candidate Background: {title} ({experience_level})\n"
        f"Candidate Skills: {skills}\n\n"
        f"Retrieved Authoritative Domain Knowledge:\n{rag_text}\n\n"
        f"Prior Turn History:\n{history_text}\n\n"
        f"Rules: Ask a relevant, realistic question suitable for Turn #{turn_number}. "
        f"If the candidate struggled on prior turns, adjust difficulty dynamically or ask a clarifying follow-up."
    )


def build_evaluation_context(
    role: str,
    difficulty: str,
    question: str,
    answer: str,
    topic: str | None = None,
    candidate_profile: dict[str, Any] | None = None,
) -> str:
    """Build context for evaluating a candidate's answer against the weighted rubric."""
    # RAG Knowledge Retrieval for answer evaluation grounding
    rag_chunks = rag_engine.retrieve_context(f"{topic or role} {question}", topic=topic, top_k=2)
    rag_text = "\n".join([f"- [{c['title']}]: {c['content']}" for c in rag_chunks]) if rag_chunks else "N/A"

    return (
        f"Target Role: {role}\n"
        f"Difficulty: {difficulty}\n"
        f"Question Topic: {topic or 'General Technical'}\n"
        f"Question Asked: {question}\n\n"
        f"Retrieved Reference Standard Concepts:\n{rag_text}\n\n"
        f"Candidate's Answer:\n{answer}\n\n"
        "Evaluate strictly and objectively across all 7 weighted rubric categories:\n"
        "1. Technical Accuracy & Depth (weight: 30%)\n"
        "2. Communication & Structure (weight: 20%)\n"
        "3. Problem Solving & Logic (weight: 15%)\n"
        "4. Answer Relevance (weight: 15%)\n"
        "5. Confidence & Clarity (weight: 10%)\n"
        "6. Spoken/Written Fluency (weight: 5%)\n"
        "7. Grammar & Syntax (weight: 5%)"
    )

