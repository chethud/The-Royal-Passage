from __future__ import annotations

from starlette.requests import Request
from starlette.responses import JSONResponse

from app.http_auth import authenticate_request
from app.services.notifications import (
    list_user_notifications,
    mark_all_notifications_read,
    mark_notification_read,
)


async def notifications_list(request: Request) -> JSONResponse:
    auth = authenticate_request(request)
    if isinstance(auth, JSONResponse):
        return auth
    rows = [row.model_dump(mode="json") for row in list_user_notifications(auth)]
    return JSONResponse(rows)


async def notification_mark_read(request: Request) -> JSONResponse:
    auth = authenticate_request(request)
    if isinstance(auth, JSONResponse):
        return auth
    try:
        row = mark_notification_read(auth, request.path_params["notification_id"])
    except ValueError as exc:
        return JSONResponse({"detail": str(exc)}, status_code=400)
    return JSONResponse(row.model_dump(mode="json"))


async def notifications_mark_all_read(request: Request) -> JSONResponse:
    auth = authenticate_request(request)
    if isinstance(auth, JSONResponse):
        return auth
    count = mark_all_notifications_read(auth)
    return JSONResponse({"ok": True, "count": count})
