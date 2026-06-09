from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.dependencies.supabase import get_supabase_admin
from app.services.profiles import ensure_user_profile

bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
):
    if not credentials or not credentials.credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing bearer token.")

    supabase = get_supabase_admin()
    result = supabase.auth.get_user(credentials.credentials)
    user = result.user if result else None

    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token.")

    try:
        row = ensure_user_profile(supabase, user)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc),
        ) from exc

    return {"user": user, "profile": row, "token": credentials.credentials}


async def require_admin(auth=Depends(get_current_user)):
    if auth["profile"].get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required.")
    return auth


async def require_guest(auth=Depends(get_current_user)):
    if auth["profile"].get("role") != "guest":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Guest access required.")
    return auth


async def require_host(auth=Depends(get_current_user)):
    if auth["profile"].get("role") != "host":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Host access required.")
    return auth
