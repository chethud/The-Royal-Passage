from datetime import date, datetime, timezone

from app.booking_window import assert_slot_still_bookable
from app.dependencies.supabase import get_supabase_admin
from app.services.booking_auto_complete import (
    auto_complete_booking_if_due,
    auto_complete_due_confirmed_bookings,
)
from app.models.schemas import (
    BookingExperienceSummary,
    BookingSlotSummary,
    BookingSummary,
    CreateBookingRequest,
    CreateBookingResponse,
)


def _currency_symbol(code: str) -> str:
    if code == "INR":
        return "₹"
    if code == "EUR":
        return "€"
    if code == "USD":
        return "$"
    return "₹"


def _format_time(value: str) -> str:
    return value[:5] if value and len(value) >= 5 else value or ""


def _reserve_seats(supabase, slot_id: str, guest_count: int) -> bool:
    try:
        result = supabase.rpc(
            "reserve_booking_seats",
            {"p_slot_id": slot_id, "p_guest_count": guest_count},
        ).execute()
        if result.data is True:
            return True
    except Exception:
        pass

    slot_result = (
        supabase.table("experience_slots")
        .select("capacity, seats_sold, is_blocked")
        .eq("id", slot_id)
        .maybe_single()
        .execute()
    )
    slot = slot_result.data if slot_result else None
    if not slot or slot.get("is_blocked"):
        return False

    available = max(0, slot["capacity"] - slot.get("seats_sold", 0))
    if guest_count > available:
        return False

    supabase.table("experience_slots").update(
        {"seats_sold": slot.get("seats_sold", 0) + guest_count}
    ).eq("id", slot_id).execute()
    return True


def _release_seats(supabase, slot_id: str, guest_count: int) -> None:
    try:
        supabase.rpc(
            "release_booking_seats",
            {"p_slot_id": slot_id, "p_guest_count": guest_count},
        ).execute()
    except Exception:
        slot_result = (
            supabase.table("experience_slots")
            .select("seats_sold")
            .eq("id", slot_id)
            .maybe_single()
            .execute()
        )
        slot = slot_result.data if slot_result else None
        if slot:
            new_sold = max(0, slot.get("seats_sold", 0) - guest_count)
            supabase.table("experience_slots").update({"seats_sold": new_sold}).eq("id", slot_id).execute()


