"""Async SQLAlchemy engine/session. Postgres in prod, sqlite for local dev."""
from __future__ import annotations

import os
from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from ..core.config import get_settings, validate_deployed_database_url


class Base(DeclarativeBase):
    pass


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
engine = create_async_engine(
    settings.database_url,
    echo=False,
    connect_args={"statement_cache_size": 0},
)
SessionLocal = async_sessionmaker(engine, expire_on_commit=False)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with SessionLocal() as session:
        yield session
