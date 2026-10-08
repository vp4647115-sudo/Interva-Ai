"""Interview Engine Router — Live interactive multi-turn interview state machine."""
from __future__ import annotations

import json
from typing import Any, Literal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..ai.evaluator import (
    evaluate_turn_answer,
    generate_face_analysis_feedback,
    generate_interview_report,
)
from ..ai.question_generator import generate_next_question
from ..core.authorization import verify_object_ownership
from ..core.code_executor import execute_code_snippet
from ..core.dependencies import CurrentUser, get_current_user
from ..db.session import get_db
from ..models.interview import InterviewReport, InterviewTurn
from ..models.phase3 import InterviewSession
from ..models.profile import CandidateProfile

router = APIRouter(prefix="/api/interview-engine", tags=["interview-engine"])


class StartSessionRequest(BaseModel):
    role: str = Field(min_length=1, max_length=120)
    interviewType: Literal["technical", "behavioral", "mixed", "coding"] = "technical"
    difficulty: Literal["easy", "medium", "hard"] = "medium"
    durationMinutes: int = Field(default=30, ge=10, le=90)
    mode: Literal["text", "voice", "coding"] = "text"


class TTSRequest(BaseModel):
    text: str = Field(min_length=1, max_length=2000)
    voice: str = Field(default="en-US-Standard-A", max_length=60)


class CodeRunRequest(BaseModel):
    code: str = Field(min_length=1, max_length=20000)
    language: str = Field(default="python", max_length=40)
    testCases: list[dict[str, Any]] | None = None


class SubmitAnswerRequest(BaseModel):
    turnNumber: int = Field(ge=1)
    answer: str = Field(min_length=1, max_length=12000)


class FinishInterviewRequest(BaseModel):
    faceAnalysis: dict[str, Any] | None = None