def create_cod_booking(payload: CreateBookingRequest, auth: dict) -> CreateBookingResponse:
    supabase = get_supabase_admin()
    user = auth["user"]
    profile = auth["profile"]

    guest_name = profile.get("full_name") or user.email or "Guest"
    guest_email = user.email or ""
    guest_phone = profile.get("phone")

    slot_result = (
        supabase.table("experience_slots")
        .select(
            "*, experiences ( id, title, host_id, price_per_person_minor, currency_code, status, "
            "min_guests_per_booking, max_guests_per_booking )"
        )
        .eq("id", payload.slotId)
        .maybe_single()
        .execute()
    )
    slot = slot_result.data if slot_result else None
    if not slot:
        raise ValueError("Slot not found.")
    if slot.get("is_blocked"):
        raise ValueError("This slot is not available.")

    assert_slot_still_bookable(slot.get("slot_date", ""), slot.get("start_time"))

    experience = slot.get("experiences")
    if not experience or experience.get("status") != "published":
        raise ValueError("Experience is not available for booking.")

    min_guests = int(experience.get("min_guests_per_booking") or 1)
    max_guests = int(experience.get("max_guests_per_booking") or 10)
    if payload.guestCount < min_guests:
        raise ValueError(f"At least {min_guests} guest(s) required for this experience.")
    if payload.guestCount > max_guests:
        raise ValueError(f"This experience allows at most {max_guests} guest(s) per booking.")

    if not _reserve_seats(supabase, payload.slotId, payload.guestCount):
        raise ValueError("Not enough seats left for this slot.")

    fee_result = (
        supabase.table("platform_settings")
        .select("value")
        .eq("key", "commission_percent")
        .maybe_single()
        .execute()
    )
    fee_row = fee_result.data if fee_result else None
    raw_fee = (fee_row or {}).get("value", 10)
    try:
        commission_percent = float(raw_fee)
    except (TypeError, ValueError):
        commission_percent = 10.0

    subtotal_minor = experience["price_per_person_minor"] * payload.guestCount
    platform_fee_minor = round((subtotal_minor * commission_percent) / 100)
    host_payout_minor = subtotal_minor - platform_fee_minor

    booking_row = {
        "slot_id": payload.slotId,
        "experience_id": experience["id"],
        "guest_id": user.id,
        "customer_user_id": user.id,
        "guest_email": guest_email,
        "guest_name": guest_name,
        "guest_phone": guest_phone,
        "guest_count": payload.guestCount,
        "participant_count": payload.guestCount,
        "subtotal_minor": subtotal_minor,
        "total_amount": subtotal_minor,
        "platform_fee_minor": platform_fee_minor,
        "host_payout_minor": host_payout_minor,
        "currency_code": experience["currency_code"],
        "payment_method": "cod",
        "payment_status": "pending",
        "booking_status": "pending",
        "status": "pending_payment",
        "notes": payload.notes,
    }

    booking_result = supabase.table("bookings").insert(booking_row).select("id").execute()
    booking_rows = booking_result.data or []
    booking = booking_rows[0] if booking_rows else None
    if not booking:
        _release_seats(supabase, payload.slotId, payload.guestCount)
        raise ValueError("Failed to create booking.")

    from app.services.audit import log_audit
    from app.services.notifications import create_notification

    title = experience.get("title") or "your experience"
    create_notification(
        user.id,
        "booking_created",
        "Booking requested",
        f"Your request for {title} was submitted. The host will confirm shortly.",
        {"bookingId": booking["id"]},
    )
    host_result = (
        supabase.table("hosts")
        .select("auth_user_id")
        .eq("id", experience.get("host_id"))
        .maybe_single()
        .execute()
    )
    host_user_id = ((host_result.data if host_result else None) or {}).get("auth_user_id")
    if host_user_id:
        create_notification(
            host_user_id,
            "booking_created",
            "New booking request",
            f"A guest requested {title}. Review it in your host dashboard.",
            {"bookingId": booking["id"]},
        )
    log_audit(user.id, "booking_created", "booking", booking["id"], {"experienceId": experience["id"]})

    return CreateBookingResponse(
        bookingId=booking["id"],
        totalAmount=subtotal_minor,
        currencyCode=experience["currency_code"],
        bookingStatus="pending",
        paymentStatus="pending",
        paymentMethod="cod",
    )


def _map_booking_row(row: dict) -> BookingSummary:
    exp = row.get("experiences") or {}
    host = exp.get("hosts") or {}
    slot = row.get("experience_slots") or {}
    currency = row.get("currency_code") or "INR"

    return BookingSummary(
        id=row["id"],
        experience=BookingExperienceSummary(
            id=exp.get("id", ""),
            slug=exp.get("slug", ""),
            title=exp.get("title", "Experience"),
            city=exp.get("city", ""),
            address=exp.get("address") or "",
            image=exp.get("hero_image_url") or "",
            hostName=host.get("display_name") or "Host",
        ),
        slot=BookingSlotSummary(
            id=slot.get("id", ""),
            date=slot.get("slot_date", ""),
            start=_format_time(slot.get("start_time", "")),
            end=_format_time(slot.get("end_time", "")),
        ),
        participantCount=row.get("participant_count") or row.get("guest_count") or 1,
        totalAmount=row.get("total_amount") or row.get("subtotal_minor") or 0,
        currencyCode=currency,
        currencySymbol=_currency_symbol(currency),
        bookingStatus=row.get("booking_status") or "pending",
        paymentStatus=row.get("payment_status") or "pending",
        paymentMethod=row.get("payment_method") or "cod",
        notes=row.get("notes"),
        createdAt=row.get("created_at", ""),
        confirmedAt=row.get("confirmed_at"),
        guestName=row.get("guest_name"),
        guestEmail=row.get("guest_email"),
        guestPhone=row.get("guest_phone"),
        isPaused=bool(row.get("is_paused")),
        pausedAt=row.get("paused_at"),
    )


