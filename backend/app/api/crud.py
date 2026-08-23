"""Phase 3 candidate CRUD: resumes and interview session records.

Every route requires a verified Firebase ID token and every query is scoped
server-side to the caller's uid — no candidate can read or modify another
candidate's rows (phase.md Phase 3 acceptance criteria).
"""
from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.dependencies import CurrentUser
from ..db.session import get_db
from ..models.phase3 import InterviewSession, Resume
from ..schemas.phase3 import (
    ResumeIn,
    ResumeOut,
    ResumeUpdate,
    SessionIn,
    SessionOut,
    SessionStatusUpdate,
)

router = APIRouter(prefix="/api", tags=["crud"])


async def _get_owned(db: AsyncSession, model, row_id: str, user_id: str):
    row = await db.scalar(select(model).where(model.id == row_id, model.user_id == user_id))
    if not row:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Not found")
    return row


# --- Resumes -----------------------------------------------------------------


@router.get("/resumes", response_model=list[ResumeOut])
async def list_resumes(user: CurrentUser, db: AsyncSession = Depends(get_db)):
    rows = (
        await db.scalars(
            select(Resume).where(Resume.user_id == user["id"]).order_by(Resume.created_at)
        )
    ).all()
    return [
        ResumeOut(
            id=str(r.id),
            filename=r.filename,
            storage_key=r.storage_key,
            mime_type=r.mime_type,
            size_bytes=r.size_bytes,
            status=r.status,
            created_at=r.created_at,
        )
        for r in rows
    ]


@router.post("/resumes", response_model=ResumeOut, status_code=201)
async def create_resume(
    payload: ResumeIn, user: CurrentUser, db: AsyncSession = Depends(get_db)
):
    row = Resume(user_id=user["id"], **payload.model_dump())
    db.add(row)
    await db.commit()
    return ResumeOut(id=str(row.id), status=row.status, **payload.model_dump())


@router.put("/resumes/{row_id}", response_model=ResumeOut)
async def update_resume(
    row_id: str, payload: ResumeUpdate, user: CurrentUser, db: AsyncSession = Depends(get_db)
):
    row = await _get_owned(db, Resume, row_id, user["id"])
    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(row, key, value)
    await db.commit()
    return ResumeOut(
        id=str(row.id),
        filename=row.filename,
        storage_key=row.storage_key,
        mime_type=row.mime_type,
        size_bytes=row.size_bytes,
        status=row.status,
        created_at=row.created_at,
    )


@router.delete("/resumes/{row_id}", status_code=204)
async def delete_resume(
    row_id: str, user: CurrentUser, db: AsyncSession = Depends(get_db)
) -> None:
    row = await _get_owned(db, Resume, row_id, user["id"])
    await db.delete(row)
    await db.commit()


# --- Interview session records ------------------------------------------------


@router.get("/interviews", response_model=list[SessionOut])
async def list_sessions(user: CurrentUser, db: AsyncSession = Depends(get_db)):
    rows = (
        await db.scalars(
            select(InterviewSession)
            .where(InterviewSession.user_id == user["id"])
            .order_by(InterviewSession.created_at.desc())
        )
    ).all()
    return [_session_out(r) for r in rows]


@router.post("/interviews", response_model=SessionOut, status_code=201)
async def create_session(
    payload: SessionIn, user: CurrentUser, db: AsyncSession = Depends(get_db)
):
    row = InterviewSession(user_id=user["id"], **payload.model_dump())
    db.add(row)
    await db.commit()
    return _session_out(row)


@router.get("/interviews/{row_id}", response_model=SessionOut)
async def get_session(
    row_id: str, user: CurrentUser, db: AsyncSession = Depends(get_db)
):
    row = await _get_owned(db, InterviewSession, row_id, user["id"])
    return _session_out(row)


@router.put("/interviews/{row_id}", response_model=SessionOut)
async def update_session(
    row_id: str,
    payload: SessionStatusUpdate,
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    row = await _get_owned(db, InterviewSession, row_id, user["id"])
    now = datetime.now(timezone.utc)
    row.status = payload.status
    if payload.score is not None:
        row.score = payload.score
    if payload.status == "in_progress" and row.started_at is None:
        row.started_at = now
    if payload.status in ("completed", "abandoned"):
        row.finished_at = now
    await db.commit()
    return _session_out(row)


@router.delete("/interviews/{row_id}", status_code=204)
async def delete_session(
    row_id: str, user: CurrentUser, db: AsyncSession = Depends(get_db)
) -> None:
    row = await _get_owned(db, InterviewSession, row_id, user["id"])
    await db.delete(row)
    await db.commit()


def _session_out(r: InterviewSession) -> SessionOut:
    return SessionOut(
        id=str(r.id),
        role=r.role,
        interview_type=r.interview_type,
        difficulty=r.difficulty,
        duration_minutes=r.duration_minutes,
        status=r.status,
        score=r.score,
        started_at=r.started_at,
        finished_at=r.finished_at,
        created_at=r.created_at,
    )
