from __future__ import annotations

from starlette.requests import Request
from starlette.responses import JSONResponse

from app.config import settings
from app.dependencies.supabase import get_supabase_admin
from app.services.profiles import ensure_user_profile


def _read_bearer_token(request: Request) -> str | None:
    auth = request.headers.get("authorization") or request.headers.get("Authorization")
    if not auth or not auth.lower().startswith("bearer "):
        return None
    token = auth[7:].strip()
    return token or None


def authenticate_request(request: Request) -> dict | JSONResponse:
    if not settings.supabase_configured:
        return JSONResponse(
            {"detail": "Supabase is not configured on the API server."},
            status_code=503,
        )

    token = _read_bearer_token(request)
    if not token:
        return JSONResponse({"detail": "Missing bearer token."}, status_code=401)

    supabase = get_supabase_admin()
    result = supabase.auth.get_user(token)
    user = result.user if result else None
    if not user:
        return JSONResponse({"detail": "Invalid or expired token."}, status_code=401)

    try:
        profile = ensure_user_profile(supabase, user)
    except ValueError as exc:
        return JSONResponse({"detail": str(exc)}, status_code=500)

    return {"user": user, "profile": profile, "token": token}


def require_role_request(request: Request, role: str) -> dict | JSONResponse:
    auth = authenticate_request(request)
    if isinstance(auth, JSONResponse):
        return auth
    if auth["profile"].get("role") != role:
        return JSONResponse({"detail": f"{role.title()} access required."}, status_code=403)
    return auth


def require_admin_request(request: Request) -> dict | JSONResponse:
    return require_role_request(request, "admin")


def require_host_request(request: Request) -> dict | JSONResponse:
    return require_role_request(request, "host")


def require_guest_request(request: Request) -> dict | JSONResponse:
    return require_role_request(request, "guest")
