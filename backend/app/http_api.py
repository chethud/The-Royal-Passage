from __future__ import annotations

from starlette.requests import Request
from starlette.responses import JSONResponse

from app.config import settings
from app.http_auth import require_admin_request
from app.services.admin_analytics import (
    get_admin_booking_by_id,
    get_admin_homestay_stats,
    get_admin_stats,
    list_admin_activity,
    list_admin_bookings,
    list_admin_homestay_bookings,
)
from app.services.admin_experiences import (
    get_admin_experience,
    list_pending_experiences,
    publish_experience,
    reject_experience,
)
from app.services.admin_users import create_host_account, list_managed_users
from app.services.admin_risk import list_admin_risk_signals
from app.services.audit import log_audit
from app.services.site_banners import (
    delete_site_banner,
    list_active_site_banners,
    list_site_banners,
    upsert_site_banner,
)
from app.models.schemas import CreateHostRequest, UpsertSiteBannerRequest


async def healthz(_request: Request) -> JSONResponse:
    return JSONResponse(
        {
            "status": "ok",
            "supabaseConfigured": settings.supabase_configured,
            "emailConfigured": settings.email_configured,
        }
    )


async def admin_stats(request: Request) -> JSONResponse:
    try:
        auth = require_admin_request(request)
    except Exception as exc:
        return JSONResponse({"detail": f"Admin auth failed: {exc}"}, status_code=500)
    if isinstance(auth, JSONResponse):
        return auth
    if not settings.supabase_configured:
        return JSONResponse(
            {"detail": "Supabase is not configured on the API server."},
            status_code=503,
        )
    try:
        return JSONResponse(
            get_admin_stats().model_dump(mode="json"),
            headers={"Cache-Control": "private, max-age=20"},
        )
    except Exception as exc:
        from app.models.schemas import AdminStats

        try:
            empty = AdminStats(
                totalGuests=0,
                totalHosts=0,
                publishedExperiences=0,
                totalBookings=0,
                revenueCollectedMinor=0,
                pendingExperienceReviews=0,
                currencySymbol="₹",
            ).model_dump(mode="json")
            return JSONResponse(empty)
        except Exception:
            return JSONResponse({"detail": f"Failed to load admin stats: {exc}"}, status_code=500)


async def admin_homestay_stats(request: Request) -> JSONResponse:
    auth = require_admin_request(request)
    if isinstance(auth, JSONResponse):
        return auth
    if not settings.supabase_configured:
        return JSONResponse(
            {"detail": "Supabase is not configured on the API server."},
            status_code=503,
        )
    try:
        return JSONResponse(get_admin_homestay_stats().model_dump(mode="json"))
    except Exception as exc:
        return JSONResponse({"detail": f"Failed to load homestay stats: {exc}"}, status_code=500)


async def admin_homestay_bookings(request: Request) -> JSONResponse:
    auth = require_admin_request(request)
    if isinstance(auth, JSONResponse):
        return auth
    status_raw = (request.query_params.get("status") or "").strip()
    statuses = [part.strip() for part in status_raw.split(",") if part.strip()] or None
    rows = [
        row.model_dump(mode="json")
        for row in list_admin_homestay_bookings(statuses=statuses, limit=100)
    ]
    return JSONResponse(rows)


async def admin_bookings(request: Request) -> JSONResponse:
    auth = require_admin_request(request)
    if isinstance(auth, JSONResponse):
        return auth
    status_raw = (request.query_params.get("status") or "").strip()
    statuses = [part.strip() for part in status_raw.split(",") if part.strip()] or None
    try:
        limit = int(request.query_params.get("limit") or 100)
    except ValueError:
        limit = 100
    # Full bookings page may refresh auto-complete; alert polls must stay cheap.
    run_auto = (request.query_params.get("autoComplete") or "").lower() in {
        "1",
        "true",
        "yes",
    }
    rows = [
        row.model_dump(mode="json")
        for row in list_admin_bookings(
            limit=limit,
            statuses=statuses,
            run_auto_complete=run_auto and not statuses,
        )
    ]
    return JSONResponse(
        rows,
        headers={"Cache-Control": "private, max-age=10"},
    )


async def admin_booking_detail(request: Request) -> JSONResponse:
    auth = require_admin_request(request)
    if isinstance(auth, JSONResponse):
        return auth
    booking_id = request.path_params["booking_id"]
    try:
        row = get_admin_booking_by_id(booking_id)
    except ValueError as exc:
        return JSONResponse({"detail": str(exc)}, status_code=404)
    return JSONResponse(row.model_dump(mode="json"))


async def admin_activity(request: Request) -> JSONResponse:
    auth = require_admin_request(request)
    if isinstance(auth, JSONResponse):
        return auth
    rows = [row.model_dump(mode="json") for row in list_admin_activity()]
    return JSONResponse(rows)


