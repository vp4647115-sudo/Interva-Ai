"""Firebase ID-token verification and small auth helpers."""
from __future__ import annotations

import logging

from firebase_admin import auth as firebase_auth
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from .config import get_settings
from .firebase import get_firebase_admin

logger = logging.getLogger(__name__)

bearer_scheme = HTTPBearer(auto_error=False)


async def get_bearer_token(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> str:
    if credentials is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Missing bearer token")
    return credentials.credentials


def is_admin_email(email: str) -> bool:
    settings = get_settings()
    allowed = {e.strip().lower() for e in settings.admin_emails.split(",") if e.strip()}
    return email.lower() in allowed


def verify_firebase_id_token(token: str) -> dict:
    """Verify a Firebase ID token against the project's signing keys.

    Raises 401 on any invalid/expired/wrong-audience token.
    """
    app = get_firebase_admin()
    try:
        return firebase_auth.verify_id_token(token, app=app)
    except firebase_auth.InvalidIdTokenError as exc:
        logger.info("Rejected an invalid or expired Firebase ID token.")
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED, "Invalid or expired Firebase ID token"
        ) from exc
