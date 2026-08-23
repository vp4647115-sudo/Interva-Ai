"""Firebase Admin SDK initialization. Used server-side to verify Firebase ID
tokens issued by the frontend (rule.md §1: all auth verification is server-side)."""
from __future__ import annotations

from functools import lru_cache

import firebase_admin
from firebase_admin import credentials as fb_credentials, get_app

from .config import get_settings


@lru_cache
def get_firebase_admin() -> firebase_admin.App:
    settings = get_settings()
    try:
        return get_app(name="interviai-admin")
    except ValueError:
        pass  # App not yet initialized — fall through and create it.
    cred: fb_credentials.Credentials | None = None
    if settings.firebase_service_account_json:
        import json

        cred = fb_credentials.Certificate(json.loads(settings.firebase_service_account_json))
    elif settings.google_application_credentials_path:
        cred = fb_credentials.Certificate(settings.google_application_credentials_path)
    else:
        # Falls back to Application Default Credentials (FIREBASE_APPLICATION_DEFAULT / ADC).
        cred = fb_credentials.ApplicationDefault()
    return firebase_admin.initialize_app(cred, {"projectId": settings.firebase_project_id}, name="interviai-admin")
