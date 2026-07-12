from __future__ import annotations

import hashlib
import threading
import time
from typing import Any, Generic, TypeVar

T = TypeVar("T")


class TtlCache(Generic[T]):
    """Tiny process-local TTL cache for hot read paths (notifications, auth)."""

    def __init__(self, ttl_seconds: float = 20.0, max_size: int = 512) -> None:
        self.ttl_seconds = ttl_seconds
        self.max_size = max_size
        self._data: dict[str, tuple[float, T]] = {}
        self._lock = threading.Lock()

    def get(self, key: str) -> T | None:
        now = time.monotonic()
        with self._lock:
            item = self._data.get(key)
            if item is None:
                return None
            expires_at, value = item
            if expires_at < now:
                self._data.pop(key, None)
                return None
            return value

    def set(self, key: str, value: T) -> None:
        now = time.monotonic()
        with self._lock:
            if len(self._data) >= self.max_size:
                expired = [k for k, (exp, _) in self._data.items() if exp < now]
                for key_to_drop in expired:
                    self._data.pop(key_to_drop, None)
                while len(self._data) >= self.max_size and self._data:
                    self._data.pop(next(iter(self._data)))
            self._data[key] = (now + self.ttl_seconds, value)

    def delete(self, key: str) -> None:
        with self._lock:
            self._data.pop(key, None)

    def delete_prefix(self, prefix: str) -> None:
        with self._lock:
            for key in [k for k in self._data if k.startswith(prefix)]:
                self._data.pop(key, None)


def token_cache_key(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()
