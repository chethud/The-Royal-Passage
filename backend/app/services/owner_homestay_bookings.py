from datetime import date, datetime, timezone
import logging

from app.dependencies.supabase import get_supabase_admin
from app.models.schemas import HomestayBookingSummary, ListHomestayBookingsResponse, OwnerDashboardStats
from app.services.owner_homestays import _currency_symbol, _resolve_owner_id
from app.services.transactional_emails import send_homestay_booking_confirmed_email, _guest_contact

logger = logging.getLogger(__name__)

BOOKING_SELECT = """
*,
homestays ( id, slug, title, owner_id, check_in_time, check_out_time, address ),
homestay_rooms ( name ),
profiles ( full_name )
"""


def _owner_homestay_ids(supabase, owner_id: str) -> list[str]:
    result = (
        supabase.table("homestays")
        .select("id")
        .eq("owner_id", owner_id)
        .execute()
    )
    return [row["id"] for row in (result.data or [])]


def _format_time(value: str | None) -> str:
    if not value:
        return "11:00"
    return str(value)[:5]


def _map_homestay_booking(row: dict) -> HomestayBookingSummary:
    stay = row.get("homestays") or {}
    room = row.get("homestay_rooms") or {}
    guest = row.get("profiles") or {}
    currency = row.get("currency_code") or "INR"
    return HomestayBookingSummary(
        id=row["id"],
        homestayId=stay.get("id") or row.get("homestay_id") or "",
        homestayTitle=stay.get("title") or "Homestay",
        homestaySlug=stay.get("slug") or "",
        roomName=room.get("name"),
        checkIn=str(row.get("check_in", ""))[:10],
        checkOut=str(row.get("check_out", ""))[:10],
        nights=int(row.get("nights") or 0),
        guestCount=int(row.get("guest_count") or 1),
        totalAmount=int(row.get("total_amount") or 0),
        currencyCode=currency,
        currencySymbol=_currency_symbol(currency),
        bookingStatus=row.get("booking_status") or "pending",
        paymentStatus=row.get("payment_status") or "pending",
        paymentMethod=row.get("payment_method") or "cod",
        guestName=guest.get("full_name"),
        notes=row.get("notes"),
        createdAt=row.get("created_at", ""),
        checkInTime=_format_time(stay.get("check_in_time")),
        checkOutTime=_format_time(stay.get("check_out_time")),
        homestayAddress=stay.get("address"),
        roomCount=int(row.get("room_count") or 1),
        extraBedCount=int(row.get("extra_bed_count") or 0),
    )


def _fetch_owner_booking_row(supabase, booking_id: str, owner_id: str) -> dict:
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

    stay = row.get("homestays") or {}
    if stay.get("owner_id") != owner_id:
        raise ValueError("You do not have access to this booking.")

    return row


def _try_auto_complete(supabase, *, homestay_ids: list[str]) -> None:
    if not homestay_ids:
        return
    try:
        from app.services.homestay_auto_complete import auto_complete_due_homestay_bookings

        auto_complete_due_homestay_bookings(supabase, homestay_ids=homestay_ids)
    except Exception:
        # Non-critical housekeeping; don't block owner dashboard reads.
        pass


