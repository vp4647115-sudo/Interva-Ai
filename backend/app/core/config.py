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

    # Admin allowlist (seeded via env until admin CRUD exists)
    admin_emails: str = ""

    # Database
    database_url: str = "sqlite+aiosqlite:///./interviai.db"


@lru_cache
def get_settings() -> Settings:
    return Settings()
