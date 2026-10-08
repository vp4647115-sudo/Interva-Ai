"""MongoDB database client using motor.motor_asyncio."""
from __future__ import annotations

import logging
from typing import Any
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from ..core.config import get_settings

logger = logging.getLogger(__name__)

_mongo_client: AsyncIOMotorClient | None = None


def get_mongo_client() -> AsyncIOMotorClient:
    global _mongo_client
    if _mongo_client is None:
        settings = get_settings()
        logger.info("Initializing MongoDB client at %s", settings.mongodb_url)
        _mongo_client = AsyncIOMotorClient(settings.mongodb_url)
    return _mongo_client


def get_mongo_db() -> AsyncIOMotorDatabase:
    client = get_mongo_client()
    settings = get_settings()
    return client[settings.mongodb_db_name]


async def close_mongo_connection() -> None:
    global _mongo_client
    if _mongo_client is not None:
        _mongo_client.close()
        _mongo_client = None
        logger.info("Closed MongoDB client connection")
