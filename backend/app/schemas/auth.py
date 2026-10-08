"""Pydantic request/response contracts for auth routes. No raw dicts (rule.md §3).

Note: registration/login/reset requests moved client-side with Firebase Auth;
the backend only accepts verified Firebase ID tokens (bearer header)."""
from __future__ import annotations

# pyrefly: ignore [missing-import]
from pydantic import BaseModel, EmailStr


class UserOut(BaseModel):
    id: str
    email: EmailStr
    full_name: str | None = None
    email_verified: bool = False
    # Backend/database-owned onboarding state — the frontend uses this to
    # route to /onboarding or /dashboard after login. Never client-writable.
    onboarding_completed: bool = False
    welcome_email_sent: bool = False


class MessageResponse(BaseModel):
    message: str


class ProfileIn(BaseModel):
    full_name: str | None = None
    phone: str | None = None
    location: str | None = None
    birth_date: str | None = None
    target_role: str | None = None
    bio: str | None = None


class ProfileOut(BaseModel):
    id: str
    email: EmailStr
    full_name: str | None = None
    phone: str | None = None
    location: str | None = None
    birth_date: str | None = None
    target_role: str | None = None
    bio: str | None = None
    subscription_plan: str = "Pro Master AI Plan"
    subscription_status: str = "Active"
    interviews_conducted: int = 0
    resources_count: int = 0
    upcoming_interviews_count: int = 0
    mock_interviews_count: int = 0
    onboarding_completed: bool = False

