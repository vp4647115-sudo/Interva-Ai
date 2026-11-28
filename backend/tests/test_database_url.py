import pytest

from app.core.config import Settings


@pytest.mark.parametrize(
    ("database_url", "expected"),
    [
        (
            "postgres://user:pass@host:5432/app?sslmode=require",
            "postgresql+asyncpg://user:pass@host:5432/app?sslmode=require",
        ),
        (
            "postgresql://user:pass@host:5432/app",
            "postgresql+asyncpg://user:pass@host:5432/app",
        ),
        (
            "postgresql+asyncpg://user:pass@host:5432/app",
            "postgresql+asyncpg://user:pass@host:5432/app",
        ),
        ("sqlite+aiosqlite:///./interviai.db", "sqlite+aiosqlite:///./interviai.db"),
    ],
)
def test_database_url_uses_async_postgresql_driver(
    database_url: str, expected: str
) -> None:
    settings = Settings(_env_file=None, database_url=database_url)

    assert settings.database_url == expected
