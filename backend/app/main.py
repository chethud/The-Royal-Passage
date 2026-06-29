import sys
from pathlib import Path

# Generated protobuf modules use `royalpassage.v1.*` imports.
_GEN_ROOT = Path(__file__).resolve().parent / "rpc" / "gen"
if str(_GEN_ROOT) not in sys.path:
    sys.path.insert(0, str(_GEN_ROOT))

from starlette.applications import Starlette
from starlette.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse
from starlette.routing import Mount, Route

from app.config import settings
from app.http_api import (
    admin_activity,
    admin_booking_detail,
    admin_bookings,
    admin_create_host,
    admin_experience_detail,
    admin_experiences,
    admin_publish_experience,
    admin_reject_experience,
    admin_stats,
    admin_users,
    healthz,
)
from app.rpc.servicer import RoyalPassageServiceImpl
from royalpassage.v1.service_connect import RoyalPassageServiceASGIApplication

connect_app = RoyalPassageServiceASGIApplication(RoyalPassageServiceImpl())


async def cron_host_booking_reminders(request):
    if request.method == "OPTIONS":
        return JSONResponse({})
    auth = request.headers.get("authorization", "")
    token = auth[7:].strip() if auth.lower().startswith("bearer ") else ""
    if not settings.cron_secret or token != settings.cron_secret:
        return JSONResponse({"error": "Unauthorized"}, status_code=401)

    from app.services.host_booking_reminders import process_host_booking_reminders

    try:
        return JSONResponse(process_host_booking_reminders())
    except Exception as exc:
        return JSONResponse({"error": str(exc)}, status_code=500)


core_app = Starlette(
    routes=[
        Route("/healthz", healthz, methods=["GET"]),
        Route("/api/v1/admin/stats", admin_stats, methods=["GET"]),
        Route("/api/v1/admin/bookings", admin_bookings, methods=["GET"]),
        Route("/api/v1/admin/bookings/{booking_id}", admin_booking_detail, methods=["GET"]),
        Route("/api/v1/admin/activity", admin_activity, methods=["GET"]),
        Route("/api/v1/admin/users", admin_users, methods=["GET"]),
        Route("/api/v1/admin/experiences", admin_experiences, methods=["GET"]),
        Route(
            "/api/v1/admin/experiences/{experience_id}",
            admin_experience_detail,
            methods=["GET"],
        ),
        Route(
            "/api/v1/admin/experiences/{experience_id}/publish",
            admin_publish_experience,
            methods=["POST"],
        ),
        Route(
            "/api/v1/admin/experiences/{experience_id}/reject",
            admin_reject_experience,
            methods=["POST"],
        ),
        Route("/api/v1/admin/hosts", admin_create_host, methods=["POST"]),
        Route(
            "/internal/cron/host-booking-reminders",
            cron_host_booking_reminders,
            methods=["POST", "GET", "OPTIONS"],
        ),
        Mount("/", app=connect_app),
    ]
)

app = CORSMiddleware(
    core_app,
    allow_origins=settings.cors_origin_list,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)