@router.post("/start", status_code=201)
async def start_interview_session(
    payload: StartSessionRequest,
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Initialize a new multi-turn interview session and generate question #1."""
    session = InterviewSession(
        user_id=user["id"],
        role=payload.role,
        interview_type=payload.interviewType,
        difficulty=payload.difficulty,
        duration_minutes=payload.durationMinutes,
        status="in_progress",
    )
    db.add(session)
    await db.flush()

    # Load optional profile info for context
    profile_stmt = select(CandidateProfile).where(CandidateProfile.supabase_user_id == user["id"])
    profile_row = (await db.scalars(profile_stmt)).first()
    profile_data = {}
    if profile_row:
        profile_data = {
            "title": profile_row.target_role,
            "skills": [],
            "experience_years": None,
        }

    first_q = await generate_next_question(
        role=payload.role,
        interview_type=payload.interviewType,
        difficulty=payload.difficulty,
        turn_number=1,
        candidate_profile=profile_data,
        history=[],
    )

    turn = InterviewTurn(
        session_id=session.id,
        turn_number=1,
        question_text=first_q["question"],
        topic=first_q.get("topic"),
        difficulty=first_q.get("difficulty", payload.difficulty),
    )
    db.add(turn)
    await db.commit()

    return {
        "sessionId": str(session.id),
        "status": session.status,
        "currentTurn": 1,
        "question": first_q["question"],
        "topic": first_q.get("topic"),
        "difficulty": first_q.get("difficulty"),
        "lookFors": first_q.get("lookFors", []),
    }


@router.get("/{session_id}")
async def get_session_state(
    session_id: str,
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Retrieve full state machine data for an active or completed interview session."""
    session: InterviewSession = await verify_object_ownership(db, InterviewSession, session_id, user["id"])

    turns_stmt = (
        select(InterviewTurn)
        .where(InterviewTurn.session_id == session.id)
        .order_by(InterviewTurn.turn_number)
    )
    turns = (await db.scalars(turns_stmt)).all()

    turn_data = []
    for t in turns:
        eval_dict = json.loads(t.evaluation_json) if t.evaluation_json else None
        turn_data.append(
            {
                "turnNumber": t.turn_number,
                "question": t.question_text,
                "topic": t.topic,
                "difficulty": t.difficulty,
                "answer": t.answer_text,
                "score": t.score,
                "evaluation": eval_dict,
            }
        )

    return {
        "sessionId": str(session.id),
        "role": session.role,
        "interviewType": session.interview_type,
        "difficulty": session.difficulty,
        "status": session.status,
        "score": session.score,
        "turns": turn_data,
        "totalTurns": len(turn_data),
    }


@router.post("/{session_id}/answer")
async def submit_turn_answer(
    session_id: str,
    payload: SubmitAnswerRequest,
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Submit candidate's answer for the active turn, evaluate it, and advance state."""
    session: InterviewSession = await verify_object_ownership(db, InterviewSession, session_id, user["id"])

    if session.status not in ("in_progress", "asking"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot submit answer for session in status '{session.status}'",
        )

    # Fetch active turn
    turn_stmt = select(InterviewTurn).where(
        InterviewTurn.session_id == session.id,
        InterviewTurn.turn_number == payload.turnNumber,
    )
    turn = (await db.scalars(turn_stmt)).first()
    if not turn:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Turn not found")

    # Evaluate answer
    eval_res = await evaluate_turn_answer(
        role=session.role,
        difficulty=turn.difficulty or session.difficulty,
        question=turn.question_text,
        answer=payload.answer,
        topic=turn.topic,
    )

    turn.answer_text = payload.answer
    turn.score = eval_res["score"]
    turn.evaluation_json = json.dumps(eval_res)
    await db.flush()

    # Determine if interview should continue to next turn (e.g. max 5 turns per session)
    max_turns = 5
    is_finished = payload.turnNumber >= max_turns

    next_question_data = None
    if not is_finished:
        # Load past turns for context builder
        all_turns_stmt = (
            select(InterviewTurn)
            .where(InterviewTurn.session_id == session.id)
            .order_by(InterviewTurn.turn_number)
        )
        past_turns = (await db.scalars(all_turns_stmt)).all()
        history = [
            {
                "turn_number": pt.turn_number,
                "question": pt.question_text,
                "answer": pt.answer_text,
                "score": pt.score,
            }
            for pt in past_turns
        ]

        next_q = await generate_next_question(
            role=session.role,
            interview_type=session.interview_type,
            difficulty=session.difficulty,
            turn_number=payload.turnNumber + 1,
            history=history,
        )

        next_turn = InterviewTurn(
            session_id=session.id,
            turn_number=payload.turnNumber + 1,
            question_text=next_q["question"],
            topic=next_q.get("topic"),
            difficulty=next_q.get("difficulty", session.difficulty),
        )
        db.add(next_turn)
        next_question_data = {
            "turnNumber": payload.turnNumber + 1,
            "question": next_q["question"],
            "topic": next_q.get("topic"),
            "difficulty": next_q.get("difficulty"),
            "lookFors": next_q.get("lookFors", []),
        }

    await db.commit()

    return {
        "evaluation": eval_res,
        "isFinished": is_finished,
        "nextQuestion": next_question_data,
    }


@router.post("/{session_id}/finish")
async def finish_interview_session(
    session_id: str,
    user: CurrentUser,
    payload: FinishInterviewRequest | None = None,
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Complete session, run score engine, and build overall performance report."""
    session: InterviewSession = await verify_object_ownership(db, InterviewSession, session_id, user["id"])

    turns_stmt = (
        select(InterviewTurn)
        .where(InterviewTurn.session_id == session.id)
        .order_by(InterviewTurn.turn_number)
    )
    turns = (await db.scalars(turns_stmt)).all()

    turn_dicts = [
        {
            "turn_number": t.turn_number,
            "question_text": t.question_text,
            "score": t.score or 0.0,
            "evaluation": t.evaluation_json,
        }
        for t in turns
        if t.answer_text is not None
    ]

    face_analysis = (payload or FinishInterviewRequest()).faceAnalysis
    report_data = await generate_interview_report(session.role, session.interview_type, turn_dicts)

    if face_analysis:
        face_eval = await generate_face_analysis_feedback(face_analysis)
        report_data["facialPresentation"] = face_eval
        report_data["facialScore"] = face_eval.get("facialScore")
        report_data["facialGrade"] = face_eval.get("grade")

    # Check if report already exists
    rep_stmt = select(InterviewReport).where(InterviewReport.session_id == session.id)
    report = (await db.scalars(rep_stmt)).first()
    if not report:
        report = InterviewReport(session_id=session.id, user_id=user["id"])
        db.add(report)

    report.overall_score = report_data["overall_score"]
    report.technical_score = report_data["technical_score"]
    report.communication_score = report_data["communication_score"]
    report.problem_solving_score = report_data["problem_solving_score"]
    report.relevance_score = report_data["relevance_score"]
    report.confidence_score = report_data["confidence_score"]
    report.fluency_score = report_data["fluency_score"]
    report.grammar_score = report_data["grammar_score"]
    report.strengths_json = json.dumps(report_data["strengths"])
    report.improvements_json = json.dumps(report_data["improvements"])
    report.missed_concepts_json = json.dumps(report_data["missed_concepts"])
    report.recommendations_json = json.dumps(report_data["recommendations"])
    report.summary = report_data["summary"]

    session.status = "completed"
    session.score = report_data["overall_score"]

    await db.commit()

    return {"success": True, "report": report_data}


@router.get("/{session_id}/report")
async def get_interview_report(
    session_id: str,
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Retrieve performance report for a finished interview session."""
    session: InterviewSession = await verify_object_ownership(db, InterviewSession, session_id, user["id"])

    rep_stmt = select(InterviewReport).where(InterviewReport.session_id == session.id)
    report = (await db.scalars(rep_stmt)).first()

    if not report:
        # If report not generated yet, auto-trigger generation
        return await finish_interview_session(session_id=session_id, payload=None, user=user, db=db)

    return {
        "sessionId": str(session.id),
        "role": session.role,
        "overallScore": report.overall_score,
        "rubricScores": {
            "technical": report.technical_score,
            "communication": report.communication_score,
            "problemSolving": report.problem_solving_score,
            "relevance": report.relevance_score,
            "confidence": report.confidence_score,
            "fluency": report.fluency_score,
            "grammar": report.grammar_score,
        },
        "summary": report.summary,
        "strengths": json.loads(report.strengths_json or "[]"),
        "improvements": json.loads(report.improvements_json or "[]"),
        "missedConcepts": json.loads(report.missed_concepts_json or "[]"),
        "recommendations": json.loads(report.recommendations_json or "[]"),
    }


@router.post("/tts")
async def generate_speech_audio(
    payload: TTSRequest,
    user: CurrentUser,
) -> dict[str, Any]:
    """Provide Text-to-Speech audio configuration metadata for reading interview questions."""
    return {
        "success": True,
        "text": payload.text,
        "voice": payload.voice,
        "supported": True,
    }


@router.post("/code-run")
async def run_candidate_code(
    payload: CodeRunRequest,
    user: CurrentUser,
) -> dict[str, Any]:
    """Execute candidate submitted code in a sandboxed runner and evaluate test cases."""
    result = await execute_code_snippet(
        code=payload.code,
        language=payload.language,
        test_cases=payload.testCases,
    )
    return {
        "success": result["success"],
        "stdout": result["stdout"],
        "stderr": result["stderr"],
        "executionTimeMs": result["executionTimeMs"],
        "testResults": result["testResults"],
        "error": result["error"],
    }


