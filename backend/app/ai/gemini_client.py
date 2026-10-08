"""Server-only Gemini adapter. The API key never leaves the backend."""
from __future__ import annotations

import asyncio
import json
import re
from typing import Any

import httpx

from ..core.config import get_settings

GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"


class GeminiError(RuntimeError):
    """Raised when Gemini returns an unusable response."""


class GeminiQuotaError(GeminiError):
    """Raised when the configured Gemini project has exhausted its quota."""


class GeminiTemporaryError(GeminiError):
    """Raised when Gemini is temporarily unavailable and retrying may help."""


def _extract_json(text: str) -> dict[str, Any]:
    """Parse JSON out of a model response, tolerating code fences."""
    cleaned = re.sub(r"^```(?:json)?\s*|\s*```$", "", text.strip(), flags=re.MULTILINE)
    try:
        parsed = json.loads(cleaned)
    except json.JSONDecodeError as exc:
        raise GeminiError(f"Gemini returned invalid JSON: {exc}") from exc
    if not isinstance(parsed, dict):
        raise GeminiError("Gemini returned non-object JSON")
    return parsed


async def generate_structured(
    prompt: str,
    *,
    system: str,
    use_grounding: bool = False,
) -> dict[str, Any]:
    """Call Gemini and return validated JSON. Raises GeminiError on failure."""
    settings = get_settings()
    if not settings.gemini_api_key:
        raise GeminiError("GEMINI_API_KEY is not configured on the backend")

    model = settings.gemini_model
    url = GEMINI_URL.format(model=model)
    payload: dict[str, Any] = {
        "system_instruction": {"parts": [{"text": system}]},
        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.4,
            "maxOutputTokens": 8192,
            "responseMimeType": "application/json",
        },
    }
    if use_grounding:
        payload["tools"] = [{"google_search": {}}]

    try:
        async with httpx.AsyncClient(timeout=90) as client:
            for attempt in range(3):
                resp = await client.post(url, params={"key": settings.gemini_api_key}, json=payload)
                if resp.status_code != 503 or attempt == 2:
                    break
                await asyncio.sleep(attempt + 1)
    except httpx.RequestError as exc:
        raise GeminiTemporaryError("Could not reach the Gemini API. Please try again shortly.") from exc
    if resp.status_code != 200:
        error = GeminiQuotaError if resp.status_code == 429 else GeminiTemporaryError if resp.status_code >= 500 else GeminiError
        raise error(f"Gemini API error {resp.status_code}: {resp.text[:300]}")
    data = resp.json()

    try:
        text = data["candidates"][0]["content"]["parts"][0]["text"]
    except (KeyError, IndexError) as exc:
        raise GeminiError("Gemini returned no content") from exc

    return _extract_json(text)


async def analyze_document(
    document_bytes: bytes,
    mime_type: str,
    *,
    system: str,
    prompt: str,
) -> dict[str, Any]:
    """Send a document (PDF etc.) to Gemini for structured analysis.

    Uses Gemini's inline document understanding; suitable for resume-sized files.
    """
    settings = get_settings()
    if not settings.gemini_api_key:
        raise GeminiError("GEMINI_API_KEY is not configured on the backend")

    import base64

    url = GEMINI_URL.format(model=settings.gemini_model)
    payload: dict[str, Any] = {
        "system_instruction": {"parts": [{"text": system}]},
        "contents": [
            {
                "role": "user",
                "parts": [
                    {
                        "inline_data": {
                            "mime_type": mime_type,
                            "data": base64.b64encode(document_bytes).decode(),
                        }
                    },
                    {"text": prompt},
                ],
            }
        ],
        "generationConfig": {
            "temperature": 0.3,
            "maxOutputTokens": 8192,
            "responseMimeType": "application/json",
        },
    }

    try:
        async with httpx.AsyncClient(timeout=120) as client:
            resp = await client.post(url, params={"key": settings.gemini_api_key}, json=payload)
    except httpx.RequestError as exc:
        raise GeminiError("Could not reach the Gemini API. Please try again shortly.") from exc
    if resp.status_code != 200:
        error = GeminiQuotaError if resp.status_code == 429 else GeminiError
        raise error(f"Gemini API error {resp.status_code}: {resp.text[:300]}")
    data = resp.json()

    try:
        text = data["candidates"][0]["content"]["parts"][0]["text"]
    except (KeyError, IndexError) as exc:
        raise GeminiError("Gemini returned no content") from exc

    return _extract_json(text)