def get_owner_dashboard(auth: dict) -> OwnerDashboardStats:
    supabase = get_supabase_admin()
    owner_id = _resolve_owner_id(auth)
    homestay_ids = _owner_homestay_ids(supabase, owner_id)

    if homestay_ids:
        _try_auto_complete(supabase, homestay_ids=homestay_ids)

    if not homestay_ids:
        return OwnerDashboardStats(
            pendingBookings=0,
            confirmedBookings=0,
            completedBookings=0,
            revenueCollectedMinor=0,
            revenuePendingMinor=0,
            upcomingBookings=0,
            checkInToday=0,
            publishedHomestays=0,
            totalBookings=0,
        )

    bookings_result = (
        supabase.table("homestay_bookings")
        .select("booking_status, payment_status, total_amount, check_in")
        .in_("homestay_id", homestay_ids)
        .execute()
    )
    bookings = bookings_result.data or []
    today = date.today().isoformat()

    pending = sum(1 for b in bookings if b.get("booking_status") == "pending")
    confirmed = sum(1 for b in bookings if b.get("booking_status") == "confirmed")
    completed = sum(1 for b in bookings if b.get("booking_status") == "completed")
    upcoming = pending + confirmed
    check_in_today = sum(
        1
        for b in bookings
        if b.get("booking_status") in ("pending", "confirmed")
        and str(b.get("check_in", ""))[:10] == today
    )

    collected = sum(
        int(b.get("total_amount") or 0)
        for b in bookings
        if b.get("payment_status") == "paid"
    )
    pending_revenue = sum(
        int(b.get("total_amount") or 0)
        for b in bookings
        if b.get("booking_status") == "confirmed" and b.get("payment_status") != "paid"
    )

    published_result = (
        supabase.table("homestays")
        .select("id")
        .eq("owner_id", owner_id)
        .eq("status", "published")
        .execute()
    )
    published_count = len(published_result.data or [])

    return OwnerDashboardStats(
        pendingBookings=pending,
        confirmedBookings=confirmed,
        completedBookings=completed,
        revenueCollectedMinor=collected,
        revenuePendingMinor=pending_revenue,
        upcomingBookings=upcoming,
        checkInToday=check_in_today,
        publishedHomestays=published_count,
        totalBookings=len(bookings),
    )


def list_owner_homestay_bookings(auth: dict, status_filter: str | None = None) -> ListHomestayBookingsResponse:
    supabase = get_supabase_admin()
    owner_id = _resolve_owner_id(auth)
    homestay_ids = _owner_homestay_ids(supabase, owner_id)

    if homestay_ids:
        _try_auto_complete(supabase, homestay_ids=homestay_ids)

    if not homestay_ids:
        return ListHomestayBookingsResponse(bookings=[])

    query = (
        supabase.table("homestay_bookings")
        .select(BOOKING_SELECT)
        .in_("homestay_id", homestay_ids)
        .order("check_in", desc=True)
    )

    today = date.today().isoformat()
    if status_filter == "pending":
        query = query.eq("booking_status", "pending")
    elif status_filter == "confirmed":
        query = query.eq("booking_status", "confirmed")
    elif status_filter == "completed":
        query = query.eq("booking_status", "completed")
    elif status_filter == "cancelled":
        query = query.eq("booking_status", "cancelled")
    elif status_filter == "upcoming":
        query = query.in_("booking_status", ["pending", "confirmed"]).gte("check_out", today)
    elif status_filter == "today":
        query = query.in_("booking_status", ["pending", "confirmed"]).eq("check_in", today)

    result = query.execute()
    return ListHomestayBookingsResponse(
        bookings=[_map_homestay_booking(row) for row in (result.data or [])]
    )


def get_owner_homestay_booking(auth: dict, booking_id: str) -> HomestayBookingSummary:
    supabase = get_supabase_admin()
    owner_id = _resolve_owner_id(auth)
    row = _fetch_owner_booking_row(supabase, booking_id, owner_id)
    return _map_homestay_booking(row)


def _update_owner_booking(booking_id: str, auth: dict, updates: dict) -> HomestayBookingSummary:
    supabase = get_supabase_admin()
    owner_id = _resolve_owner_id(auth)
    _fetch_owner_booking_row(supabase, booking_id, owner_id)
    supabase.table("homestay_bookings").update(updates).eq("id", booking_id).execute()
    row = _fetch_owner_booking_row(supabase, booking_id, owner_id)
    return _map_homestay_booking(row)


