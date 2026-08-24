"""Normalize Theirstack job records into the app's internal job format.

The provider's field names vary between listings; every accessor is defensive
so a missing or malformed field can never break the response.
"""
from __future__ import annotations

import hashlib
from datetime import datetime, timezone
from typing import Any


def _first(*values: Any) -> Any:
    """Return the first non-empty value."""
    for v in values:
        if v is not None and v != "" and v != []:
            return v
    return None


def _safe_str(value: Any, max_len: int = 400) -> str | None:
    if value is None:
        return None
    text = str(value).strip()
    return text[:max_len] if text else None


def _strip_html(value: Any) -> str | None:
    text = _safe_str(value, max_len=8000)
    if not text:
        return None
    # Collapse tags and whitespace without pulling in a parser dependency.
    import re

    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip() or None


def _parse_posted_at(value: Any) -> str | None:
    text = _safe_str(value)
    if not text:
        return None
    try:
        dt = datetime.fromisoformat(text.replace("Z", "+00:00"))
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc).isoformat()
    except ValueError:
        return None


def _extract_salary(job: dict[str, Any]) -> tuple[int | None, int | None, str | None]:
    """Return (min, max, currency) from any salary shape the provider uses."""
    salary = job.get("salary") or {}
    if not isinstance(salary, dict):
        salary = {}

    def _num(v: Any) -> int | None:
        try:
            return int(float(v)) if v is not None else None
        except (TypeError, ValueError):
            return None

    salary_min = _num(_first(salary.get("minimum_salary"), job.get("min_salary"), job.get("salary_min")))
    salary_max = _num(_first(salary.get("maximum_salary"), job.get("max_salary"), job.get("salary_max")))
    currency = _safe_str(_first(salary.get("currency"), job.get("salary_currency")), max_len=8)
    return salary_min, salary_max, currency


def _extract_skills(job: dict[str, Any]) -> list[str]:
    raw = _first(job.get("skills"), job.get("job_skills"), []) or []
    if isinstance(raw, str):
        raw = [s.strip() for s in raw.split(",") if s.strip()]
    if not isinstance(raw, list):
        return []
    return [s for s in (_safe_str(item, max_len=60) for item in raw) if s][:12]


def _job_identity(job: dict[str, Any]) -> str:
    """Stable identity: external ID -> source+ID -> apply URL -> content hash."""
    external_id = _safe_str(_first(job.get("id"), job.get("job_id")), max_len=120)
    if external_id:
        return external_id
    source = _safe_str(job.get("source"), max_len=40) or "unknown"
    apply_url = _safe_str(_first(job.get("job_url"), job.get("application_link"), job.get("url")), max_len=500)
    if apply_url:
        return f"{source}:{hashlib.sha1(apply_url.encode()).hexdigest()[:16]}"
    title = _safe_str(job.get("job_title") or job.get("title"), max_len=120) or ""
    company = _safe_str((job.get("company_object") or {}).get("company_name") if isinstance(job.get("company_object"), dict) else job.get("company"), max_len=120) or ""
    return f"{source}:{hashlib.sha1(f'{title}|{company}'.encode()).hexdigest()[:16]}"


def normalize_job(raw: dict[str, Any]) -> dict[str, Any] | None:
    """Convert one provider job into the internal format, or None if unusable."""
    if not isinstance(raw, dict):
        return None

    title = _safe_str(_first(raw.get("job_title"), raw.get("title")), max_len=200)
    apply_url = _safe_str(_first(raw.get("job_url"), raw.get("application_link"), raw.get("url")), max_len=800)
    if not title or not apply_url:
        return None  # A job card without a title or destination is not useful.

    company_obj = raw.get("company_object") if isinstance(raw.get("company_object"), dict) else {}
    company = _safe_str(_first(company_obj.get("company_name"), raw.get("company"), raw.get("company_name")), max_len=200)
    logo = _safe_str(_first(company_obj.get("company_logo_url"), raw.get("company_logo"), raw.get("logo")), max_len=800)

    location = _safe_str(_first(raw.get("location"), raw.get("job_location")), max_len=200)
    country = _safe_str(_first(raw.get("country"), raw.get("job_country")), max_len=100)
    city = _safe_str(_first(raw.get("city")), max_len=100)

    remote_flag = raw.get("remote_friendly", raw.get("remote"))
    workplace = _safe_str(raw.get("workplace_type")) or ("Remote" if remote_flag is True else None)

    salary_min, salary_max, currency = _extract_salary(raw)

    return {
        "id": _job_identity(raw),
        "title": title,
        "company": company,
        "companyLogo": logo,
        "location": location,
        "country": country,
        "city": city,
        "workplaceType": workplace,
        "employmentType": _safe_str(_first(raw.get("employment_type"), raw.get("job_type"), raw.get("type")), max_len=60),
        "salaryMin": salary_min,
        "salaryMax": salary_max,
        "salaryCurrency": currency,
        "description": _strip_html(_first(raw.get("description"), raw.get("job_description"))),
        "skills": _extract_skills(raw),
        "postedAt": _parse_posted_at(_first(raw.get("posted_at"), raw.get("posted_date"), raw.get("created_at"))),
        "source": _safe_str(raw.get("source"), max_len=60) or "theirstack",
        "applyUrl": apply_url,
    }


def normalize_jobs(raw_jobs: Any) -> list[dict[str, Any]]:
    """Normalize a list and drop duplicates by identity."""
    if not isinstance(raw_jobs, list):
        return []
    seen: set[str] = set()
    jobs: list[dict[str, Any]] = []
    for raw in raw_jobs:
        job = normalize_job(raw)
        if job and job["id"] not in seen:
            seen.add(job["id"])
            jobs.append(job)
    return jobs
