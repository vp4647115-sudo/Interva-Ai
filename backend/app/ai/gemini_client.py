"""Server-only Gemini adapter. The API key never leaves the backend."""
from __future__ import annotations

import json
import re
from typing import Any

import httpx

from ..core.config import get_settings

GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"


class GeminiError(RuntimeError):
    """Raised when Gemini returns an unusable response."""


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

    async with httpx.AsyncClient(timeout=90) as client:
        resp = await client.post(
            url,
            params={"key": settings.gemini_api_key},
            json=payload,
        )
        if resp.status_code != 200:
            raise GeminiError(f"Gemini API error {resp.status_code}: {resp.text[:300]}")
        data = resp.json()

    try:
        text = data["candidates"][0]["content"]["parts"][0]["text"]
    except (KeyError, IndexError) as exc:
        raise GeminiError("Gemini returned no content") from exc

    return _extract_json(text)
