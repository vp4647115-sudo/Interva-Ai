"""Short-lived in-memory cache for identical job searches.

Good enough for a single-process deployment; swap for Redis when the app
scales beyond one worker (architecture.md §1.10).
"""
from __future__ import annotations

import hashlib
import json
import time
from typing import Any

_TTL_SECONDS = 300  # 5 minutes
_MAX_ENTRIES = 200

_cache: dict[str, tuple[float, Any]] = {}


def cache_key(filters: dict[str, Any]) -> str:
    canonical = json.dumps(filters, sort_keys=True, default=str)
    return "jobs:" + hashlib.sha1(canonical.encode()).hexdigest()


def get_cached(key: str) -> Any | None:
    entry = _cache.get(key)
    if not entry:
        return None
    expires, value = entry
    if time.monotonic() > expires:
        _cache.pop(key, None)
        return None
    return value


def set_cached(key: str, value: Any) -> None:
    if len(_cache) >= _MAX_ENTRIES:
        # Drop the oldest entries first.
        for old_key in sorted(_cache, key=lambda k: _cache[k][0])[:50]:
            _cache.pop(old_key, None)
    _cache[key] = (time.monotonic() + _TTL_SECONDS, value)
