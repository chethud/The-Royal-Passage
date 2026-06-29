from __future__ import annotations

from collections.abc import Callable
from typing import TypeVar

from postgrest.exceptions import APIError

T = TypeVar("T")


def is_schema_mismatch_error(exc: Exception) -> bool:
    if not isinstance(exc, APIError):
        return False

    parts = [exc.message or "", exc.details or "", exc.hint or "", exc.code or ""]
    text = " ".join(parts).lower()
    if exc.message == "from_json":
        return True
    return (
        "does not exist" in text
        or "schema cache" in text
        or "could not find" in text
        and "column" in text
    )


def run_supabase_query(fn: Callable[[], T], *, fallback: T | None = None) -> T:
    try:
        return fn()
    except APIError as exc:
        if fallback is not None and is_schema_mismatch_error(exc):
            return fallback
        raise
