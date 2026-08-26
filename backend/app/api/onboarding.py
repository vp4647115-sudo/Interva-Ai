"""Phase 2 onboarding wizard + dashboard API. All routes require a verified
Firebase ID token and are scoped server-side to the caller's uid (rule.md §6).

Endpoints (all under /api/onboarding):
- GET  /state            — resumable wizard state
- PUT  /state            — save current step progress
- POST /finish           — mark wizard finished
- GET  /status           — backend-owned onboardingCompleted flag (source of truth)
- POST /complete         — one-time completion: validate contact data, persist,
                           set onboardingCompleted, send welcome email exactly once
- CRUD for education / experience / skills, GET+PUT preferences
- GET  /completion       — weighted profile completion percentage
- GET  /dashboard        — aggregate stats for the personalized dashboard
"""
from __future__ import annotations

import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.dependencies import CurrentUser
from ..core.email_service import dispatch_welcome_email
from ..core.storage import StorageError, upload_user_file, validate_file
from ..db.session import SessionLocal, get_db
from ..models.onboarding import (
    CareerPreference,
    Education,
    Experience,
    OnboardingState,
    Skill,
)
from ..models.profile import CandidateProfile
from ..schemas.onboarding import (
    CompletionOut,
    DashboardOut,
    EducationIn,
    EducationOut,
    ExperienceIn,
    ExperienceOut,
    OnboardingCompleteIn,
    OnboardingCompleteOut,
    OnboardingStatusOut,
    PreferencesIn,
    SkillIn,
    SkillOut,
    WizardStateIn,
    WizardStateOut,
)

logger = logging.getLogger("interviai.onboarding")

router = APIRouter(prefix="/api/onboarding", tags=["onboarding"])

# Weighted completion: not all fields mandatory (phase.md Phase 2).
WEIGHTS = {"profile": 20, "education": 15, "experience": 25, "skills": 20, "preferences": 20}


async def _get_state(db: AsyncSession, user_id: str) -> OnboardingState:
    state = await db.scalar(select(OnboardingState).where(OnboardingState.user_id == user_id))
    if not state:
        state = OnboardingState(user_id=user_id)
        db.add(state)
        await db.commit()
        # commit() expires the instance; refresh so later attribute access
        # (e.g. state.updated_at) doesn't trigger a sync lazy load and raise
        # MissingGreenlet in the async session.
        await db.refresh(state)
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
    await db.refresh(state)  # commit() expires the instance; reload before access
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
    await db.refresh(state)  # commit() expires the instance; reload before access

    # Preserve the existing frontend contract: older clients call /finish
    # without the newer contact payload. Complete the account from the
    # verified identity so their database state and redirect remain correct;
    # newer clients should use /complete to include address/certificate data.
    profile = await _get_profile(db, user["id"])
    if profile and not profile.onboarding_completed:
        profile.onboarding_data = {"email": user["email"], "address": None, "certificateNumber": None}
        profile.onboarding_completed = True
        profile.onboarding_completed_at = datetime.now(timezone.utc)
        await db.commit()
    if profile and not profile.welcome_email_sent and not profile.welcome_email_claimed:
        claim = await db.execute(
            update(CandidateProfile)
            .where(
                CandidateProfile.supabase_user_id == user["id"],
                CandidateProfile.welcome_email_sent.is_(False),
                CandidateProfile.welcome_email_claimed.is_(False),
            )
            .values(welcome_email_claimed=True)
        )
        await db.commit()
        if claim.rowcount == 1:
            dispatch_welcome_email(
                to_email=user["email"],
                user_name=profile.full_name or user["claims"].get("name"),
                on_result=lambda ok: _mark_email_result(user["id"], ok),
            )
    return WizardStateOut(
        completed_steps=_split(state.completed_steps),
        current_step=state.current_step,
        finished=True,
        updated_at=state.updated_at,
    )


# --- One-time completion & backend-owned status ------------------------------


async def _get_profile(db: AsyncSession, user_id: str) -> CandidateProfile | None:
    return await db.scalar(
        select(CandidateProfile).where(CandidateProfile.supabase_user_id == user_id)
    )


@router.get("/status", response_model=OnboardingStatusOut)
async def get_status(user: CurrentUser, db: AsyncSession = Depends(get_db)) -> OnboardingStatusOut:
    """Backend/database is the source of truth for onboarding state.
    The frontend calls this after login to decide dashboard vs onboarding."""
    profile = await _get_profile(db, user["id"])
    if not profile:
        # No profile row yet (sync never ran) → onboarding pending.
        return OnboardingStatusOut(
            onboarding_completed=False,
            welcome_email_sent=False,
            welcome_email_claimed=False,
            onboarding_completed_at=None,
        )
    return OnboardingStatusOut(
        onboarding_completed=profile.onboarding_completed,
        welcome_email_sent=profile.welcome_email_sent,
        welcome_email_claimed=profile.welcome_email_claimed,
        onboarding_completed_at=profile.onboarding_completed_at,
    )


