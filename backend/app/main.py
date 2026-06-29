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
from app.http_bookings import (
    guest_booking_detail,
    guest_cancel_booking,
    guest_create_booking,
    guest_create_homestay_booking,
    guest_list_bookings,
)
from app.http_host import (
    host_booking_detail,
    host_bookings,
    host_categories,
    host_complete_booking,
    host_confirm_booking,
    host_dashboard,
    host_experience_create,
    host_experience_delete,
    host_experience_detail,
    host_experience_update,
    host_experiences_list,
    host_mark_paid_booking,
    host_pause_booking,
    host_reject_booking,
    host_resume_booking,
    host_revenue,
    host_reviews,
    host_slot_create,
    host_slot_delete,
    host_slot_update,
)
from app.http_notifications import (
    notification_mark_read,
    notifications_list,
    notifications_mark_all_read,
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
        Route("/api/v1/bookings", guest_create_booking, methods=["POST"]),
        Route("/api/v1/bookings/me", guest_list_bookings, methods=["GET"]),
        Route("/api/v1/bookings/{booking_id}", guest_booking_detail, methods=["GET"]),
        Route("/api/v1/bookings/{booking_id}/cancel", guest_cancel_booking, methods=["POST"]),
        Route("/api/v1/homestay-bookings", guest_create_homestay_booking, methods=["POST"]),
        Route("/api/v1/host/dashboard", host_dashboard, methods=["GET"]),
        Route("/api/v1/host/bookings", host_bookings, methods=["GET"]),
        Route("/api/v1/host/bookings/{booking_id}", host_booking_detail, methods=["GET"]),
        Route(
            "/api/v1/host/bookings/{booking_id}/confirm",
            host_confirm_booking,
            methods=["POST"],
        ),
        Route(
            "/api/v1/host/bookings/{booking_id}/reject",
            host_reject_booking,
            methods=["POST"],
        ),
        Route(
            "/api/v1/host/bookings/{booking_id}/mark-paid",
            host_mark_paid_booking,
            methods=["POST"],
        ),
        Route(
            "/api/v1/host/bookings/{booking_id}/complete",
            host_complete_booking,
            methods=["POST"],
        ),
        Route(
            "/api/v1/host/bookings/{booking_id}/pause",
            host_pause_booking,
            methods=["POST"],
        ),
        Route(
            "/api/v1/host/bookings/{booking_id}/resume",
            host_resume_booking,
            methods=["POST"],
        ),
        Route("/api/v1/host/revenue", host_revenue, methods=["GET"]),
        Route("/api/v1/host/reviews", host_reviews, methods=["GET"]),
        Route("/api/v1/host/categories", host_categories, methods=["GET"]),
        Route("/api/v1/host/experiences", host_experiences_list, methods=["GET"]),
        Route("/api/v1/host/experiences", host_experience_create, methods=["POST"]),
        Route(
            "/api/v1/host/experiences/{experience_id}",
            host_experience_detail,
            methods=["GET"],
        ),
        Route(
            "/api/v1/host/experiences/{experience_id}",
            host_experience_update,
            methods=["PATCH"],
        ),
        Route(
            "/api/v1/host/experiences/{experience_id}",
            host_experience_delete,
            methods=["DELETE"],
        ),
        Route(
            "/api/v1/host/experiences/{experience_id}/slots",
            host_slot_create,
            methods=["POST"],
        ),
        Route(
            "/api/v1/host/experiences/{experience_id}/slots/{slot_id}",
            host_slot_update,
            methods=["PATCH"],
        ),
        Route(
            "/api/v1/host/experiences/{experience_id}/slots/{slot_id}",
            host_slot_delete,
            methods=["DELETE"],
        ),
        Route("/api/v1/notifications", notifications_list, methods=["GET"]),
        Route(
            "/api/v1/notifications/read-all",
            notifications_mark_all_read,
            methods=["POST"],
        ),
        Route(
            "/api/v1/notifications/{notification_id}/read",
            notification_mark_read,
            methods=["POST"],
        ),
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
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)
