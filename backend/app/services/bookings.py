from datetime import datetime, timedelta, timezone

from app.dependencies.supabase import get_supabase_admin
from app.models.schemas import CreateBookingRequest, CreateBookingResponse


def create_pending_booking(payload: CreateBookingRequest) -> CreateBookingResponse:
    supabase = get_supabase_admin()

    slot_result = (
        supabase.table("experience_slots")
        .select("*, experiences ( id, price_per_person_minor, currency_code )")
        .eq("id", payload.slotId)
        .maybe_single()
        .execute()
    )
    slot = slot_result.data
    if not slot:
        raise ValueError("Slot not found.")
    if slot.get("is_blocked"):
        raise ValueError("This slot is not available.")

    available = max(0, slot["capacity"] - slot.get("seats_sold", 0))
    if payload.guestCount > available:
        raise ValueError("Not enough seats left for this slot.")

    experience = slot.get("experiences")
    if not experience:
        raise ValueError("Experience not found for this slot.")

    fee_result = (
        supabase.table("platform_settings")
        .select("value")
        .eq("key", "commission_percent")
        .maybe_single()
        .execute()
    )
    raw_fee = (fee_result.data or {}).get("value", 12.5)
    try:
        commission_percent = float(raw_fee)
    except (TypeError, ValueError):
        commission_percent = 12.5

    subtotal_minor = experience["price_per_person_minor"] * payload.guestCount
    platform_fee_minor = round((subtotal_minor * commission_percent) / 100)
    host_payout_minor = subtotal_minor - platform_fee_minor
    hold_expires = (datetime.now(timezone.utc) + timedelta(minutes=15)).isoformat()

    booking_result = (
        supabase.table("bookings")
        .insert(
            {
                "slot_id": payload.slotId,
                "guest_email": str(payload.guestEmail),
                "guest_name": payload.guestName,
                "guest_phone": payload.guestPhone,
                "guest_count": payload.guestCount,
                "status": "pending_payment",
                "subtotal_minor": subtotal_minor,
                "platform_fee_minor": platform_fee_minor,
                "host_payout_minor": host_payout_minor,
                "currency_code": experience["currency_code"],
                "hold_expires_at": hold_expires,
            }
        )
        .select("id")
        .single()
        .execute()
    )

    booking = booking_result.data
    if not booking:
        raise ValueError("Failed to create booking.")

    return CreateBookingResponse(
        bookingId=booking["id"],
        subtotalMinor=subtotal_minor,
        status="pending_payment",
    )
