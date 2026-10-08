"""FastAPI dependencies for authentication and role checks.

Candidate and admin authorization are architecturally separate (rule.md §6):
`require_admin` additionally demands an email in the admin allowlist with a
verified address. MFA enforcement moves to Firebase-managed factors.
"""
from __future__ import annotations

from typing import Any, Annotated

from fastapi import Depends, HTTPException, status

from .security import bearer_scheme, get_bearer_token, is_admin_email, verify_firebase_id_token, HTTPAuthorizationCredentials


async def get_current_user(
    token: Annotated[str, Depends(get_bearer_token)],
) -> dict[str, Any]:
    claims = verify_firebase_id_token(token)
    return {
        "id": claims["uid"],
        "email": claims.get("email", ""),
        "email_verified": claims.get("email_verified", False),
        "claims": claims,
    }


CurrentUser = Annotated[dict[str, Any], Depends(get_current_user)]


async def get_optional_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)] = None,
) -> dict[str, Any] | None:
    if not credentials or not credentials.credentials:
        return None
    try:
        claims = verify_firebase_id_token(credentials.credentials)
        return {
            "id": claims["uid"],
            "email": claims.get("email", ""),
            "email_verified": claims.get("email_verified", False),
            "claims": claims,
        }
    except Exception:
        return None


OptionalUser = Annotated[dict[str, Any] | None, Depends(get_optional_user)]


async def require_mfa_enrolled(user: CurrentUser) -> dict[str, Any]:
    """Admin accounts must be on the allowlist with a verified email.

    TOTP enrollment is managed via Firebase; when the admin CRUD phase lands,
    check enrolledFactors here via the Admin SDK.
    """
    if not is_admin_email(user["email"]):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Not an admin account")
    if not user.get("email_verified"):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Admin email must be verified")
    return user


AdminUser = Annotated[dict[str, Any], Depends(require_mfa_enrolled)]
