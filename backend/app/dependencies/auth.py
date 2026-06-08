from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.dependencies.supabase import get_supabase_admin

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

    profile = (
        supabase.table("profiles")
        .select("role, full_name, phone, host_id")
        .eq("id", user.id)
        .maybe_single()
        .execute()
    )

    row = profile.data
    if not row:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Profile not found.")

    return {"user": user, "profile": row}


async def require_admin(auth=Depends(get_current_user)):
    if auth["profile"].get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required.")
    return auth
