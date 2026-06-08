from fastapi import APIRouter, HTTPException

from app.config import settings
from app.models.schemas import CreateBookingRequest, CreateBookingResponse
from app.services.bookings import create_pending_booking

router = APIRouter(prefix="/api/v1", tags=["bookings"])


@router.post("/bookings", response_model=CreateBookingResponse)
def create_booking(payload: CreateBookingRequest):
    if not settings.supabase_configured:
        raise HTTPException(status_code=503, detail="Supabase is not configured on the API server.")
    try:
        return create_pending_booking(payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
