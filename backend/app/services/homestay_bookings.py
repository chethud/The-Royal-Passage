from datetime import date, timedelta
import logging

from app.dependencies.supabase import get_supabase_admin
from app.models.schemas import CreateHomestayBookingRequest, CreateHomestayBookingResponse
from app.services.homestay_availability import load_price_overrides_minor
from app.services.homestay_pricing import stay_subtotal_minor
from app.services.supabase_query import insert_row_returning_id
from app.services.transactional_emails import (
    send_homestay_booking_requested_email,
    send_host_new_homestay_booking_email,
)

HOMESTAY_SELECT = """
*,
homestay_owners ( id, full_name, auth_user_id, approval_status )
"""

logger = logging.getLogger(__name__)


def _extra_beds_per_room(value) -> int:
    return 2 if int(value or 1) >= 2 else 1


def _parse_day(value: str) -> date:
    return date.fromisoformat(str(value)[:10])


def _commission_percent(supabase) -> float:
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
        return float(raw_fee)
    except (TypeError, ValueError):
        return 10.0


def _has_booking_overlap(
    supabase,
    homestay_id: str,
    room_id: str | None,
    check_in: date,
    check_out: date,
    requested_units: int = 1,
) -> bool:
    query = (
        supabase.table("homestay_bookings")
        .select("id, room_count")
        .eq("homestay_id", homestay_id)
        .in_("booking_status", ["pending", "confirmed"])
        .lt("check_in", check_out.isoformat())
        .gt("check_out", check_in.isoformat())
    )
    if room_id:
        query = query.eq("room_id", room_id)
    result = query.execute()
    booked_units = sum(int(row.get("room_count") or 1) for row in (result.data or []))
    if room_id:
        room_result = (
            supabase.table("homestay_rooms")
            .select("total_units")
            .eq("id", room_id)
            .maybe_single()
            .execute()
        )
        room_data = room_result.data if room_result else None
        total_units = int((room_data or {}).get("total_units") or 1)
        return booked_units + requested_units > total_units
    return bool(result.data)


def _is_blocked(
    supabase,
    homestay_id: str,
    room_id: str | None,
    day: date,
) -> bool:
    query = (
        supabase.table("homestay_availability")
        .select("is_blocked")
        .eq("homestay_id", homestay_id)
        .eq("date", day.isoformat())
        .eq("is_blocked", True)
    )
    if room_id:
        query = query.or_(f"room_id.is.null,room_id.eq.{room_id}")
    result = query.limit(1).execute()
    return bool(result.data)


