from __future__ import annotations

from starlette.requests import Request
from starlette.responses import JSONResponse

from app.http_auth import require_admin_request, require_travel_agent_request
from app.services.travel_agent_bookings import (
    list_admin_travel_agent_bookings,
    list_travel_agent_bookings,
)

_AGENT_BOOKING_STATUSES = frozenset(
    {"pending", "confirmed", "completed", "cancelled", "upcoming", "today"},
)


def _value_error(exc: ValueError) -> JSONResponse:
    return JSONResponse({"detail": str(exc)}, status_code=400)


async def travel_agent_bookings(request: Request) -> JSONResponse:
    auth = require_travel_agent_request(request)
    if isinstance(auth, JSONResponse):
        return auth
    status = request.query_params.get("status")
    if status and status not in _AGENT_BOOKING_STATUSES:
        return JSONResponse({"detail": "Invalid booking status filter."}, status_code=400)
    try:
        rows = [row.model_dump(mode="json") for row in list_travel_agent_bookings(auth, status)]
    except ValueError as exc:
        return _value_error(exc)
    return JSONResponse(rows)


async def admin_travel_agent_bookings(request: Request) -> JSONResponse:
    auth = require_admin_request(request)
    if isinstance(auth, JSONResponse):
        return auth
    status_raw = (request.query_params.get("status") or "").strip()
    statuses = [part.strip() for part in status_raw.split(",") if part.strip()] or None
    try:
        limit = int(request.query_params.get("limit") or 100)
    except ValueError:
        limit = 100
    rows = [
        row.model_dump(mode="json")
        for row in list_admin_travel_agent_bookings(statuses=statuses, limit=limit)
    ]
    return JSONResponse(rows)
