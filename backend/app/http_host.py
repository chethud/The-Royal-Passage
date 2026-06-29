from __future__ import annotations

from starlette.requests import Request
from starlette.responses import JSONResponse

from app.http_auth import require_host_request
from app.models.schemas import CreateHostExperienceRequest, CreateHostSlotRequest, UpdateHostExperienceRequest, UpdateHostSlotRequest
from app.services.host_bookings import (
    complete_host_booking,
    confirm_host_booking,
    get_host_booking_by_id,
    get_host_dashboard,
    get_host_revenue,
    list_host_bookings,
    list_host_reviews,
    mark_host_booking_paid,
    pause_host_booking,
    reject_host_booking,
    resume_host_booking,
)
from app.services.host_experiences import (
    create_host_experience,
    create_host_slot,
    delete_host_experience,
    delete_host_slot,
    get_host_experience,
    list_categories,
    list_host_experiences,
    update_host_experience,
    update_host_slot,
)

_HOST_BOOKING_STATUSES = frozenset({"pending", "confirmed", "completed", "cancelled", "upcoming", "today"})


def _host_value_error(exc: ValueError) -> JSONResponse:
    return JSONResponse({"detail": str(exc)}, status_code=400)


async def host_dashboard(request: Request) -> JSONResponse:
    auth = require_host_request(request)
    if isinstance(auth, JSONResponse):
        return auth
    try:
        return JSONResponse(get_host_dashboard(auth).model_dump(mode="json"))
    except ValueError as exc:
        return _host_value_error(exc)


async def host_bookings(request: Request) -> JSONResponse:
    auth = require_host_request(request)
    if isinstance(auth, JSONResponse):
        return auth
    status = request.query_params.get("status")
    if status and status not in _HOST_BOOKING_STATUSES:
        return JSONResponse({"detail": "Invalid booking status filter."}, status_code=400)
    try:
        rows = [row.model_dump(mode="json") for row in list_host_bookings(auth, status)]
    except ValueError as exc:
        return _host_value_error(exc)
    return JSONResponse(rows)


async def host_booking_detail(request: Request) -> JSONResponse:
    auth = require_host_request(request)
    if isinstance(auth, JSONResponse):
        return auth
    try:
        row = get_host_booking_by_id(request.path_params["booking_id"], auth)
    except ValueError as exc:
        return _host_value_error(exc)
    return JSONResponse(row.model_dump(mode="json"))


async def host_revenue(request: Request) -> JSONResponse:
    auth = require_host_request(request)
    if isinstance(auth, JSONResponse):
        return auth
    try:
        return JSONResponse(get_host_revenue(auth).model_dump(mode="json"))
    except ValueError as exc:
        return _host_value_error(exc)


async def host_reviews(request: Request) -> JSONResponse:
    auth = require_host_request(request)
    if isinstance(auth, JSONResponse):
        return auth
    try:
        rows = [row.model_dump(mode="json") for row in list_host_reviews(auth)]
    except ValueError as exc:
        return _host_value_error(exc)
    return JSONResponse(rows)


async def host_categories(request: Request) -> JSONResponse:
    auth = require_host_request(request)
    if isinstance(auth, JSONResponse):
        return auth
    return JSONResponse([row.model_dump(mode="json") for row in list_categories()])


async def host_experiences_list(request: Request) -> JSONResponse:
    auth = require_host_request(request)
    if isinstance(auth, JSONResponse):
        return auth
    try:
        rows = [row.model_dump(mode="json") for row in list_host_experiences(auth)]
    except ValueError as exc:
        return _host_value_error(exc)
    return JSONResponse(rows)


async def host_experience_create(request: Request) -> JSONResponse:
    auth = require_host_request(request)
    if isinstance(auth, JSONResponse):
        return auth
    try:
        payload = CreateHostExperienceRequest.model_validate(await request.json())
        row = create_host_experience(auth, payload)
    except ValueError as exc:
        return _host_value_error(exc)
    return JSONResponse(row.model_dump(mode="json"))


