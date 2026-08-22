"""Pydantic request/response contracts for auth routes. No raw dicts (rule.md §3).

Note: registration/login/reset requests moved client-side with Firebase Auth;
the backend only accepts verified Firebase ID tokens (bearer header)."""
from __future__ import annotations

from pydantic import BaseModel, EmailStr


class UserOut(BaseModel):
    id: str
    email: EmailStr
    full_name: str | None = None
    email_verified: bool = False


class MessageResponse(BaseModel):
    message: str
