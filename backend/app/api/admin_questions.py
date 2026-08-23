"""Phase 3 admin CRUD for the question bank (phase.md): add, edit, retire,
and version entries without a deploy. All routes require the admin allowlist
gate (`AdminUser`, rule.md §6)."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.dependencies import AdminUser
from ..db.session import get_db
from ..models.phase3 import QuestionBankEntry
from ..schemas.phase3 import QuestionIn, QuestionOut, QuestionUpdate

router = APIRouter(prefix="/api/admin/questions", tags=["admin"])


def _out(r: QuestionBankEntry) -> QuestionOut:
    return QuestionOut(
        id=str(r.id),
        question_text=r.question_text,
        role=r.role,
        topic=r.topic,
        category=r.category,
        difficulty=r.difficulty,
        expected_concepts=[c.strip() for c in (r.expected_concepts or "").split(",") if c.strip()],
        ideal_answer=r.ideal_answer,
        evaluation_rubric=r.evaluation_rubric,
        source=r.source,
        version=r.version,
        status=r.status,
        created_at=r.created_at,
        updated_at=r.updated_at,
    )


async def _get(db: AsyncSession, row_id: str) -> QuestionBankEntry:
    row = await db.scalar(select(QuestionBankEntry).where(QuestionBankEntry.id == row_id))
    if not row:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Not found")
    return row


@router.get("", response_model=list[QuestionOut])
async def list_questions(
    role: str | None = None,
    include_retired: bool = True,
    admin: AdminUser = ...,
    db: AsyncSession = Depends(get_db),
):
    query = select(QuestionBankEntry)
    if role:
        query = query.where(QuestionBankEntry.role == role)
    if not include_retired:
        query = query.where(QuestionBankEntry.status == "active")
    rows = (await db.scalars(query.order_by(QuestionBankEntry.created_at))).all()
    return [_out(r) for r in rows]


@router.post("", response_model=QuestionOut, status_code=201)
async def create_question(
    payload: QuestionIn, admin: AdminUser = ..., db: AsyncSession = Depends(get_db)
):
    row = QuestionBankEntry(
        **payload.model_dump(exclude={"expected_concepts"}),
        expected_concepts=",".join(payload.expected_concepts),
    )
    db.add(row)
    await db.commit()
    return _out(row)


@router.put("/{row_id}", response_model=QuestionOut)
async def update_question(
    row_id: str,
    payload: QuestionUpdate,
    admin: AdminUser = ...,
    db: AsyncSession = Depends(get_db),
):
    row = await _get(db, row_id)
    data = payload.model_dump(exclude_unset=True)
    concepts = data.pop("expected_concepts", None)
    for key, value in data.items():
        setattr(row, key, value)
    if concepts is not None:
        row.expected_concepts = ",".join(concepts)
    # Content edits bump the version; status flips (retire/reactivate) do not.
    content_changed = any(k in data for k in ("question_text", "ideal_answer", "evaluation_rubric"))
    if content_changed:
        row.version += 1
    await db.commit()
    return _out(row)


@router.delete("/{row_id}", status_code=204)
async def delete_question(
    row_id: str, admin: AdminUser = ..., db: AsyncSession = Depends(get_db)
) -> None:
    row = await _get(db, row_id)
    await db.delete(row)
    await db.commit()
