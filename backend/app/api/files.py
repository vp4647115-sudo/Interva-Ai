"""File storage endpoints: upload, list, and download user files via Firebase
Cloud Storage. Every route requires a verified Firebase ID token and every
operation is scoped to the caller's uid — users can only touch their own files.
"""
from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from pydantic import BaseModel

from ..core.dependencies import CurrentUser
from ..core.storage import (
    StorageError,
    delete_user_file,
    signed_url,
    upload_user_file,
    validate_file,
)
from ..db.session import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..models.phase3 import Resume

router = APIRouter(prefix="/api/files", tags=["files"])

RESUME_TYPES = {
    "application/pdf": ".pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
}
IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}


class FileOut(BaseModel):
    storageKey: str
    downloadUrl: str


@router.post("/resume", response_model=FileOut)
async def upload_resume(
    file: UploadFile = File(...),
    user: CurrentUser = None,
    db: AsyncSession = Depends(get_db),
) -> FileOut:
    """Upload a resume file (PDF/DOCX) to the user's cloud folder."""
    contents = await file.read()
    try:
        ext = validate_file(file.content_type or "", len(contents), RESUME_TYPES)
        key = upload_user_file(
            user["id"], contents, file.content_type or "", folder="resumes", extension=ext
        )
    except ValueError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(exc)) from exc
    except StorageError as exc:
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, str(exc)) from exc

    # Record it in the resumes table so CRUD listing stays in sync.
    from ..schemas.phase3 import ResumeIn  # local import avoids circulars at module load

    row = Resume(
        user_id=user["id"],
        filename=file.filename or f"resume{ext}",
        storage_key=key,
        mime_type=file.content_type,
        size_bytes=len(contents),
        status="uploaded",
    )
    db.add(row)
    await db.commit()

    return FileOut(storageKey=key, downloadUrl=signed_url(key))


@router.post("/image", response_model=FileOut)
async def upload_image(
    file: UploadFile = File(...),
    user: CurrentUser = None,
) -> FileOut:
    """Upload an image (JPG/PNG/WebP) to the user's cloud folder."""
    contents = await file.read()
    try:
        ext = validate_file(file.content_type or "", len(contents), IMAGE_TYPES)
        key = upload_user_file(
            user["id"], contents, file.content_type or "", folder="images", extension=ext
        )
    except ValueError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(exc)) from exc
    except StorageError as exc:
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, str(exc)) from exc
    return FileOut(storageKey=key, downloadUrl=signed_url(key))


@router.get("/url")
async def get_download_url(
    storageKey: str,
    user: CurrentUser = None,
) -> dict[str, Any]:
    """Get a fresh time-limited URL for one of the user's own files.
    The key must start with the caller's own prefix — no cross-user access."""
    if not storageKey.startswith(f"users/{user['id']}/"):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Not your file")
    try:
        return {"success": True, "downloadUrl": signed_url(storageKey)}
    except StorageError as exc:
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, str(exc)) from exc


@router.delete("/resume/{row_id}", status_code=204)
async def delete_resume_file(
    row_id: str,
    user: CurrentUser = None,
    db: AsyncSession = Depends(get_db),
) -> None:
    """Delete a resume record AND its cloud file (user-scoped)."""
    row = await db.scalar(
        select(Resume).where(Resume.id == row_id, Resume.user_id == user["id"])
    )
    if not row:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Not found")
    if row.storage_key:
        try:
            delete_user_file(row.storage_key)
        except StorageError as exc:
            raise HTTPException(status.HTTP_502_BAD_GATEWAY, str(exc)) from exc
    await db.delete(row)
    await db.commit()