def create_homestay_booking(
    payload: CreateHomestayBookingRequest,
    auth: dict,
) -> CreateHomestayBookingResponse:
    supabase = get_supabase_admin()
    user = auth["user"]
    profile = auth["profile"]
    guest_name = profile.get("full_name") or user.email or "Guest"
    guest_email = user.email or ""

    check_in = _parse_day(payload.checkIn)
    check_out = _parse_day(payload.checkOut)
    if check_out <= check_in:
        raise ValueError("Check-out must be after check-in.")
    if check_in < date.today():
        raise ValueError("Check-in cannot be in the past.")

    nights = (check_out - check_in).days
    if nights < 1:
        raise ValueError("Stay must be at least one night.")

    stay_result = (
        supabase.table("homestays")
        .select(HOMESTAY_SELECT)
        .eq("id", payload.homestayId)
        .eq("status", "published")
        .maybe_single()
        .execute()
    )
    stay = stay_result.data if stay_result else None
    if not stay:
        raise ValueError("Homestay not found or not available.")

    owner = stay.get("homestay_owners") or {}
    if owner.get("approval_status") in ("rejected", "suspended"):
        raise ValueError("Homestay is not available for booking.")

    max_guests = int(stay.get("max_guests") or 2)
    if payload.guestCount < 1:
        raise ValueError("At least one guest is required.")

    room_id = payload.roomId
    room_count = max(1, int(payload.roomCount or 1))
    extra_bed_count = max(0, int(payload.extraBedCount or 0))
    price_per_night_minor = int(stay.get("price_per_night_minor") or 0)
    weekend_price_per_night_minor = stay.get("weekend_price_per_night_minor")
    extra_bed_price_minor = 0
    weekend_extra_bed_price_minor = 0
    room_capacity = max_guests

    if room_id:
        room_result = (
            supabase.table("homestay_rooms")
            .select("*")
            .eq("id", room_id)
            .eq("homestay_id", stay["id"])
            .eq("is_active", True)
            .maybe_single()
            .execute()
        )
        room = room_result.data if room_result else None
        if not room:
            raise ValueError("Room not found.")
        total_units = int(room.get("total_units") or 1)
        if room_count > total_units:
            raise ValueError(f"Only {total_units} unit(s) available for this room type.")
        room_capacity = int(room.get("capacity") or max_guests)
        price_per_night_minor = int(room.get("price_per_night_minor") or price_per_night_minor)
        weekend_price_per_night_minor = room.get("weekend_price_per_night_minor", weekend_price_per_night_minor)
        extra_bed_available = bool(room.get("extra_bed_available", False))
        extra_bed_price_minor = int(room.get("extra_bed_price_per_night_minor") or 0)
        weekend_extra_bed_price_minor = int(
            room.get("weekend_extra_bed_price_per_night_minor")
            or room.get("extra_bed_price_per_night_minor")
            or 0
        )
        if extra_bed_count > 0 and not extra_bed_available:
            raise ValueError("Extra beds are not available for this room type.")
        extra_beds_per_room = _extra_beds_per_room(room.get("extra_beds_per_room"))
        max_extra_beds = room_count * extra_beds_per_room
        if extra_bed_count > max_extra_beds:
            raise ValueError(
                f"You can add at most {max_extra_beds} extra bed(s) "
                f"({extra_beds_per_room} per room × {room_count} room(s))."
            )
        max_allowed_guests = room_count * room_capacity + extra_bed_count
        if payload.guestCount > max_allowed_guests:
            raise ValueError(
                f"This selection allows up to {max_allowed_guests} guest(s) "
                f"({room_count} room(s) × {room_capacity} + {extra_bed_count} extra bed(s))."
            )
    else:
        if room_count > 1:
            raise ValueError("Select a room type when booking multiple rooms.")
        bedrooms = int(stay.get("bedrooms") or 1)
        property_extra_bed_available = bool(stay.get("extra_bed_available", False))
        property_extra_bed_price_minor = int(stay.get("extra_bed_price_per_night_minor") or 0)
        property_weekend_extra_bed_price_minor = int(
            stay.get("weekend_extra_bed_price_per_night_minor")
            or stay.get("extra_bed_price_per_night_minor")
            or 0
        )
        if extra_bed_count > 0:
            if not property_extra_bed_available:
                raise ValueError("Extra beds are not available at this property.")
            extra_beds_per_room = _extra_beds_per_room(stay.get("extra_beds_per_room"))
            max_extra_beds = bedrooms * extra_beds_per_room
            if extra_bed_count > max_extra_beds:
                raise ValueError(
                    f"You can add at most {max_extra_beds} extra bed(s) "
                    f"({extra_beds_per_room} per bedroom × {bedrooms} bedroom(s))."
                )
            extra_bed_price_minor = property_extra_bed_price_minor
            weekend_extra_bed_price_minor = property_weekend_extra_bed_price_minor
        max_allowed_guests = max_guests + extra_bed_count
        if payload.guestCount > max_allowed_guests:
            raise ValueError(
                f"This property allows up to {max_allowed_guests} guest(s) "
                f"({max_guests} included + {extra_bed_count} extra bed(s))."
            )

    if _has_booking_overlap(supabase, stay["id"], room_id, check_in, check_out, room_count):
        raise ValueError("Selected dates are not available for the requested number of rooms.")

    day = check_in
    while day < check_out:
        if _is_blocked(supabase, stay["id"], room_id, day):
            raise ValueError("One or more nights are blocked on the calendar.")
        day += timedelta(days=1)

    price_overrides = load_price_overrides_minor(stay["id"], room_id, check_in, check_out)

    subtotal_minor = stay_subtotal_minor(
        check_in,
        check_out,
        price_per_night_minor,
        weekend_price_per_night_minor,
        room_count,
        extra_bed_price_minor,
        weekend_extra_bed_price_minor,
        extra_bed_count,
        price_overrides,
    )
    commission_percent = _commission_percent(supabase)
    platform_fee_minor = round((subtotal_minor * commission_percent) / 100)
    host_payout_minor = subtotal_minor - platform_fee_minor

    booking_row = {
        "homestay_id": stay["id"],
        "room_id": room_id,
        "guest_id": user.id,
        "check_in": check_in.isoformat(),
        "check_out": check_out.isoformat(),
        "guest_count": payload.guestCount,
        "room_count": room_count,
        "extra_bed_count": extra_bed_count,
        "subtotal_minor": subtotal_minor,
        "total_amount": subtotal_minor,
        "platform_fee_minor": platform_fee_minor,
        "host_payout_minor": host_payout_minor,
        "currency_code": stay.get("currency_code") or "INR",
        "payment_method": "cod",
        "payment_status": "pending",
        "booking_status": "pending",
        "notes": payload.notes,
    }

    booking_id = insert_row_returning_id(supabase, "homestay_bookings", booking_row)

    from app.services.audit import log_audit
    from app.services.notifications import create_notification

    title = stay.get("title") or "your stay"

    if guest_email:
        try:
            if not send_homestay_booking_requested_email(
                to=guest_email,
                guest_name=guest_name,
                stay_title=title,
                check_in=check_in.isoformat(),
                check_out=check_out.isoformat(),
                nights=nights,
                total_minor=subtotal_minor,
                currency_code=stay.get("currency_code") or "INR",
                booking_id=booking_id,
            ):
                logger.error(
                    "Guest homestay booking email not sent for %s to %s — configure RESEND_API_KEY on Render",
                    booking_id,
                    guest_email,
                )
        except Exception:
            logger.exception("Failed to send guest homestay booking email for %s", booking_id)

    try:
        from datetime import datetime, timezone

        from app.services.host_booking_reminders import resolve_host_email

        owner_email = resolve_host_email(supabase, owner.get("auth_user_id"), owner.get("email"))
        if owner_email and send_host_new_homestay_booking_email(
            to=owner_email,
            host_name=owner.get("full_name") or "Host",
            guest_name=guest_name,
            stay_title=title,
            check_in=check_in.isoformat(),
            check_out=check_out.isoformat(),
            nights=nights,
            guest_count=payload.guestCount,
            total_minor=subtotal_minor,
            currency_code=stay.get("currency_code") or "INR",
            booking_id=booking_id,
        ):
            try:
                supabase.table("homestay_bookings").update(
                    {"host_request_email_sent_at": datetime.now(timezone.utc).isoformat()}
                ).eq("id", booking_id).execute()
            except Exception:
                logger.exception("Failed to mark host_request_email_sent_at for homestay %s", booking_id)
    except Exception:
        logger.exception("Failed to send host homestay booking email for %s", booking_id)

    try:
        create_notification(
            user.id,
            "booking_created",
            "Stay requested",
            f"Your request for {title} was submitted. The host will confirm shortly. Pay in cash at check-in once confirmed.",
            {"bookingId": booking_id, "bookingType": "homestay"},
        )
        owner_user_id = owner.get("auth_user_id")
        if owner_user_id:
            create_notification(
                owner_user_id,
                "booking_created",
                "New stay request",
                f"A guest requested {title}. Review it in your dashboard.",
                {"bookingId": booking_id, "bookingType": "homestay"},
            )
    except Exception:
        logger.exception("Failed to create homestay booking notifications for %s", booking_id)

    try:
        log_audit(user.id, "homestay_booking_created", "homestay_booking", booking_id, {"homestayId": stay["id"]})
    except Exception:
        logger.exception("Failed to write homestay booking audit log for %s", booking_id)

    return CreateHomestayBookingResponse(
        bookingId=booking_id,
        totalAmount=subtotal_minor,
        currencyCode=stay.get("currency_code") or "INR",
        bookingStatus="pending",
        paymentStatus="pending",
        nights=nights,
    )


