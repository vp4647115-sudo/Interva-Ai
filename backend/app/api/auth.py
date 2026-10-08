"""Auth routes. Registration, login, email verification, password reset, and
Google sign-in all happen client-side via the Firebase SDK; the backend only
verifies Firebase ID tokens and syncs a candidate profile row (rule.md §2:
no credential duplication).

The welcome email is NOT sent here anymore — it is sent exactly once by
POST /api/onboarding/complete after onboarding finishes. /sync and /me only
report the database-owned onboarding state so the frontend can route."""
from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.dependencies import CurrentUser
from ..core.email_service import dispatch_welcome_email
from ..db.session import get_db
from ..models.onboarding import Education, Experience, Skill
from ..models.phase3 import InterviewSession, Resume
from ..models.profile import CandidateProfile
from ..schemas.auth import MessageResponse, ProfileIn, ProfileOut, UserOut
from .onboarding import _mark_email_result, get_onboarding_details

router = APIRouter(prefix="/api/auth", tags=["auth"])


async def _ensure_profile_row(db: AsyncSession, claims: dict) -> bool:
    """Create the candidate profile row on first authenticated request;
    never overwrite candidate-entered data. Returns True when the row was
    just created (i.e. this is the user's first login)."""
    uid = claims["uid"]
    existing = await db.scalar(
        select(CandidateProfile).where(CandidateProfile.supabase_user_id == uid)
    )
    if existing:
        return False
    db.add(
        CandidateProfile(
            supabase_user_id=uid,
            email=claims.get("email", ""),
            full_name=(claims.get("name") or claims.get("display_name")),
            consent_terms=True,
        )
    )
    await db.commit()
    return True


@router.post("/sync", response_model=UserOut)
async def sync_session(user: CurrentUser, db: AsyncSession = Depends(get_db)) -> UserOut:
    """Called by the frontend after any successful Firebase sign-in so the
    backend can verify the ID token and upsert the profile row.

    Automatically dispatches the HTML welcome email containing user onboarding details
    from the admin email after onboarding is completed."""
    await _ensure_profile_row(db, user["claims"])
    profile = await db.scalar(
        select(CandidateProfile).where(CandidateProfile.supabase_user_id == user["id"])
    )

    # Automated welcome email dispatch on login after onboarding is completed:
    if profile and profile.onboarding_completed and not profile.welcome_email_sent and not profile.welcome_email_claimed and user.get("email"):
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
            details = await get_onboarding_details(db, user["id"])
            dispatch_welcome_email(
                to_email=user["email"],
                on_result=lambda ok: _mark_email_result(user["id"], ok),
                **details,
            )
            await db.refresh(profile)


    return UserOut(
        id=user["id"],
        email=user["email"],
        full_name=user["claims"].get("name"),
        email_verified=bool(user.get("email_verified")),
        onboarding_completed=bool(profile.onboarding_completed) if profile else False,
        welcome_email_sent=bool(profile.welcome_email_sent) if profile else False,
    )


@router.get("/profile", response_model=ProfileOut)
async def get_profile(user: CurrentUser, db: AsyncSession = Depends(get_db)) -> ProfileOut:
    """Return the authenticated user's full profile including activity stats."""
    profile = await db.scalar(
        select(CandidateProfile).where(CandidateProfile.supabase_user_id == user["id"])
    )
    # Aggregate stats
    interviews_conducted = await db.scalar(
        select(func.count()).select_from(InterviewSession)
        .where(InterviewSession.user_id == user["id"],
               InterviewSession.status.in_(["completed"]))
    ) or 0
    mock_interviews_count = await db.scalar(
        select(func.count()).select_from(InterviewSession)
        .where(InterviewSession.user_id == user["id"])
    ) or 0
    upcoming_interviews_count = await db.scalar(
        select(func.count()).select_from(InterviewSession)
        .where(InterviewSession.user_id == user["id"],
               InterviewSession.status.in_(["draft", "in_progress"]))
    ) or 0
    resources_count = await db.scalar(
        select(func.count()).select_from(Resume)
        .where(Resume.user_id == user["id"])
    ) or 0
    return ProfileOut(
        id=user["id"],
        email=user["email"],
        full_name=profile.full_name if profile else None,
        phone=profile.phone if profile else None,
        location=profile.location if profile else None,
        birth_date=profile.birth_date if profile else None,
        target_role=profile.target_role if profile else None,
        bio=profile.bio if profile else None,
        subscription_plan="Pro Master AI Plan",
        subscription_status="Active",
        interviews_conducted=interviews_conducted,
        resources_count=resources_count,
        upcoming_interviews_count=upcoming_interviews_count,
        mock_interviews_count=mock_interviews_count,
        onboarding_completed=bool(profile.onboarding_completed) if profile else False,
    )


@router.put("/profile", response_model=ProfileOut)
async def update_profile(
    payload: ProfileIn, user: CurrentUser, db: AsyncSession = Depends(get_db)
) -> ProfileOut:
    """Update editable profile fields (name, phone, location, birth_date, target_role, bio)."""
    profile = await db.scalar(
        select(CandidateProfile).where(CandidateProfile.supabase_user_id == user["id"])
    )
    if not profile:
        from fastapi import HTTPException, status as http_status
        raise HTTPException(http_status.HTTP_404_NOT_FOUND, "Profile not found. Please log in again.")
    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(profile, key, value)
    await db.commit()
    await db.refresh(profile)
    # Re-fetch stats
    interviews_conducted = await db.scalar(
        select(func.count()).select_from(InterviewSession)
        .where(InterviewSession.user_id == user["id"],
               InterviewSession.status.in_(["completed"]))
    ) or 0
    mock_interviews_count = await db.scalar(
        select(func.count()).select_from(InterviewSession)
        .where(InterviewSession.user_id == user["id"])
    ) or 0
    upcoming_interviews_count = await db.scalar(
        select(func.count()).select_from(InterviewSession)
        .where(InterviewSession.user_id == user["id"],
               InterviewSession.status.in_(["draft", "in_progress"]))
    ) or 0
    resources_count = await db.scalar(
        select(func.count()).select_from(Resume)
        .where(Resume.user_id == user["id"])
    ) or 0
    return ProfileOut(
        id=user["id"],
        email=user["email"],
        full_name=profile.full_name,
        phone=profile.phone,
        location=profile.location,
        birth_date=profile.birth_date,
        target_role=profile.target_role,
        bio=profile.bio,
        subscription_plan="Pro Master AI Plan",
        subscription_status="Active",
        interviews_conducted=interviews_conducted,
        resources_count=resources_count,
        upcoming_interviews_count=upcoming_interviews_count,
        mock_interviews_count=mock_interviews_count,
        onboarding_completed=bool(profile.onboarding_completed),
    )


@router.post("/logout", response_model=MessageResponse)
async def logout() -> MessageResponse:
    # Firebase sessions are revoked client-side; nothing to do server-side.
    return MessageResponse(message="Logged out.")


@router.get("/me", response_model=UserOut)
async def me(user: CurrentUser, db: AsyncSession = Depends(get_db)) -> UserOut:
    profile = await db.scalar(
        select(CandidateProfile).where(CandidateProfile.supabase_user_id == user["id"])
    )
    return UserOut(
        id=user["id"],
        email=user["email"],
        full_name=profile.full_name if profile else user["claims"].get("name"),
        email_verified=bool(user.get("email_verified")),
        onboarding_completed=bool(profile.onboarding_completed) if profile else False,
        welcome_email_sent=bool(profile.welcome_email_sent) if profile else False,
    )