BOOKING_SELECT = """
    *,
    experience_slots ( id, slot_date, start_time, end_time ),
    experiences (
      id, slug, title, city, address, hero_image_url, host_id,
      hosts ( display_name )
    )
"""


def list_guest_bookings(auth: dict, status_filter: str | None = None) -> list[BookingSummary]:
    supabase = get_supabase_admin()
    user_id = auth["user"].id

    auto_complete_due_confirmed_bookings(supabase, guest_id=user_id)

    query = (
        supabase.table("bookings")
        .select(
            """
            *,
            experience_slots ( id, slot_date, start_time, end_time ),
            experiences (
              id, slug, title, city, address, hero_image_url,
              hosts ( display_name )
            )
            """
        )
        .eq("guest_id", user_id)
        .order("created_at", desc=True)
    )

    if status_filter == "upcoming":
        query = query.in_("booking_status", ["pending", "confirmed"])
    elif status_filter == "past":
        query = query.eq("booking_status", "completed")
    elif status_filter == "cancelled":
        query = query.eq("booking_status", "cancelled")

    result = query.execute()
    rows = result.data or []

    if status_filter == "upcoming":
        today = date.today()
        rows = [
            row
            for row in rows
            if (slot := (row.get("experience_slots") or {}).get("slot_date"))
            and date.fromisoformat(str(slot)[:10]) >= today
        ]

    return [_map_booking_row(row) for row in rows]


def get_booking_by_id(booking_id: str, auth: dict) -> BookingSummary:
    supabase = get_supabase_admin()
    user_id = auth["user"].id

    result = (
        supabase.table("bookings")
        .select(
            """
            *,
            experience_slots ( id, slot_date, start_time, end_time ),
            experiences (
              id, slug, title, city, address, hero_image_url,
              hosts ( display_name )
            )
            """
        )
        .eq("id", booking_id)
        .maybe_single()
        .execute()
    )
    row = result.data if result else None
    if not row:
        raise ValueError("Booking not found.")

    auto_complete_booking_if_due(supabase, row)

    if row.get("guest_id") != user_id:
        role = auth.get("profile", {}).get("role")
        if role != "admin":
            raise ValueError("You do not have access to this booking.")

    return _map_booking_row(row)


def cancel_guest_booking(booking_id: str, auth: dict) -> BookingSummary:
    supabase = get_supabase_admin()
    user_id = auth["user"].id

    result = (
        supabase.table("bookings")
        .select("*")
        .eq("id", booking_id)
        .maybe_single()
        .execute()
    )
    row = result.data if result else None
    if not row:
        raise ValueError("Booking not found.")
    if row.get("guest_id") != user_id:
        raise ValueError("You do not have access to this booking.")

    booking_status = row.get("booking_status") or "pending"
    if booking_status not in ("pending", "confirmed"):
        raise ValueError("This booking can no longer be cancelled.")

    guest_count = row.get("participant_count") or row.get("guest_count") or 1
    now = datetime.now(timezone.utc).isoformat()

    supabase.table("bookings").update(
        {
            "booking_status": "cancelled",
            "status": "cancelled_by_guest",
            "cancelled_at": now,
            "cancelled_by": "guest",
        }
    ).eq("id", booking_id).execute()

    _release_seats(supabase, row["slot_id"], guest_count)

    from app.services.audit import log_audit
    from app.services.notifications import create_notification

    create_notification(
        user_id,
        "booking_cancelled",
        "Booking cancelled",
        "Your booking was cancelled.",
        {"bookingId": booking_id},
    )
    log_audit(user_id, "booking_cancelled", "booking", booking_id, {"by": "guest"})

    return get_booking_by_id(booking_id, auth)
