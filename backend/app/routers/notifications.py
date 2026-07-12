from fastapi import APIRouter, Depends, HTTPException

from app.config import settings
from app.dependencies.auth import get_current_user
from app.models.schemas import NotificationSummary
from app.services.notifications import (
    list_user_notifications,
    mark_all_notifications_read,
    mark_notification_read,
)

router = APIRouter(prefix="/api/v1/notifications", tags=["notifications"])


@router.get("", response_model=list[NotificationSummary])
def get_notifications(limit: int | None = None, auth=Depends(get_current_user)):
    if not settings.supabase_configured:
        raise HTTPException(status_code=503, detail="Supabase is not configured on the API server.")
    return list_user_notifications(auth, limit=limit)


@router.post("/{notification_id}/read", response_model=NotificationSummary)
def read_notification(notification_id: str, auth=Depends(get_current_user)):
    if not settings.supabase_configured:
        raise HTTPException(status_code=503, detail="Supabase is not configured on the API server.")
    try:
        return mark_notification_read(auth, notification_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/read-all")
def read_all_notifications(auth=Depends(get_current_user)):
    if not settings.supabase_configured:
        raise HTTPException(status_code=503, detail="Supabase is not configured on the API server.")
    count = mark_all_notifications_read(auth)
    return {"ok": True, "count": count}
