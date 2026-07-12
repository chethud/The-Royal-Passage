from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.dependencies.supabase import get_supabase_admin
from app.services.profiles import ensure_user_profile
from app.services.user_roles import profile_has_role

bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
):
    if not credentials or not credentials.credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing bearer token.")

    try:
        supabase = get_supabase_admin()
        result = supabase.auth.get_user(credentials.credentials)
        user = result.user if result else None
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not validate session: {exc}",
        ) from exc

    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token.")

    try:
        row = ensure_user_profile(supabase, user)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to load user profile: {exc}",
        ) from exc

    return {"user": user, "profile": row, "token": credentials.credentials}


async def require_admin(auth=Depends(get_current_user)):
    try:
        allowed = profile_has_role(auth["profile"], "admin", get_supabase_admin())
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to verify admin access: {exc}",
        ) from exc
    if not allowed:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required.")
    return auth


async def require_guest(auth=Depends(get_current_user)):
    if not profile_has_role(auth["profile"], "guest", get_supabase_admin()):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Guest access required.")
    return auth


async def require_host(auth=Depends(get_current_user)):
    if not profile_has_role(auth["profile"], "host", get_supabase_admin()):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Host access required.")
    return auth
