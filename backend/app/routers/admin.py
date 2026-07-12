from fastapi import APIRouter, Depends, HTTPException

from app.config import settings
from app.dependencies.auth import require_admin
from app.models.schemas import (
    AdminBookingRow,
    AdminExperienceDetail,
    AdminExperienceSummary,
    AdminHomestayStats,
    AdminStats,
    AuditLogEntry,
    BookingSummary,
    CreateHostRequest,
    CreateHostResponse,
    ManagedUser,
)
from app.services.admin_analytics import (
    get_admin_booking_by_id,
    get_admin_homestay_stats,
    get_admin_stats,
    list_admin_activity,
    list_admin_bookings,
)
from app.services.admin_experiences import (
    get_admin_experience,
    list_pending_experiences,
    publish_experience,
    reject_experience,
)
from app.services.admin_users import create_host_account, list_managed_users
from app.services.audit import log_audit

router = APIRouter(prefix="/api/v1/admin", tags=["admin"])


@router.get("/stats", response_model=AdminStats)
def admin_stats(_auth=Depends(require_admin)):
    if not settings.supabase_configured:
        raise HTTPException(status_code=503, detail="Supabase is not configured on the API server.")
    return get_admin_stats()


@router.get("/homestay-stats", response_model=AdminHomestayStats)
def admin_homestay_stats(_auth=Depends(require_admin)):
    if not settings.supabase_configured:
        raise HTTPException(status_code=503, detail="Supabase is not configured on the API server.")
    return get_admin_homestay_stats()


@router.get("/bookings", response_model=list[AdminBookingRow])
def admin_bookings(
    status: str | None = None,
    limit: int = 100,
    autoComplete: bool = False,
    _auth=Depends(require_admin),
):
    if not settings.supabase_configured:
        raise HTTPException(status_code=503, detail="Supabase is not configured on the API server.")
    statuses = [part.strip() for part in (status or "").split(",") if part.strip()] or None
    return list_admin_bookings(
        limit=limit,
        statuses=statuses,
        run_auto_complete=autoComplete and not statuses,
    )


@router.get("/bookings/{booking_id}", response_model=BookingSummary)
def admin_get_booking(booking_id: str, _auth=Depends(require_admin)):
    if not settings.supabase_configured:
        raise HTTPException(status_code=503, detail="Supabase is not configured on the API server.")
    try:
        return get_admin_booking_by_id(booking_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get("/activity", response_model=list[AuditLogEntry])
def admin_activity(_auth=Depends(require_admin)):
    if not settings.supabase_configured:
        raise HTTPException(status_code=503, detail="Supabase is not configured on the API server.")
    return list_admin_activity()


@router.get("/users", response_model=list[ManagedUser])
def admin_users(_auth=Depends(require_admin)):
    if not settings.supabase_configured:
        raise HTTPException(status_code=503, detail="Supabase is not configured on the API server.")
    return list_managed_users()


@router.post("/hosts", response_model=CreateHostResponse)
def admin_create_host(payload: CreateHostRequest, _auth=Depends(require_admin)):
    if not settings.supabase_configured:
        raise HTTPException(status_code=503, detail="Supabase is not configured on the API server.")
    try:
        return create_host_account(payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/experiences", response_model=list[AdminExperienceSummary])
def admin_pending_experiences(limit: int = 50, _auth=Depends(require_admin)):
    if not settings.supabase_configured:
        raise HTTPException(status_code=503, detail="Supabase is not configured on the API server.")
    return list_pending_experiences(limit=limit)


@router.get("/experiences/{experience_id}", response_model=AdminExperienceDetail)
def admin_get_experience(experience_id: str, _auth=Depends(require_admin)):
    if not settings.supabase_configured:
        raise HTTPException(status_code=503, detail="Supabase is not configured on the API server.")
    try:
        return get_admin_experience(experience_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.post("/experiences/{experience_id}/publish", response_model=AdminExperienceSummary)
def admin_publish_experience(experience_id: str, _auth=Depends(require_admin)):
    if not settings.supabase_configured:
        raise HTTPException(status_code=503, detail="Supabase is not configured on the API server.")
    try:
        result = publish_experience(experience_id)
        log_audit(_auth["user"].id, "experience_published", "experience", experience_id, {})
        return result
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/experiences/{experience_id}/reject", response_model=AdminExperienceSummary)
def admin_reject_experience(experience_id: str, _auth=Depends(require_admin)):
    if not settings.supabase_configured:
        raise HTTPException(status_code=503, detail="Supabase is not configured on the API server.")
    try:
        return reject_experience(experience_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
