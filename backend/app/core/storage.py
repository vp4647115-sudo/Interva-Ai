"""Firebase Cloud Storage service. Stores user files (resumes, images) under
per-user prefixes so access can be scoped server-side. Uses the same
service-account credentials as Firebase Auth — no separate API key.

Storage layout:
  users/{uid}/resumes/{uuid}.{ext}     — uploaded resume files
  users/{uid}/images/{uuid}.{ext}      — profile/portfolio images
"""
from __future__ import annotations

import uuid
from functools import lru_cache

from google.cloud import storage as gcs_storage
from google.cloud.exceptions import NotFound

from .config import get_settings
from .firebase import get_firebase_admin

MAX_UPLOAD_BYTES = 10 * 1024 * 1024  # 10 MB


class StorageError(RuntimeError):
    """Raised when a storage operation fails."""


@lru_cache
def _bucket():
    """Return the configured GCS bucket, creating the client from the same
    credentials used for Firebase Admin."""
    settings = get_settings()
    bucket_name = settings.firebase_storage_bucket
    if not bucket_name:
        raise StorageError(
            "FIREBASE_STORAGE_BUCKET is not configured on the backend"
        )
    # Initializing the Firebase app first ensures the same credentials are used.
    get_firebase_admin()
    client = gcs_storage.Client(project=settings.firebase_project_id)
    return client.bucket(bucket_name)


def validate_file(content_type: str, size: int, allowed: set[str]) -> str:
    """Validate content type and size; returns the file extension."""
    if content_type not in allowed:
        raise ValueError(f"Unsupported file type: {content_type}")
    if size <= 0:
        raise ValueError("The uploaded file is empty.")
    if size > MAX_UPLOAD_BYTES:
        raise ValueError("File is too large. Maximum size is 10 MB.")
    ext = allowed[content_type]
    return ext


def upload_user_file(
    uid: str,
    data: bytes,
    content_type: str,
    *,
    folder: str,
    extension: str,
) -> str:
    """Upload bytes to the user's folder; returns the storage key (object path)."""
    key = f"users/{uid}/{folder}/{uuid.uuid4().hex}{extension}"
    try:
        blob = _bucket().blob(key)
        blob.upload_from_string(data, content_type=content_type)
    except Exception as exc:
        raise StorageError(f"Failed to upload file: {exc}") from exc
    return key


def delete_user_file(storage_key: str) -> None:
    """Delete an object by storage key. Missing objects are ignored."""
    try:
        _bucket().delete_blob(storage_key)
    except NotFound:
        pass
    except Exception as exc:
        raise StorageError(f"Failed to delete file: {exc}") from exc


def signed_url(storage_key: str, minutes: int = 60) -> str:
    """Generate a time-limited read URL for a stored object."""
    try:
        blob = _bucket().blob(storage_key)
        return blob.generate_signed_url(version="v4", expiration=minutes * 60)
    except Exception as exc:
        raise StorageError(f"Failed to generate download URL: {exc}") from exc
