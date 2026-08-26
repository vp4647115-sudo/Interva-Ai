"""Theirstack job search client. Server-only; the API key never leaves the backend."""
from __future__ import annotations

from typing import Any

import httpx

from ..core.config import get_settings

THEIRSTACK_URL = "https://api.theirstack.com/v1/jobs/search"
TIMEOUT_SECONDS = 25


class JobProviderError(RuntimeError):
    """Raised when the job provider fails or returns unusable data."""


class JobProviderRateLimited(JobProviderError):
    """Raised when the provider reports a rate limit or quota exhaustion."""


def build_theirstack_payload(filters: dict[str, Any]) -> dict[str, Any]:
    """Convert normalized frontend filters into Theirstack's request format."""
    payload: dict[str, Any] = {
        "page": max(1, int(filters.get("page", 1))),
        "limit": min(25, max(5, int(filters.get("limit", 20)))),
    }

    query = (filters.get("query") or "").strip()
    if query:
        payload["job_title_or"] = [query]

    location = (filters.get("location") or "").strip()
    if location:
        payload["job_location_or"] = [location]

    remote = filters.get("remote")
    if remote in ("remote", "on-site", "hybrid"):
        payload["remote"] = remote

    job_type = (filters.get("jobType") or "").strip()
    if job_type:
        payload["job_type_or"] = [job_type]

    experience = (filters.get("experienceLevel") or "").strip()
    if experience:
        payload["job_candidate_max_years_of_experience_or"] = [experience]

    company = (filters.get("company") or "").strip()
    if company:
        payload["company_name_or"] = [company]

    posted_days = filters.get("postedWithinDays")
    if posted_days:
        payload["posted_at_max_age_days"] = int(posted_days)
    elif not company:
        # Theirstack rejects unscoped searches unless a company or date filter
        # is present. Recent listings make the blank-filter search useful.
        payload["posted_at_max_age_days"] = 30

    return payload


async def fetch_theirstack_jobs(payload: dict[str, Any]) -> dict[str, Any]:
    """Call Theirstack and return the raw JSON response."""
    settings = get_settings()
    if not settings.theirstack_api_key:
        raise JobProviderError("THEIRSTACK_API_KEY is not configured on the backend")

    try:
        async with httpx.AsyncClient(timeout=TIMEOUT_SECONDS) as client:
            resp = await client.post(
                THEIRSTACK_URL,
                headers={
                    "Authorization": f"Bearer {settings.theirstack_api_key}",
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                json=payload,
            )
    except httpx.TimeoutException as exc:
        raise JobProviderError("Job provider timed out") from exc
    except httpx.HTTPError as exc:
        raise JobProviderError("Could not reach the job provider") from exc

    if resp.status_code == 429:
        raise JobProviderRateLimited("Job provider rate limit reached. Please try again shortly.")
    if resp.status_code in (401, 403):
        raise JobProviderError("Job provider authentication failed")
    if resp.status_code >= 400:
        raise JobProviderError(f"Job provider error ({resp.status_code})")

    try:
        data = resp.json()
    except ValueError as exc:
        raise JobProviderError("Job provider returned malformed data") from exc
    if not isinstance(data, dict):
        raise JobProviderError("Job provider returned unexpected data")
    return data
