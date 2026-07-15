from __future__ import annotations

from starlette.requests import Request
from starlette.responses import JSONResponse

from app.config import settings
from app.dependencies.supabase import get_supabase_admin
from app.services.profiles import ensure_user_profile
from app.services.ttl_cache import TtlCache, token_cache_key
from app.services.user_roles import profile_has_role

# Avoid repeating Supabase Auth get_user on every notification poll.
_auth_user_cache: TtlCache[object] = TtlCache(ttl_seconds=45.0, max_size=256)
_profile_cache: TtlCache[dict] = TtlCache(ttl_seconds=45.0, max_size=256)


def _read_bearer_token(request: Request) -> str | None:
    auth = request.headers.get("authorization") or request.headers.get("Authorization")
    if not auth or not auth.lower().startswith("bearer "):
        return None
    token = auth[7:].strip()
    return token or None


def _resolve_auth_user(token: str):
    cache_key = token_cache_key(token)
    cached = _auth_user_cache.get(cache_key)
    if cached is not None:
        return cached

    supabase = get_supabase_admin()
    result = supabase.auth.get_user(token)
    user = result.user if result else None
    if user is not None:
        _auth_user_cache.set(cache_key, user)
    return user


def authenticate_request(request: Request) -> dict | JSONResponse:
    if not settings.supabase_configured:
        return JSONResponse(
            {"detail": "Supabase is not configured on the API server."},
            status_code=503,
        )

    token = _read_bearer_token(request)
    if not token:
        return JSONResponse({"detail": "Missing bearer token."}, status_code=401)

    try:
        user = _resolve_auth_user(token)
    except Exception as exc:
        message = str(exc)
        lowered = message.lower()
        if "session_id" in lowered or "session from session_id" in lowered:
            message = (
                "Session expired or revoked. Sign out and sign in again "
                f"(details: {exc})"
            )
        return JSONResponse(
            {"detail": f"Could not validate session: {message}"},
            status_code=401,
        )

    if not user:
        return JSONResponse({"detail": "Invalid or expired token."}, status_code=401)

    try:
        profile_key = f"profile:{user.id}"
        profile = _profile_cache.get(profile_key)
        if profile is None:
            profile = ensure_user_profile(get_supabase_admin(), user)
            _profile_cache.set(profile_key, profile)
    except Exception as exc:
        return JSONResponse(
            {"detail": f"Failed to load user profile: {exc}"},
            status_code=500,
        )

    return {"user": user, "profile": profile, "token": token}


def authenticate_request_user_only(request: Request) -> dict | JSONResponse:
    """Fast auth for endpoints that only need user.id (skips profile/roles)."""
    if not settings.supabase_configured:
        return JSONResponse(
            {"detail": "Supabase is not configured on the API server."},
            status_code=503,
        )

    token = _read_bearer_token(request)
    if not token:
        return JSONResponse({"detail": "Missing bearer token."}, status_code=401)

    try:
        user = _resolve_auth_user(token)
    except Exception as exc:
        return JSONResponse(
            {"detail": f"Could not validate session: {exc}"},
            status_code=401,
        )

    if not user:
        return JSONResponse({"detail": "Invalid or expired token."}, status_code=401)

    return {"user": user, "token": token}


def require_role_request(request: Request, role: str) -> dict | JSONResponse:
    auth = authenticate_request(request)
    if isinstance(auth, JSONResponse):
        return auth
    try:
        allowed = profile_has_role(auth["profile"], role, get_supabase_admin())
    except Exception as exc:
        return JSONResponse(
            {"detail": f"Failed to verify {role} access: {exc}"},
            status_code=500,
        )
    if not allowed:
        return JSONResponse({"detail": f"{role.title()} access required."}, status_code=403)
    return auth


def require_admin_request(request: Request) -> dict | JSONResponse:
    return require_role_request(request, "admin")


def require_host_request(request: Request) -> dict | JSONResponse:
    return require_role_request(request, "host")


def require_homestay_owner_request(request: Request) -> dict | JSONResponse:
    return require_role_request(request, "homestay_owner")


def require_guest_request(request: Request) -> dict | JSONResponse:
    return require_role_request(request, "guest")
