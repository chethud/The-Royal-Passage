from fastapi import APIRouter, Depends, HTTPException, Query

from app.config import settings
from app.dependencies.auth import require_host
from app.models.schemas import (
    BookingSummary,
    CategoryOption,
    CreateHostExperienceRequest,
    CreateHostSlotRequest,
    HostDashboardStats,
    HostExperienceDetail,
    HostExperienceSummary,
    HostRevenueSummary,
    HostReviewSummary,
    UpdateHostExperienceRequest,
    UpdateHostSlotRequest,
)
from app.services.host_experiences import (
    create_host_experience,
    create_host_slot,
    delete_host_experience,
    delete_host_slot,
    get_host_experience,
    list_categories,
    list_host_experiences,
    update_host_experience,
    update_host_slot,
)
from app.services.host_bookings import (
    complete_host_booking,
    confirm_host_booking,
    get_host_booking_by_id,
    get_host_dashboard,
    get_host_revenue,
    list_host_bookings,
    list_host_reviews,
    mark_host_booking_paid,
    reject_host_booking,
)

router = APIRouter(prefix="/api/v1/host", tags=["host"])


@router.get("/dashboard", response_model=HostDashboardStats)
def host_dashboard(_auth=Depends(require_host)):
    if not settings.supabase_configured:
        raise HTTPException(status_code=503, detail="Supabase is not configured on the API server.")
    try:
        return get_host_dashboard(_auth)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/bookings", response_model=list[BookingSummary])
def host_bookings(
    status: str | None = Query(
        default=None,
        pattern="^(pending|confirmed|completed|cancelled|upcoming|today)$",
    ),
    _auth=Depends(require_host),
):
    if not settings.supabase_configured:
        raise HTTPException(status_code=503, detail="Supabase is not configured on the API server.")
    try:
        return list_host_bookings(_auth, status)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/bookings/{booking_id}", response_model=BookingSummary)
def host_booking_detail(booking_id: str, _auth=Depends(require_host)):
    if not settings.supabase_configured:
        raise HTTPException(status_code=503, detail="Supabase is not configured on the API server.")
    try:
        return get_host_booking_by_id(booking_id, _auth)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/revenue", response_model=HostRevenueSummary)
def host_revenue(_auth=Depends(require_host)):
    if not settings.supabase_configured:
        raise HTTPException(status_code=503, detail="Supabase is not configured on the API server.")
    try:
        return get_host_revenue(_auth)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/reviews", response_model=list[HostReviewSummary])
def host_reviews(_auth=Depends(require_host)):
    if not settings.supabase_configured:
        raise HTTPException(status_code=503, detail="Supabase is not configured on the API server.")
    try:
        return list_host_reviews(_auth)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/categories", response_model=list[CategoryOption])
def host_categories(_auth=Depends(require_host)):
    if not settings.supabase_configured:
        raise HTTPException(status_code=503, detail="Supabase is not configured on the API server.")
    return list_categories()


@router.get("/experiences", response_model=list[HostExperienceSummary])
def host_experiences_list(_auth=Depends(require_host)):
    if not settings.supabase_configured:
        raise HTTPException(status_code=503, detail="Supabase is not configured on the API server.")
    try:
        return list_host_experiences(_auth)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/experiences", response_model=HostExperienceDetail)
def host_experience_create(payload: CreateHostExperienceRequest, _auth=Depends(require_host)):
    if not settings.supabase_configured:
        raise HTTPException(status_code=503, detail="Supabase is not configured on the API server.")
    try:
        return create_host_experience(_auth, payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/experiences/{experience_id}", response_model=HostExperienceDetail)
def host_experience_detail(experience_id: str, _auth=Depends(require_host)):
    if not settings.supabase_configured:
        raise HTTPException(status_code=503, detail="Supabase is not configured on the API server.")
    try:
        return get_host_experience(_auth, experience_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.patch("/experiences/{experience_id}", response_model=HostExperienceDetail)
def host_experience_update(
    experience_id: str, payload: UpdateHostExperienceRequest, _auth=Depends(require_host)
):
    if not settings.supabase_configured:
        raise HTTPException(status_code=503, detail="Supabase is not configured on the API server.")
    try:
        return update_host_experience(_auth, experience_id, payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.delete("/experiences/{experience_id}")
def host_experience_delete(experience_id: str, _auth=Depends(require_host)):
    if not settings.supabase_configured:
        raise HTTPException(status_code=503, detail="Supabase is not configured on the API server.")
    try:
        delete_host_experience(_auth, experience_id)
        return {"ok": True}
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/experiences/{experience_id}/slots", response_model=HostExperienceDetail)
def host_slot_create(
    experience_id: str, payload: CreateHostSlotRequest, _auth=Depends(require_host)
):
    if not settings.supabase_configured:
        raise HTTPException(status_code=503, detail="Supabase is not configured on the API server.")
    try:
        return create_host_slot(_auth, experience_id, payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.patch("/experiences/{experience_id}/slots/{slot_id}", response_model=HostExperienceDetail)
def host_slot_update(
    experience_id: str,
    slot_id: str,
    payload: UpdateHostSlotRequest,
    _auth=Depends(require_host),
):
    if not settings.supabase_configured:
        raise HTTPException(status_code=503, detail="Supabase is not configured on the API server.")
    try:
        return update_host_slot(_auth, experience_id, slot_id, payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.delete("/experiences/{experience_id}/slots/{slot_id}", response_model=HostExperienceDetail)
def host_slot_delete(experience_id: str, slot_id: str, _auth=Depends(require_host)):
    if not settings.supabase_configured:
        raise HTTPException(status_code=503, detail="Supabase is not configured on the API server.")
    try:
        return delete_host_slot(_auth, experience_id, slot_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/bookings/{booking_id}/confirm", response_model=BookingSummary)
def host_confirm_booking(booking_id: str, _auth=Depends(require_host)):
    if not settings.supabase_configured:
        raise HTTPException(status_code=503, detail="Supabase is not configured on the API server.")
    try:
        return confirm_host_booking(booking_id, _auth)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/bookings/{booking_id}/reject", response_model=BookingSummary)
def host_reject_booking(booking_id: str, _auth=Depends(require_host)):
    if not settings.supabase_configured:
        raise HTTPException(status_code=503, detail="Supabase is not configured on the API server.")
    try:
        return reject_host_booking(booking_id, _auth)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/bookings/{booking_id}/mark-paid", response_model=BookingSummary)
def host_mark_paid(booking_id: str, _auth=Depends(require_host)):
    if not settings.supabase_configured:
        raise HTTPException(status_code=503, detail="Supabase is not configured on the API server.")
    try:
        return mark_host_booking_paid(booking_id, _auth)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/bookings/{booking_id}/complete", response_model=BookingSummary)
def host_complete_booking(booking_id: str, _auth=Depends(require_host)):
    if not settings.supabase_configured:
        raise HTTPException(status_code=503, detail="Supabase is not configured on the API server.")
    try:
        return complete_host_booking(booking_id, _auth)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
