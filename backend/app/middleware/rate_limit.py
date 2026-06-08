import time
from collections import defaultdict
from threading import Lock

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Simple in-memory per-IP rate limiter for stateless API hosts."""

    def __init__(self, app, requests_per_minute: int = 120):
        super().__init__(app)
        self.requests_per_minute = max(1, requests_per_minute)
        self._buckets: dict[str, list[float]] = defaultdict(list)
        self._lock = Lock()

    def _client_ip(self, request: Request) -> str:
        forwarded = request.headers.get("x-forwarded-for")
        if forwarded:
            return forwarded.split(",")[0].strip()
        if request.client:
            return request.client.host
        return "unknown"

    def _is_allowed(self, key: str) -> bool:
        now = time.time()
        window_start = now - 60
        with self._lock:
            hits = [t for t in self._buckets[key] if t >= window_start]
            if len(hits) >= self.requests_per_minute:
                self._buckets[key] = hits
                return False
            hits.append(now)
            self._buckets[key] = hits
            return True

    async def dispatch(self, request: Request, call_next) -> Response:
        if request.url.path in ("/health", "/api/v1/health"):
            return await call_next(request)

        if not self._is_allowed(self._client_ip(request)):
            return JSONResponse(
                status_code=429,
                content={"detail": "Too many requests. Please try again shortly."},
            )

        return await call_next(request)
