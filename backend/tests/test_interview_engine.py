"""Tests for Phase 4 Interview Engine state machine and score engine."""
from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.ai.score_engine import RubricBreakdown, compute_weighted_score
from app.ai.evaluator import analyze_face_presentation, evaluate_face_summary
from app.main import app


@pytest.fixture()
def client() -> TestClient:
    return TestClient(app)


def test_score_engine_weighted_math() -> None:
    """Verify that rubric breakdown accurately calculates weighted scores.
    
    Weights:
    Technical 30%, Communication 20%, Problem Solving 15%, Relevance 15%,
    Confidence 10%, Fluency 5%, Grammar 5%.
    """
    perfect: RubricBreakdown = {
        "technical": 100.0,
        "communication": 100.0,
        "problem_solving": 100.0,
        "relevance": 100.0,
        "confidence": 100.0,
        "fluency": 100.0,
        "grammar": 100.0,
    }
    assert compute_weighted_score(perfect) == 100.0

    mixed: RubricBreakdown = {
        "technical": 80.0,      # 24.0
        "communication": 90.0,  # 18.0
        "problem_solving": 70.0,# 10.5
        "relevance": 80.0,      # 12.0
        "confidence": 60.0,     # 6.0
        "fluency": 100.0,       # 5.0
        "grammar": 100.0,       # 5.0
    }
    # Expected: 24.0 + 18.0 + 10.5 + 12.0 + 6.0 + 5.0 + 5.0 = 80.5
    assert compute_weighted_score(mixed) == 80.5


def test_face_presentation_is_descriptive_only() -> None:
    """Camera metrics remain descriptive and never produce a facial score."""
    summary = {
        "schemaVersion": 2,
        "status": "available",
        "sampleCount": 25,
        "usableSampleCount": 22,
        "facePresenceRatio": 0.92,
        "singleFaceRatio": 0.96,
        "frameQuality": 0.81,
        "headFacingCameraRatio": 0.7,
        "smileMovementMean": 0.2,
        "expressionMovementMean": 0.14,
        "limitations": ["Movement is not emotion."],
    }

    result = analyze_face_presentation(summary)
    assert result["facialScore"] is None
    assert result["grade"] == "Not scored"
    assert result["status"] == "available"
    assert result["faceVisibility"] == 92
    assert result["frameQuality"] == 81
    assert result["headFacingCameraProxy"] == 0.7
    assert result["faceTrackingConfidence"] is None
    assert result["gazeDirection"] is None
    assert result["occlusion"] is None
    assert "emotion" in result["summary"].lower()


def test_legacy_emotion_metrics_are_not_reported() -> None:
    """Old emotion and engagement summaries cannot produce a facial score."""
    result = analyze_face_presentation({
        "faceDetectionRate": 100,
        "eyeContactPercentage": 100,
        "engagement": 100,
        "expressionDistribution": {"happy": 100},
        "sampleCount": 100,
        "validSamples": 100,
    })
    assert result["facialScore"] is None
    assert result["status"] == "unavailable"
    assert result["strengths"] == []
    assert result["improvements"] == []


def test_face_evaluation_fallback_when_missing_data() -> None:
    """Missing face samples produce a safe fallback instead of a fake score."""
    result = evaluate_face_summary({})
    assert result["facialScore"] is None
    assert result["status"] == "unavailable"
    assert result["summary"]


def test_interview_engine_requires_auth(client: TestClient) -> None:
    """Verify authorization checks on interview engine endpoints."""
    assert client.post("/api/interview-engine/start", json={"role": "SWE"}).status_code in (401, 403)
    assert client.get("/api/interview-engine/00000000-0000-0000-0000-000000000000").status_code in (401, 403)
    assert client.post(
        "/api/interview-engine/00000000-0000-0000-0000-000000000000/answer",
        json={"turnNumber": 1, "answer": "Test answer"},
    ).status_code in (401, 403)
    assert client.post(
        "/api/interview-engine/00000000-0000-0000-0000-000000000000/finish"
    ).status_code in (401, 403)
    assert client.get(
        "/api/interview-engine/00000000-0000-0000-0000-000000000000/report"
    ).status_code in (401, 403)
