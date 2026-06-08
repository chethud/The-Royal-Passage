from fastapi import APIRouter, Depends, HTTPException, Query

from app.config import settings
from app.dependencies.auth import get_current_user, require_guest
from app.models.schemas import BookingSummary, CreateBookingRequest, CreateBookingResponse
from app.services.bookings import (
    cancel_guest_booking,
    create_cod_booking,
    get_booking_by_id,
    list_guest_bookings,
)

router = APIRouter(prefix="/api/v1", tags=["bookings"])


@router.post("/bookings", response_model=CreateBookingResponse)
def create_booking(payload: CreateBookingRequest, auth=Depends(require_guest)):
    if not settings.supabase_configured:
        raise HTTPException(status_code=503, detail="Supabase is not configured on the API server.")
    try:
        return create_cod_booking(payload, auth)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/bookings/me", response_model=list[BookingSummary])
def my_bookings(
    status: str | None = Query(default=None, pattern="^(upcoming|past|cancelled)$"),
    auth=Depends(require_guest),
):
    if not settings.supabase_configured:
        raise HTTPException(status_code=503, detail="Supabase is not configured on the API server.")
    return list_guest_bookings(auth, status)


@router.get("/bookings/{booking_id}", response_model=BookingSummary)
def booking_detail(booking_id: str, auth=Depends(get_current_user)):
    if not settings.supabase_configured:
        raise HTTPException(status_code=503, detail="Supabase is not configured on the API server.")
    try:
        return get_booking_by_id(booking_id, auth)
    except ValueError as exc:
        msg = str(exc)
        code = 403 if "access" in msg.lower() else 404
        raise HTTPException(status_code=code, detail=msg) from exc


@router.post("/bookings/{booking_id}/cancel", response_model=BookingSummary)
def cancel_booking(booking_id: str, auth=Depends(require_guest)):
    if not settings.supabase_configured:
        raise HTTPException(status_code=503, detail="Supabase is not configured on the API server.")
    try:
        return cancel_guest_booking(booking_id, auth)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