async def host_experience_detail(request: Request) -> JSONResponse:
    auth = require_host_request(request)
    if isinstance(auth, JSONResponse):
        return auth
    try:
        row = get_host_experience(auth, request.path_params["experience_id"])
    except ValueError as exc:
        return _host_value_error(exc)
    return JSONResponse(row.model_dump(mode="json"))


async def host_experience_update(request: Request) -> JSONResponse:
    auth = require_host_request(request)
    if isinstance(auth, JSONResponse):
        return auth
    try:
        payload = UpdateHostExperienceRequest.model_validate(await request.json())
        row = update_host_experience(auth, request.path_params["experience_id"], payload)
    except ValueError as exc:
        return _host_value_error(exc)
    return JSONResponse(row.model_dump(mode="json"))


async def host_experience_delete(request: Request) -> JSONResponse:
    auth = require_host_request(request)
    if isinstance(auth, JSONResponse):
        return auth
    try:
        delete_host_experience(auth, request.path_params["experience_id"])
    except ValueError as exc:
        return _host_value_error(exc)
    return JSONResponse({"ok": True})


async def host_slot_create(request: Request) -> JSONResponse:
    auth = require_host_request(request)
    if isinstance(auth, JSONResponse):
        return auth
    try:
        payload = CreateHostSlotRequest.model_validate(await request.json())
        row = create_host_slot(auth, request.path_params["experience_id"], payload)
    except ValueError as exc:
        return _host_value_error(exc)
    return JSONResponse(row.model_dump(mode="json"))


async def host_slot_update(request: Request) -> JSONResponse:
    auth = require_host_request(request)
    if isinstance(auth, JSONResponse):
        return auth
    try:
        payload = UpdateHostSlotRequest.model_validate(await request.json())
        row = update_host_slot(
            auth,
            request.path_params["experience_id"],
            request.path_params["slot_id"],
            payload,
        )
    except ValueError as exc:
        return _host_value_error(exc)
    return JSONResponse(row.model_dump(mode="json"))


async def host_slot_delete(request: Request) -> JSONResponse:
    auth = require_host_request(request)
    if isinstance(auth, JSONResponse):
        return auth
    try:
        row = delete_host_slot(
            auth,
            request.path_params["experience_id"],
            request.path_params["slot_id"],
        )
    except ValueError as exc:
        return _host_value_error(exc)
    return JSONResponse(row.model_dump(mode="json"))


async def _host_booking_action(request: Request, action: str) -> JSONResponse:
    auth = require_host_request(request)
    if isinstance(auth, JSONResponse):
        return auth
    booking_id = request.path_params["booking_id"]
    try:
        if action == "confirm":
            row = confirm_host_booking(booking_id, auth)
        elif action == "reject":
            row = reject_host_booking(booking_id, auth)
        elif action == "mark-paid":
            row = mark_host_booking_paid(booking_id, auth)
        elif action == "complete":
            row = complete_host_booking(booking_id, auth)
        elif action == "pause":
            row = pause_host_booking(booking_id, auth)
        elif action == "resume":
            row = resume_host_booking(booking_id, auth)
        else:
            return JSONResponse({"detail": "Unknown action."}, status_code=400)
    except ValueError as exc:
        return _host_value_error(exc)
    return JSONResponse(row.model_dump(mode="json"))


async def host_confirm_booking(request: Request) -> JSONResponse:
    return await _host_booking_action(request, "confirm")


async def host_reject_booking(request: Request) -> JSONResponse:
    return await _host_booking_action(request, "reject")


async def host_mark_paid_booking(request: Request) -> JSONResponse:
    return await _host_booking_action(request, "mark-paid")


async def host_complete_booking(request: Request) -> JSONResponse:
    return await _host_booking_action(request, "complete")


async def host_pause_booking(request: Request) -> JSONResponse:
    return await _host_booking_action(request, "pause")


async def host_resume_booking(request: Request) -> JSONResponse:
    return await _host_booking_action(request, "resume")
