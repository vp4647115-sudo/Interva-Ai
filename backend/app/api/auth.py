"""Auth routes. Registration, login, email verification, password reset, and
Google sign-in all happen client-side via the Firebase SDK; the backend only
verifies Firebase ID tokens and syncs a candidate profile row (rule.md §2:
no credential duplication).

The welcome email is NOT sent here anymore — it is sent exactly once by
POST /api/onboarding/complete after onboarding finishes. /sync and /me only
report the database-owned onboarding state so the frontend can route."""
from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.dependencies import CurrentUser
from ..db.session import get_db
from ..models.profile import CandidateProfile
from ..schemas.auth import MessageResponse, UserOut

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

    Returns the database-owned onboarding state; no email is sent here —
    that happens once, in POST /api/onboarding/complete."""
    await _ensure_profile_row(db, user["claims"])
    profile = await db.scalar(
        select(CandidateProfile).where(CandidateProfile.supabase_user_id == user["id"])
    )
    return UserOut(
        id=user["id"],
        email=user["email"],
        full_name=user["claims"].get("name"),
        email_verified=bool(user.get("email_verified")),
        onboarding_completed=bool(profile.onboarding_completed) if profile else False,
        welcome_email_sent=bool(profile.welcome_email_sent) if profile else False,
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