def confirm_owner_homestay_booking(booking_id: str, auth: dict) -> HomestayBookingSummary:
    supabase = get_supabase_admin()
    owner_id = _resolve_owner_id(auth)
    row = _fetch_owner_booking_row(supabase, booking_id, owner_id)

    if row.get("booking_status") != "pending":
        raise ValueError("Only pending bookings can be confirmed.")

    updated = _update_owner_booking(booking_id, auth, {"booking_status": "confirmed"})

    from app.services.notifications import create_notification

    if row.get("guest_id"):
        stay = row.get("homestays") or {}
        create_notification(
            row["guest_id"],
            "booking_confirmed",
            "Stay confirmed",
            f"Your stay at {stay.get('title') or 'the property'} was confirmed. Pay the total in cash at check-in.",
            {"bookingId": booking_id, "bookingType": "homestay"},
        )
        guest_email, guest_name = _guest_contact(supabase, row["guest_id"])
        if guest_email:
            try:
                check_in = row.get("check_in", "")
                check_out = row.get("check_out", "")
                nights = row.get("nights")
                if nights is None and check_in and check_out:
                    nights = (date.fromisoformat(str(check_out)[:10]) - date.fromisoformat(str(check_in)[:10])).days
                if not send_homestay_booking_confirmed_email(
                    to=guest_email,
                    guest_name=guest_name,
                    stay_title=stay.get("title") or "your stay",
                    check_in=str(check_in),
                    check_out=str(check_out),
                    nights=int(nights or 1),
                    total_minor=row.get("total_amount") or row.get("subtotal_minor") or 0,
                    currency_code=row.get("currency_code") or "INR",
                    booking_id=booking_id,
                ):
                    logger.error(
                        "Guest homestay confirmed email not sent for %s to %s",
                        booking_id,
                        guest_email,
                    )
            except Exception:
                logger.exception(
                    "Failed to send guest homestay confirmed email for %s",
                    booking_id,
                )
    return updated


def reject_owner_homestay_booking(booking_id: str, auth: dict) -> HomestayBookingSummary:
    supabase = get_supabase_admin()
    owner_id = _resolve_owner_id(auth)
    row = _fetch_owner_booking_row(supabase, booking_id, owner_id)

    if row.get("booking_status") != "pending":
        raise ValueError("Only pending bookings can be rejected.")

    now = datetime.now(timezone.utc).isoformat()
    updated = _update_owner_booking(
        booking_id,
        auth,
        {"booking_status": "cancelled", "cancelled_at": now},
    )

    from app.services.notifications import create_notification

    if row.get("guest_id"):
        stay = row.get("homestays") or {}
        create_notification(
            row["guest_id"],
            "booking_cancelled",
            "Stay request declined",
            f"Your request for {stay.get('title') or 'the property'} was not accepted.",
            {"bookingId": booking_id, "bookingType": "homestay"},
        )
    return updated


def mark_owner_homestay_booking_paid(booking_id: str, auth: dict) -> HomestayBookingSummary:
    supabase = get_supabase_admin()
    owner_id = _resolve_owner_id(auth)
    row = _fetch_owner_booking_row(supabase, booking_id, owner_id)

    if row.get("booking_status") != "confirmed":
        raise ValueError("Only confirmed bookings can be marked paid.")
    if row.get("payment_status") == "paid":
        raise ValueError("Booking is already marked paid.")

    return _update_owner_booking(booking_id, auth, {"payment_status": "paid"})


def complete_owner_homestay_booking(booking_id: str, auth: dict) -> HomestayBookingSummary:
    supabase = get_supabase_admin()
    owner_id = _resolve_owner_id(auth)
    row = _fetch_owner_booking_row(supabase, booking_id, owner_id)

    if row.get("booking_status") != "confirmed":
        raise ValueError("Only confirmed bookings can be completed.")
    if row.get("payment_status") != "paid" and row.get("payment_method") == "cod":
        raise ValueError("Mark payment received before completing the stay.")

    now = datetime.now(timezone.utc).isoformat()
    updated = _update_owner_booking(
        booking_id,
        auth,
        {"booking_status": "completed", "completed_at": now, "payment_status": "paid"},
    )

    from app.services.notifications import create_notification

    if row.get("guest_id"):
        create_notification(
            row["guest_id"],
            "review_request",
            "How was your stay?",
            "Share a review of your homestay experience.",
            {"bookingId": booking_id, "bookingType": "homestay"},
        )
    return updated
