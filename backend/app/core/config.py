"""Application settings loaded from environment (.env). Secrets never live in code."""
from __future__ import annotations

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "InterviewAI API"
    environment: str = "development"

    # CORS: restricted to known frontend origins (rule.md §6)
    frontend_origin: str = "http://localhost:3000"

    # Supabase (legacy — retained for storage/DB integration; auth now via Firebase)
    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_role_key: str = ""
    supabase_jwt_secret: str = ""

    # Firebase Auth
    firebase_project_id: str = "interv-ai-880ac"
    # Either paste the full service-account JSON into FIREBASE_SERVICE_ACCOUNT_JSON,
    # or point GOOGLE_APPLICATION_CREDENTIALS_PATH at the downloaded JSON file.
    firebase_service_account_json: str = ""
    google_application_credentials_path: str = ""

    # Firebase Cloud Storage (user files: resumes, images). Uses the same
    # service-account credentials as Auth — no separate API key required.
    firebase_storage_bucket: str = ""

    # Admin allowlist (seeded via env until admin CRUD exists)
    admin_emails: str = ""

    # Database
    database_url: str = "sqlite+aiosqlite:///./interviai.db"

    # Gemini AI (server-only; never expose to the frontend)
    gemini_api_key: str = ""
    gemini_model: str = "gemini-3.1-pro-preview"

    # Theirstack job data (server-only)
    theirstack_api_key: str = ""

    # Outbound email (welcome message after onboarding). The sender identity is
    # ADMIN_EMAIL (falls back to SMTP_USER when unset). For Gmail: create an
    # App Password at https://myaccount.google.com/apppasswords and paste it
    # below.
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    admin_email: str = ""
    email_from_name: str = "Inter AI"

    # Public application URL used in email links (never hardcode localhost).
    app_url: str = "http://localhost:3000"


@lru_cache
def get_settings() -> Settings:
    return Settings()
