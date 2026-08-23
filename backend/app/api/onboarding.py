"""Phase 2 onboarding wizard + dashboard API. All routes require a verified
Firebase ID token and are scoped server-side to the caller's uid (rule.md §6).

Endpoints (all under /api/onboarding):
- GET  /state            — resumable wizard state
- PUT  /state            — save current step progress
- POST /finish           — mark wizard finished
- CRUD for education / experience / skills, GET+PUT preferences
- GET  /completion       — weighted profile completion percentage
- GET  /dashboard        — aggregate stats for the personalized dashboard
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.dependencies import CurrentUser
from ..db.session import get_db
from ..models.onboarding import (
    CareerPreference,
    Education,
    Experience,
    OnboardingState,
    Skill,
)
from ..schemas.onboarding import (
    CompletionOut,
    DashboardOut,
    EducationIn,
    EducationOut,
    ExperienceIn,
    ExperienceOut,
    PreferencesIn,
    SkillIn,
    SkillOut,
    WizardStateIn,
    WizardStateOut,
)

router = APIRouter(prefix="/api/onboarding", tags=["onboarding"])

# Weighted completion: not all fields mandatory (phase.md Phase 2).
WEIGHTS = {"profile": 20, "education": 15, "experience": 25, "skills": 20, "preferences": 20}


async def _get_state(db: AsyncSession, user_id: str) -> OnboardingState:
    state = await db.scalar(select(OnboardingState).where(OnboardingState.user_id == user_id))
    if not state:
        state = OnboardingState(user_id=user_id)
        db.add(state)
        await db.commit()
    return state


def _split(value: str | None) -> list[str]:
    return [part.strip() for part in (value or "").split(",") if part.strip()]


@router.get("/state", response_model=WizardStateOut)
async def get_state(
    user: CurrentUser, db: AsyncSession = Depends(get_db)
) -> WizardStateOut:
    state = await _get_state(db, user["id"])
    return WizardStateOut(
        completed_steps=_split(state.completed_steps),
        current_step=state.current_step,
        finished=state.finished,
        updated_at=state.updated_at,
    )


@router.put("/state", response_model=WizardStateOut)
async def put_state(
    payload: WizardStateIn, user: CurrentUser, db: AsyncSession = Depends(get_db)
) -> WizardStateOut:
    state = await _get_state(db, user["id"])
    state.completed_steps = ",".join(payload.completed_steps)
    state.current_step = payload.current_step
    state.finished = payload.finished
    await db.commit()
    return WizardStateOut(
        completed_steps=payload.completed_steps,
        current_step=payload.current_step,
        finished=payload.finished,
        updated_at=state.updated_at,
    )


@router.post("/finish", response_model=WizardStateOut)
async def finish(user: CurrentUser, db: AsyncSession = Depends(get_db)) -> WizardStateOut:
    state = await _get_state(db, user["id"])
    state.finished = True
    if "preferences" not in _split(state.completed_steps):
        state.completed_steps = ",".join([*_split(state.completed_steps), "preferences"])
    await db.commit()
    return WizardStateOut(
        completed_steps=_split(state.completed_steps),
        current_step=state.current_step,
        finished=True,
        updated_at=state.updated_at,
    )


# --- Education ---------------------------------------------------------------


@router.get("/education", response_model=list[EducationOut])
async def list_education(user: CurrentUser, db: AsyncSession = Depends(get_db)):
    rows = (
        await db.scalars(
            select(Education).where(Education.user_id == user["id"]).order_by(Education.created_at)
        )
    ).all()
    return [
        EducationOut(
            id=str(r.id),
            school=r.school,
            degree=r.degree,
            field_of_study=r.field_of_study,
            start_date=r.start_date,
            end_date=r.end_date,
            created_at=r.created_at,
        )
        for r in rows
    ]


@router.post("/education", response_model=EducationOut, status_code=201)
async def add_education(
    payload: EducationIn, user: CurrentUser, db: AsyncSession = Depends(get_db)
):
    row = Education(user_id=user["id"], **payload.model_dump())
    db.add(row)
    await db.commit()
    return EducationOut(id=str(row.id), **payload.model_dump())


@router.put("/education/{row_id}", response_model=EducationOut)
async def update_education(
    row_id: str, payload: EducationIn, user: CurrentUser, db: AsyncSession = Depends(get_db)
):
    row = await db.scalar(
        select(Education).where(Education.id == row_id, Education.user_id == user["id"])
    )
    if not row:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Not found")
    for key, value in payload.model_dump().items():
        setattr(row, key, value)
    await db.commit()
    return EducationOut(id=str(row.id), **payload.model_dump())


@router.delete("/education/{row_id}", status_code=204)
async def delete_education(
    row_id: str, user: CurrentUser, db: AsyncSession = Depends(get_db)
) -> None:
    row = await db.scalar(
        select(Education).where(Education.id == row_id, Education.user_id == user["id"])
    )
    if not row:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Not found")
    await db.delete(row)
    await db.commit()


# --- Experience --------------------------------------------------------------


@router.get("/experience", response_model=list[ExperienceOut])
async def list_experience(user: CurrentUser, db: AsyncSession = Depends(get_db)):
    rows = (
        await db.scalars(
            select(Experience)
            .where(Experience.user_id == user["id"])
            .order_by(Experience.created_at)
        )
    ).all()
    return [
        ExperienceOut(
            id=str(r.id),
            company=r.company,
            title=r.title,
            description=r.description,
            start_date=r.start_date,
            end_date=r.end_date,
            created_at=r.created_at,
        )
        for r in rows
    ]


@router.post("/experience", response_model=ExperienceOut, status_code=201)
async def add_experience(
    payload: ExperienceIn, user: CurrentUser, db: AsyncSession = Depends(get_db)
):
    row = Experience(user_id=user["id"], **payload.model_dump())
    db.add(row)
    await db.commit()
    return ExperienceOut(id=str(row.id), **payload.model_dump())


@router.put("/experience/{row_id}", response_model=ExperienceOut)
async def update_experience(
    row_id: str, payload: ExperienceIn, user: CurrentUser, db: AsyncSession = Depends(get_db)
):
    row = await db.scalar(
        select(Experience).where(Experience.id == row_id, Experience.user_id == user["id"])
    )
    if not row:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Not found")
    for key, value in payload.model_dump().items():
        setattr(row, key, value)
    await db.commit()
    return ExperienceOut(id=str(row.id), **payload.model_dump())


@router.delete("/experience/{row_id}", status_code=204)
async def delete_experience(
    row_id: str, user: CurrentUser, db: AsyncSession = Depends(get_db)
) -> None:
    row = await db.scalar(
        select(Experience).where(Experience.id == row_id, Experience.user_id == user["id"])
    )
    if not row:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Not found")
    await db.delete(row)
    await db.commit()


# --- Skills ------------------------------------------------------------------


@router.get("/skills", response_model=list[SkillOut])
async def list_skills(user: CurrentUser, db: AsyncSession = Depends(get_db)):
    rows = (
        await db.scalars(select(Skill).where(Skill.user_id == user["id"]).order_by(Skill.name))
    ).all()
    return [SkillOut(id=str(r.id), name=r.name, level=r.level) for r in rows]


@router.post("/skills", response_model=SkillOut, status_code=201)
async def add_skill(payload: SkillIn, user: CurrentUser, db: AsyncSession = Depends(get_db)):
    existing = await db.scalar(
        select(Skill).where(Skill.user_id == user["id"], Skill.name == payload.name.strip())
    )
    if existing:
        existing.level = payload.level
        await db.commit()
        return SkillOut(id=str(existing.id), name=existing.name, level=existing.level)
    row = Skill(user_id=user["id"], name=payload.name.strip(), level=payload.level)
    db.add(row)
    await db.commit()
    return SkillOut(id=str(row.id), name=row.name, level=row.level)


@router.delete("/skills/{row_id}", status_code=204)
async def delete_skill(row_id: str, user: CurrentUser, db: AsyncSession = Depends(get_db)) -> None:
    row = await db.scalar(select(Skill).where(Skill.id == row_id, Skill.user_id == user["id"]))
    if not row:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Not found")
    await db.delete(row)
    await db.commit()


# --- Career preferences ------------------------------------------------------


@router.get("/preferences", response_model=PreferencesIn)
async def get_preferences(user: CurrentUser, db: AsyncSession = Depends(get_db)):
    row = await db.scalar(
        select(CareerPreference).where(CareerPreference.user_id == user["id"])
    )
    if not row:
        return PreferencesIn()
    return PreferencesIn(
        target_roles=_split(row.target_roles),
        seniority=row.seniority,
        preferred_industries=_split(row.preferred_industries),
    )


@router.put("/preferences", response_model=PreferencesIn)
async def put_preferences(
    payload: PreferencesIn, user: CurrentUser, db: AsyncSession = Depends(get_db)
):
    row = await db.scalar(
        select(CareerPreference).where(CareerPreference.user_id == user["id"])
    )
    if not row:
        row = CareerPreference(user_id=user["id"])
        db.add(row)
    row.target_roles = ", ".join(payload.target_roles)
    row.seniority = payload.seniority
    row.preferred_industries = ", ".join(payload.preferred_industries)
    await db.commit()
    return payload


# --- Completion & dashboard --------------------------------------------------


async def _completion(db: AsyncSession, user_id: str) -> tuple[int, int, int, int]:
    edu = await db.scalar(
        select(func.count()).select_from(Education).where(Education.user_id == user_id)
    )
    exp = await db.scalar(
        select(func.count()).select_from(Experience).where(Experience.user_id == user_id)
    )
    skl = await db.scalar(select(func.count()).select_from(Skill).where(Skill.user_id == user_id))
    pref = await db.scalar(
        select(func.count()).select_from(CareerPreference).where(CareerPreference.user_id == user_id)
    )
    percent = 0
    percent += WEIGHTS["profile"]  # profile row always exists post-sync
    if (edu or 0) > 0:
        percent += WEIGHTS["education"]
    if (exp or 0) > 0:
        percent += WEIGHTS["experience"]
    if (skl or 0) > 0:
        percent += WEIGHTS["skills"]
    if (pref or 0) > 0:
        percent += WEIGHTS["preferences"]
    return percent, edu or 0, exp or 0, skl or 0


@router.get("/completion", response_model=CompletionOut)
async def get_completion(user: CurrentUser, db: AsyncSession = Depends(get_db)):
    percent, _, _, _ = await _completion(db, user["id"])
    return CompletionOut(completion_percent=percent)


@router.get("/dashboard", response_model=DashboardOut)
async def get_dashboard(user: CurrentUser, db: AsyncSession = Depends(get_db)):
    percent, edu, exp, skl = await _completion(db, user["id"])
    return DashboardOut(
        completion_percent=percent,
        education_count=edu,
        experience_count=exp,
        skill_count=skl,
    )
