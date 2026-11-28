from __future__ import annotations

import pytest

from app.core.config import (
    Settings,
    normalize_database_url,
    validate_deployed_database_url,
)


@pytest.mark.parametrize(
    ("url", "expected"),
    [
        (
            "postgres://db.example.com/app",
            "postgresql+asyncpg://db.example.com/app",
        ),
        (
            "postgresql://db.example.com/app",
            "postgresql+asyncpg://db.example.com/app",
        ),
        (
            "postgresql://db.example.com/app?sslmode=require",
            "postgresql+asyncpg://db.example.com/app?sslmode=require",
        ),
        (
            "postgresql://db.example.com/app?sslmode=require&ssl=true",
            "postgresql+asyncpg://db.example.com/app?sslmode=require&ssl=true",
        ),
        (
            "sqlite+aiosqlite:///./interviai.db",
            "sqlite+aiosqlite:///./interviai.db",
        ),
    ],
)
def test_normalize_database_url(url: str, expected: str) -> None:
    assert normalize_database_url(url) == expected


def test_settings_normalize_database_url() -> None:
    settings = Settings(
        _env_file=None,
        database_url="postgres://db.example.com/app",
    )
    assert settings.database_url == "postgresql+asyncpg://db.example.com/app"


@pytest.mark.parametrize(
    ("environment", "is_vercel", "is_railway"),
    [
        ("production", False, False),
        ("prod", False, False),
        ("development", True, False),
        ("development", False, True),
    ],
)
def test_deployed_database_rejects_sqlite(
    environment: str, is_vercel: bool, is_railway: bool
) -> None:
    with pytest.raises(RuntimeError, match="managed PostgreSQL"):
        validate_deployed_database_url(
            "sqlite+aiosqlite:///./interviai.db",
            environment,
            is_vercel=is_vercel,
            is_railway=is_railway,
        )


def test_deployed_database_rejects_supabase_project_url() -> None:
    with pytest.raises(RuntimeError, match="Supabase project/API URL"):
        validate_deployed_database_url(
            "https://project-ref.supabase.co",
            "production",
            is_vercel=False,
        )


def test_deployed_database_rejects_unsupported_driver() -> None:
    with pytest.raises(RuntimeError, match="managed PostgreSQL"):
        validate_deployed_database_url(
            "mysql://db.example.com/app",
            "production",
            is_vercel=False,
        )


def test_local_development_allows_sqlite() -> None:
    validate_deployed_database_url(
        "sqlite+aiosqlite:///./interviai.db",
        "development",
        is_vercel=False,
    )
