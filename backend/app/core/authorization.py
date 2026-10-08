"""Object-Level Authorization (BOLA/IDOR) protection module.

Ensures that every resource access request is strictly scoped and validated
against the authenticated user's identity before returning or modifying data.
"""
from __future__ import annotations

import uuid
from typing import Any, TypeVar
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

T = TypeVar("T")


async def verify_object_ownership(
    db: AsyncSession,
    model: type[T],
    resource_id: Any,
    user_id: str,
    id_field_name: str = "id",
    owner_field_name: str = "user_id",
) -> T:
    """Fetch a record and enforce Object-Level Authorization (BOLA/IDOR check).

    Raises:
        HTTP 404 NOT FOUND if the resource ID does not exist.
        HTTP 403 FORBIDDEN if the resource exists but is owned by another user.
    """
    id_attr = getattr(model, id_field_name)

    target_id = resource_id
    if isinstance(resource_id, str):
        try:
            target_id = uuid.UUID(resource_id)
        except ValueError:
            target_id = resource_id

    try:
        query = select(model).where(id_attr == target_id)
        row = await db.scalar(query)
    except Exception:
        row = None

    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resource not found",
        )

    actual_owner = str(getattr(row, owner_field_name, ""))
    if actual_owner != str(user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Object Level Authorization Check Failed (IDOR Protection)",
        )

    return row
