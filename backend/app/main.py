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
