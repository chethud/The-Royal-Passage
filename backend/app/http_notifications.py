from __future__ import annotations

from starlette.requests import Request
from starlette.responses import JSONResponse

from app.http_auth import authenticate_request_user_only
from app.services.notifications import (
    DEFAULT_NOTIFICATION_LIMIT,
    list_user_notifications,
    mark_all_notifications_read,
    mark_notification_read,
)


def _parse_limit(request: Request) -> int:
    raw = request.query_params.get("limit")
    if raw is None:
        return DEFAULT_NOTIFICATION_LIMIT
    try:
        return int(raw)
    except ValueError:
        return DEFAULT_NOTIFICATION_LIMIT


async def notifications_list(request: Request) -> JSONResponse:
    auth = authenticate_request_user_only(request)
    if isinstance(auth, JSONResponse):
        return auth
    rows = [
        row.model_dump(mode="json")
        for row in list_user_notifications(auth, limit=_parse_limit(request))
    ]
    return JSONResponse(
        rows,
        headers={
            "Cache-Control": "private, max-age=15",
        },
    )


async def notification_mark_read(request: Request) -> JSONResponse:
    auth = authenticate_request_user_only(request)
    if isinstance(auth, JSONResponse):
        return auth
    try:
        row = mark_notification_read(auth, request.path_params["notification_id"])
    except ValueError as exc:
        return JSONResponse({"detail": str(exc)}, status_code=400)
    return JSONResponse(row.model_dump(mode="json"))


async def notifications_mark_all_read(request: Request) -> JSONResponse:
    auth = authenticate_request_user_only(request)
    if isinstance(auth, JSONResponse):
        return auth
    count = mark_all_notifications_read(auth)
    return JSONResponse({"ok": True, "count": count})