def _mark_email_result(uid: str, success: bool) -> None:
    """Runs in the email worker thread AFTER the provider accepted/rejected the
    message. Only a confirmed send flips `welcome_email_sent` (Phase 6/10):
    failures leave it False so a later login can safely retry — exactly once."""

    async def _update() -> None:
        async with SessionLocal() as db:
            profile = await _get_profile(db, uid)
            if profile:
                profile.welcome_email_claimed = False
                if success and not profile.welcome_email_sent:
                    profile.welcome_email_sent = True
                    profile.welcome_email_sent_at = datetime.now(timezone.utc)
                await db.commit()

    import asyncio

    try:
        asyncio.run(_update())
    except Exception:  # noqa: BLE001 — never crash the worker thread
        logger.exception("Failed to persist welcome-email result for %s", uid)


@router.post("/complete", response_model=OnboardingCompleteOut)
async def complete_onboarding(
    payload: OnboardingCompleteIn,
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),
) -> OnboardingCompleteOut:
    """One-time onboarding completion (Phases 4, 6, 9, 10).

    Idempotency contract:
    - If `onboarding_completed` is already True, this returns the current
      state WITHOUT re-saving data or re-sending the email — duplicate or
      double-clicked submissions are harmless no-ops.
    - The welcome email fires only when `welcome_email_sent` is False; the
      flag is set only after SMTP accepts the message. A failed send keeps
      onboarding complete and leaves the email retryable.
    """
    profile = await _get_profile(db, user["id"])
    if not profile:
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            "Profile not initialized. Please log in again.",
        )

    verified_email = (user.get("email") or "").strip().lower()
    if not profile.onboarding_completed:
        # Defense-in-depth: the collected contact email must match the
        # verified Firebase identity. We never mail a third-party address.
        if payload.email.strip().lower() != verified_email:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                "The provided email does not match your account's verified email.",
            )
        if payload.certificate_storage_key and not payload.certificate_storage_key.startswith(
            f"users/{user['id']}/"
        ):
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Certificate attachment is not yours.")

        profile.onboarding_data = {
            "email": payload.email,
            "address": payload.address,
            "certificateNumber": payload.certificate_number,
            "certificateStorageKey": payload.certificate_storage_key,
        }
        profile.onboarding_completed = True
        profile.onboarding_completed_at = datetime.now(timezone.utc)
        await db.commit()  # onboarding persists even if the email later fails
        await db.refresh(profile)

    email_accepted = False
    claim = await db.execute(
        update(CandidateProfile)
        .where(
            CandidateProfile.supabase_user_id == user["id"],
            CandidateProfile.welcome_email_sent.is_(False),
            CandidateProfile.welcome_email_claimed.is_(False),
        )
        .values(welcome_email_claimed=True)
    )
    await db.commit()
    if claim.rowcount == 1:
        dispatch_welcome_email(
            to_email=verified_email,  # authenticated user's registered email only
            user_name=profile.full_name or user["claims"].get("name"),
            on_result=lambda ok: _mark_email_result(user["id"], ok),
        )
        # We cannot block the response for up to 30s of SMTP latency; the
        # worker thread flips the flag on confirmation. If SMTP fails here,
        # onboarding stays complete and the next login retries the email.
        email_accepted = False
    else:
        email_accepted = True

    return OnboardingCompleteOut(
        onboarding_completed=True,
        welcome_email_sent=profile.welcome_email_sent,
        onboarding_completed_at=profile.onboarding_completed_at,
        email_sent_accepted=email_accepted,
        welcome_email_claimed=profile.welcome_email_claimed,
    )


CERTIFICATE_TYPES = {
    "application/pdf": ".pdf",
    "image/jpeg": ".jpg",
    "image/png": ".png",
}


@router.post("/certificate")
async def upload_certificate(
    file: UploadFile = File(...), user: CurrentUser = None
) -> dict[str, str]:
    """Upload a certificate attachment for the authenticated user."""
    contents = await file.read()
    try:
        extension = validate_file(file.content_type or "", len(contents), CERTIFICATE_TYPES)
        storage_key = upload_user_file(
            user["id"], contents, file.content_type or "", folder="certificates", extension=extension
        )
    except ValueError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(exc)) from exc
    except StorageError as exc:
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, "Certificate upload failed.") from exc
    return {"storageKey": storage_key}


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
    await db.refresh(row)  # commit() expires the instance; reload before access
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
            years=r.years,
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
    await db.refresh(row)  # commit() expires the instance; reload before access
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
    await db.refresh(row)  # commit() expires the instance; reload before access
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
