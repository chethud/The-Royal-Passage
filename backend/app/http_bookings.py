from __future__ import annotations

import logging

from starlette.requests import Request
from starlette.responses import JSONResponse

from app.http_auth import authenticate_request, require_guest_request
from app.models.schemas import CreateBookingRequest, CreateHomestayBookingRequest
from app.services.bookings import (
    cancel_guest_booking,
    create_cod_booking,
    get_booking_by_id,
    list_guest_bookings,
)
from app.services.homestay_bookings import create_homestay_booking

logger = logging.getLogger(__name__)

_GUEST_BOOKING_STATUSES = frozenset({"upcoming", "past", "cancelled"})


def _value_error(exc: ValueError, *, forbidden: bool = False) -> JSONResponse:
    msg = str(exc)
    lowered = msg.lower()
    if forbidden or "access" in lowered or "frozen" in lowered:
        return JSONResponse({"detail": msg}, status_code=403)
    return JSONResponse({"detail": msg}, status_code=400)


async def guest_create_booking(request: Request) -> JSONResponse:
    auth = require_guest_request(request)
    if isinstance(auth, JSONResponse):
        return auth
    try:
        payload = CreateBookingRequest.model_validate(await request.json())
        result = create_cod_booking(payload, auth)
    except ValueError as exc:
        return _value_error(exc)
    return JSONResponse(result.model_dump(mode="json"))


async def guest_list_bookings(request: Request) -> JSONResponse:
    auth = require_guest_request(request)
    if isinstance(auth, JSONResponse):
        return auth
    status = request.query_params.get("status")
    if status and status not in _GUEST_BOOKING_STATUSES:
        return JSONResponse({"detail": "Invalid booking status filter."}, status_code=400)
    rows = [row.model_dump(mode="json") for row in list_guest_bookings(auth, status)]
    return JSONResponse(rows)


async def guest_booking_detail(request: Request) -> JSONResponse:
    auth = authenticate_request(request)
    if isinstance(auth, JSONResponse):
        return auth
    try:
        row = get_booking_by_id(request.path_params["booking_id"], auth)
    except ValueError as exc:
        return _value_error(exc, forbidden=True)
    return JSONResponse(row.model_dump(mode="json"))


async def guest_cancel_booking(request: Request) -> JSONResponse:
    auth = require_guest_request(request)
    if isinstance(auth, JSONResponse):
        return auth
    try:
        row = cancel_guest_booking(request.path_params["booking_id"], auth)
    except ValueError as exc:
        return _value_error(exc)
    return JSONResponse(row.model_dump(mode="json"))


async def guest_create_homestay_booking(request: Request) -> JSONResponse:
    auth = require_guest_request(request)
    if isinstance(auth, JSONResponse):
        return auth
    try:
        payload = CreateHomestayBookingRequest.model_validate(await request.json())
        result = create_homestay_booking(payload, auth)
    except ValueError as exc:
        return _value_error(exc)
    return JSONResponse(result.model_dump(mode="json"))