async def admin_users(request: Request) -> JSONResponse:
    auth = require_admin_request(request)
    if isinstance(auth, JSONResponse):
        return auth
    rows = [row.model_dump(mode="json") for row in list_managed_users()]
    return JSONResponse(rows)


async def admin_experiences(request: Request) -> JSONResponse:
    auth = require_admin_request(request)
    if isinstance(auth, JSONResponse):
        return auth
    try:
        limit = int(request.query_params.get("limit") or 50)
    except ValueError:
        limit = 50
    rows = [
        row.model_dump(mode="json")
        for row in list_pending_experiences(limit=limit)
    ]
    return JSONResponse(
        rows,
        headers={"Cache-Control": "private, max-age=15"},
    )


async def admin_experience_detail(request: Request) -> JSONResponse:
    auth = require_admin_request(request)
    if isinstance(auth, JSONResponse):
        return auth
    experience_id = request.path_params["experience_id"]
    try:
        row = get_admin_experience(experience_id)
    except ValueError as exc:
        return JSONResponse({"detail": str(exc)}, status_code=404)
    return JSONResponse(row.model_dump(mode="json"))


async def admin_publish_experience(request: Request) -> JSONResponse:
    auth = require_admin_request(request)
    if isinstance(auth, JSONResponse):
        return auth
    experience_id = request.path_params["experience_id"]
    try:
        result = publish_experience(experience_id)
        log_audit(auth["user"].id, "experience_published", "experience", experience_id, {})
    except ValueError as exc:
        return JSONResponse({"detail": str(exc)}, status_code=400)
    return JSONResponse(result.model_dump(mode="json"))


async def admin_reject_experience(request: Request) -> JSONResponse:
    auth = require_admin_request(request)
    if isinstance(auth, JSONResponse):
        return auth
    experience_id = request.path_params["experience_id"]
    try:
        result = reject_experience(experience_id)
        log_audit(auth["user"].id, "experience_rejected", "experience", experience_id, {})
    except ValueError as exc:
        return JSONResponse({"detail": str(exc)}, status_code=400)
    return JSONResponse(result.model_dump(mode="json"))


async def admin_create_host(request: Request) -> JSONResponse:
    auth = require_admin_request(request)
    if isinstance(auth, JSONResponse):
        return auth
    try:
        payload = CreateHostRequest.model_validate(await request.json())
        result = create_host_account(payload)
        log_audit(
            auth["user"].id,
            "host_signup",
            "host",
            result.hostId,
            {"email": payload.email},
        )
    except ValueError as exc:
        return JSONResponse({"detail": str(exc)}, status_code=400)
    except Exception as exc:
        return JSONResponse({"detail": str(exc)}, status_code=400)
    return JSONResponse(result.model_dump(mode="json"))


async def admin_risk_signals(request: Request) -> JSONResponse:
    auth = require_admin_request(request)
    if isinstance(auth, JSONResponse):
        return auth
    rows = [row.model_dump(mode="json") for row in list_admin_risk_signals()]
    return JSONResponse(rows, headers={"Cache-Control": "private, max-age=30"})


async def admin_site_banners(request: Request) -> JSONResponse:
    auth = require_admin_request(request)
    if isinstance(auth, JSONResponse):
        return auth
    rows = [row.model_dump(mode="json") for row in list_site_banners()]
    return JSONResponse({"banners": rows})


async def admin_upsert_site_banner(request: Request) -> JSONResponse:
    auth = require_admin_request(request)
    if isinstance(auth, JSONResponse):
        return auth
    try:
        payload = UpsertSiteBannerRequest.model_validate(await request.json())
        banner = upsert_site_banner(payload)
        log_audit(auth["user"].id, "banner_scheduled", "banner", banner.id, {"title": banner.title})
    except Exception as exc:
        return JSONResponse({"detail": str(exc)}, status_code=400)
    return JSONResponse(banner.model_dump(mode="json"))


async def admin_delete_site_banner(request: Request) -> JSONResponse:
    auth = require_admin_request(request)
    if isinstance(auth, JSONResponse):
        return auth
    banner_id = request.path_params["banner_id"]
    delete_site_banner(banner_id)
    log_audit(auth["user"].id, "banner_deleted", "banner", banner_id, {})
    return JSONResponse({"ok": True})


async def public_active_site_banners(request: Request) -> JSONResponse:
    placement = (request.query_params.get("placement") or "home_top").strip()
    rows = [row.model_dump(mode="json") for row in list_active_site_banners(placement)]
    return JSONResponse(
        {"banners": rows},
        headers={"Cache-Control": "public, max-age=60"},
    )