from __future__ import annotations

import asyncio

from app.ai import communication_coach


def test_interview_analysis_uses_question_and_role(monkeypatch) -> None:
    captured: dict[str, str] = {}

    async def fake_generate_structured(prompt: str, *, system: str, use_grounding: bool) -> dict:
        captured["prompt"] = prompt
        captured["system"] = system
        assert use_grounding is False
        return {
            "skills": {key: 80 for key in communication_coach.SCORE_WEIGHTS["interview"]},
            "questionAnswered": True,
            "questionAssessment": "The answer names the outage and recovery steps.",
            "strengths": ["Gave a specific production example."],
            "weaknesses": ["Add the measured impact."],
            "evidence": [],
            "nextExercise": {"skill": "structure", "instruction": "Retry with STAR."},
            "coachMessage": "Good specific example.",
            "betterVersion": "I diagnosed the outage and restored service.",
            "retryPrompt": "Add the measured impact.",
            "nextQuestion": "What did you learn?",
        }

    monkeypatch.setattr(communication_coach, "generate_structured", fake_generate_structured)
    result = asyncio.run(
        communication_coach.analyze_transcript(
            transcript="I diagnosed the outage and restored service.",
            skill_id="interview-communication",
            mode="interview",
            duration_seconds=45,
            question="Tell me about a production incident you handled.",
            target_role="Site Reliability Engineer",
        )
    )

    assert "Tell me about a production incident you handled." in captured["prompt"]
    assert "Site Reliability Engineer" in captured["prompt"]
    assert "untrusted candidate data" in captured["system"]
    assert result["questionAnswered"] is True
    assert result["questionAssessment"] == "The answer names the outage and recovery steps."
