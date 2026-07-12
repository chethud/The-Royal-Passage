from connectrpc.code import Code
from connectrpc.errors import ConnectError
from connectrpc.request import RequestContext

from app.dependencies.supabase import get_supabase_admin
from app.services.profiles import ensure_user_profile
from app.services.user_roles import profile_has_role


def _read_bearer_token(ctx: RequestContext) -> str:
    headers = ctx.request_headers()
    auth = headers.get("authorization") or headers.get("Authorization")
    if not auth or not auth.lower().startswith("bearer "):
        raise ConnectError(Code.UNAUTHENTICATED, "Missing bearer token.")
    return auth[7:].strip()


def resolve_current_user(ctx: RequestContext) -> dict:
    token = _read_bearer_token(ctx)
    try:
        supabase = get_supabase_admin()
        result = supabase.auth.get_user(token)
        user = result.user if result else None
    except Exception as exc:
        message = str(exc)
        lowered = message.lower()
        if "session_id" in lowered or "session from session_id" in lowered:
            raise ConnectError(
                Code.UNAUTHENTICATED,
                "Session expired or revoked. Sign out and sign in again.",
            ) from exc
        raise ConnectError(Code.UNAUTHENTICATED, f"Could not validate session: {exc}") from exc

    if not user:
        raise ConnectError(Code.UNAUTHENTICATED, "Invalid or expired token.")

    try:
        row = ensure_user_profile(supabase, user)
    except Exception as exc:
        raise ConnectError(Code.INTERNAL, f"Failed to load user profile: {exc}") from exc

    return {"user": user, "profile": row, "token": token}


def require_admin(ctx: RequestContext) -> dict:
    auth = resolve_current_user(ctx)
    try:
        allowed = profile_has_role(auth["profile"], "admin", get_supabase_admin())
    except Exception as exc:
        raise ConnectError(Code.INTERNAL, f"Failed to verify admin access: {exc}") from exc
    if not allowed:
        raise ConnectError(Code.PERMISSION_DENIED, "Admin access required.")
    return auth


def require_guest(ctx: RequestContext) -> dict:
    auth = resolve_current_user(ctx)
    if not profile_has_role(auth["profile"], "guest", get_supabase_admin()):
        raise ConnectError(Code.PERMISSION_DENIED, "Guest access required.")
    return auth


def require_host(ctx: RequestContext) -> dict:
    auth = resolve_current_user(ctx)
    if not profile_has_role(auth["profile"], "host", get_supabase_admin()):
        raise ConnectError(Code.PERMISSION_DENIED, "Host access required.")
    return auth


def require_homestay_owner(ctx: RequestContext) -> dict:
    auth = resolve_current_user(ctx)
    if not profile_has_role(auth["profile"], "homestay_owner", get_supabase_admin()):
        raise ConnectError(Code.PERMISSION_DENIED, "Homestay owner access required.")
    return auth


def require_vip_owner(ctx: RequestContext) -> dict:
    auth = resolve_current_user(ctx)
    if not profile_has_role(auth["profile"], "vip_owner", get_supabase_admin()):
        raise ConnectError(Code.PERMISSION_DENIED, "VIP owner access required.")
    return auth