def list_guest_homestay_bookings(auth: dict, status_filter: str | None = None):
    from datetime import date

    from app.models.schemas import HomestayBookingSummary, ListHomestayBookingsResponse
    from app.services.homestay_auto_complete import auto_complete_due_homestay_bookings
    from app.services.owner_homestay_bookings import BOOKING_SELECT, _map_homestay_booking

    supabase = get_supabase_admin()
    user_id = auth["user"].id

    auto_complete_due_homestay_bookings(supabase, guest_id=user_id)

    query = (
        supabase.table("homestay_bookings")
        .select(BOOKING_SELECT)
        .eq("guest_id", user_id)
        .order("created_at", desc=True)
    )

    today = date.today().isoformat()
    if status_filter == "upcoming":
        query = query.in_("booking_status", ["pending", "confirmed"]).gte("check_out", today)
    elif status_filter == "past":
        query = query.in_("booking_status", ["completed"]).order("check_out", desc=True)
    elif status_filter == "cancelled":
        query = query.eq("booking_status", "cancelled")

    result = query.execute()
    return ListHomestayBookingsResponse(
        bookings=[_map_homestay_booking(row) for row in (result.data or [])]
    )


def get_guest_homestay_booking(auth: dict, booking_id: str) -> HomestayBookingSummary:
    from app.models.schemas import HomestayBookingSummary
    from app.services.homestay_auto_complete import auto_complete_homestay_if_due
    from app.services.owner_homestay_bookings import BOOKING_SELECT, _map_homestay_booking

    supabase = get_supabase_admin()
    user_id = auth["user"].id

    result = (
        supabase.table("homestay_bookings")
        .select(BOOKING_SELECT)
        .eq("id", booking_id)
        .maybe_single()
        .execute()
    )
    row = result.data if result else None
    if not row:
        raise ValueError("Booking not found.")
    if row.get("guest_id") != user_id:
        raise ValueError("You do not have access to this booking.")

    auto_complete_homestay_if_due(supabase, row)
    refreshed = (
        supabase.table("homestay_bookings")
        .select(BOOKING_SELECT)
        .eq("id", booking_id)
        .maybe_single()
        .execute()
    )
    row = (refreshed.data if refreshed else None) or row
    return _map_homestay_booking(row)


def cancel_guest_homestay_booking(auth: dict, booking_id: str) -> HomestayBookingSummary:
    from datetime import datetime, timezone

    from app.services.owner_homestay_bookings import BOOKING_SELECT, _map_homestay_booking

    supabase = get_supabase_admin()
    user_id = auth["user"].id

    result = (
        supabase.table("homestay_bookings")
        .select(BOOKING_SELECT)
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
        raise ValueError("This stay can no longer be cancelled.")

    now = datetime.now(timezone.utc).isoformat()
    supabase.table("homestay_bookings").update(
        {"booking_status": "cancelled", "cancelled_at": now}
    ).eq("id", booking_id).execute()

    refreshed = (
        supabase.table("homestay_bookings")
        .select(BOOKING_SELECT)
        .eq("id", booking_id)
        .maybe_single()
        .execute()
    )
    return _map_homestay_booking((refreshed.data if refreshed else None) or row)
