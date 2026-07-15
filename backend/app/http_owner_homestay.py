from __future__ import annotations

from starlette.requests import Request
from starlette.responses import JSONResponse

from app.http_auth import require_homestay_owner_request
from app.services.owner_homestay_bookings import get_owner_homestay_revenue
from app.services.revenue_periods import REVENUE_PERIODS


def _owner_value_error(exc: ValueError) -> JSONResponse:
    return JSONResponse({"detail": str(exc)}, status_code=400)


async def owner_homestay_revenue(request: Request) -> JSONResponse:
    auth = require_homestay_owner_request(request)
    if isinstance(auth, JSONResponse):
        return auth
    period = request.query_params.get("period", "month")
    if period not in REVENUE_PERIODS:
        return JSONResponse(
            {"detail": "Invalid revenue period. Use month, monthwise, months_6, or year."},
            status_code=400,
        )
    try:
        return JSONResponse(get_owner_homestay_revenue(auth, period).model_dump(mode="json"))
    except ValueError as exc:
        return _owner_value_error(exc)
