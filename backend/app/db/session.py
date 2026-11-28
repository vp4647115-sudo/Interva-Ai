"""Async SQLAlchemy engine/session. Postgres in prod, sqlite for local dev."""
from __future__ import annotations

import os
from collections.abc import AsyncGenerator
from uuid import uuid4
from urllib.parse import urlsplit

from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.pool import NullPool

from ..core.config import get_settings, validate_deployed_database_url


class Base(DeclarativeBase):
    pass


def _unique_prepared_statement_name() -> str:
    return f"__asyncpg_{uuid4()}__"


def _create_engine(database_url: str) -> AsyncEngine:
    database_host = urlsplit(database_url).hostname or ""
    if database_host.endswith(".pooler.supabase.com"):
        return create_async_engine(
            database_url,
            echo=False,
            poolclass=NullPool,
            connect_args={
                "prepared_statement_name_func": _unique_prepared_statement_name
            },
        )
    return create_async_engine(database_url, echo=False)


settings = get_settings()
validate_deployed_database_url(
    settings.database_url,
    settings.environment,
    is_vercel=bool(os.getenv("VERCEL")),
    is_railway=any(
        os.getenv(name)
        for name in (
            "RAILWAY_ENVIRONMENT_NAME",
            "RAILWAY_PROJECT_ID",
            "RAILWAY_SERVICE_ID",
        )
    ),
)
engine = _create_engine(settings.database_url)
SessionLocal = async_sessionmaker(engine, expire_on_commit=False)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with SessionLocal() as session:
        yield session
