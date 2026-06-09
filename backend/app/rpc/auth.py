from connectrpc.code import Code
from connectrpc.errors import ConnectError
from connectrpc.request import RequestContext

from app.dependencies.supabase import get_supabase_admin


def _read_bearer_token(ctx: RequestContext) -> str:
    headers = ctx.request_headers()
    auth = headers.get("authorization") or headers.get("Authorization")
    if not auth or not auth.lower().startswith("bearer "):
        raise ConnectError(Code.UNAUTHENTICATED, "Missing bearer token.")
    return auth[7:].strip()


def resolve_current_user(ctx: RequestContext) -> dict:
    token = _read_bearer_token(ctx)
    supabase = get_supabase_admin()
    result = supabase.auth.get_user(token)
    user = result.user if result else None
    if not user:
        raise ConnectError(Code.UNAUTHENTICATED, "Invalid or expired token.")

    profile = (
        supabase.table("profiles")
        .select("role, full_name, phone, host_id, created_at")
        .eq("id", user.id)
        .maybe_single()
        .execute()
    )
    row = profile.data if profile else None
    if not row:
        raise ConnectError(Code.PERMISSION_DENIED, "Profile not found.")

    return {"user": user, "profile": row, "token": token}


def require_admin(ctx: RequestContext) -> dict:
    auth = resolve_current_user(ctx)
    if auth["profile"].get("role") != "admin":
        raise ConnectError(Code.PERMISSION_DENIED, "Admin access required.")
    return auth


def require_guest(ctx: RequestContext) -> dict:
    auth = resolve_current_user(ctx)
    if auth["profile"].get("role") != "guest":
        raise ConnectError(Code.PERMISSION_DENIED, "Guest access required.")
    return auth


def require_host(ctx: RequestContext) -> dict:
    auth = resolve_current_user(ctx)
    if auth["profile"].get("role") != "host":
        raise ConnectError(Code.PERMISSION_DENIED, "Host access required.")
    return auth
