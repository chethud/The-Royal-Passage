from datetime import date, datetime, timedelta, timezone
from zoneinfo import ZoneInfo
import logging

from app.dependencies.supabase import get_supabase_admin
from app.models.schemas import (
    BookingSummary,
    HostDashboardStats,
    HostRevenueDay,
    HostRevenueSummary,
    HostReviewSummary,
)
from app.services.booking_auto_complete import (
    auto_complete_booking_if_due,
    auto_complete_due_confirmed_bookings,
)
from app.services.bookings import BOOKING_SELECT, _map_booking_row, _release_seats
from app.services.supabase_query import run_supabase_query
from app.services.transactional_emails import send_experience_booking_confirmed_email

logger = logging.getLogger(__name__)
HOST_DAY_TZ = ZoneInfo("Asia/Kolkata")


def _host_today() -> date:
    return datetime.now(HOST_DAY_TZ).date()


def _resolve_host_id(auth: dict) -> str:
    profile = auth["profile"]
    host_id = profile.get("host_id")
    if host_id:
        return host_id

    supabase = get_supabase_admin()
    result = (
        supabase.table("hosts")
        .select("id")
        .eq("auth_user_id", auth["user"].id)
        .maybe_single()
        .execute()
    )
    row = result.data
    if not row:
        raise ValueError("Host profile not linked to a provider account.")
    return row["id"]


def _booking_amount(row: dict) -> int:
    return row.get("total_amount") or row.get("subtotal_minor") or 0


def _slot_date(row: dict) -> date | None:
    slot = row.get("experience_slots") or {}
    raw = slot.get("slot_date")
    if not raw:
        return None
    if isinstance(raw, date):
        return raw
    return date.fromisoformat(str(raw)[:10])


def _host_experience_ids(supabase, host_id: str) -> list[str]:
    result = (
        supabase.table("experiences")
        .select("id")
        .eq("host_id", host_id)
        .execute()
    )
    return [row["id"] for row in (result.data or [])]


def _fetch_host_booking_row(supabase, booking_id: str, host_id: str) -> dict:
    result = (
        supabase.table("bookings")
        .select(BOOKING_SELECT)
        .eq("id", booking_id)
        .maybe_single()
        .execute()
    )
    row = result.data
    if not row:
        raise ValueError("Booking not found.")

    experience = row.get("experiences") or {}
    if experience.get("host_id") != host_id:
        raise ValueError("You do not have access to this booking.")

    return row


def _empty_host_dashboard() -> HostDashboardStats:
    return HostDashboardStats(
        pendingBookings=0,
        confirmedBookings=0,
        completedBookings=0,
        revenueCollectedMinor=0,
        revenuePendingMinor=0,
        weekRevenueEstimateMinor=0,
        upcomingBookings=0,
        todayBookings=0,
        publishedExperiences=0,
        totalBookings=0,
    )


def _load_dashboard_bookings(supabase, experience_ids: list[str]) -> list[dict]:
    def with_slots() -> list[dict]:
        result = (
            supabase.table("bookings")
            .select(
                "booking_status, payment_status, total_amount, subtotal_minor, "
                "experience_slots ( slot_date )"
            )
            .in_("experience_id", experience_ids)
            .execute()
        )
        return result.data or []

    def without_slots() -> list[dict]:
        result = (
            supabase.table("bookings")
            .select("booking_status, payment_status, total_amount, subtotal_minor")
            .in_("experience_id", experience_ids)
            .execute()
        )
        return result.data or []

    try:
        return with_slots()
    except Exception:
        return run_supabase_query(without_slots, fallback=[])


def get_host_dashboard(auth: dict) -> HostDashboardStats:
    supabase = get_supabase_admin()
    host_id = _resolve_host_id(auth)
    experience_ids = _host_experience_ids(supabase, host_id)

    if experience_ids:
        try:
            auto_complete_due_confirmed_bookings(supabase, experience_ids=experience_ids)
        except Exception:
            pass

    if not experience_ids:
        return _empty_host_dashboard()

    bookings = _load_dashboard_bookings(supabase, experience_ids)

    today = _host_today()
    week_end = today + timedelta(days=6)

    pending = sum(1 for b in bookings if b.get("booking_status") == "pending")
    confirmed = sum(1 for b in bookings if b.get("booking_status") == "confirmed")
    completed = sum(1 for b in bookings if b.get("booking_status") == "completed")
    total_bookings = len(bookings)
    upcoming = pending + confirmed
    revenue = sum(_booking_amount(b) for b in bookings if b.get("payment_status") == "paid")
    revenue_pending = sum(
        _booking_amount(b)
        for b in bookings
        if b.get("booking_status") == "confirmed" and b.get("payment_status") != "paid"
    )
    today_bookings = sum(
        1
        for b in bookings
        if b.get("booking_status") in ("pending", "confirmed") and _slot_date(b) == today
    )
    week_estimate = sum(
        _booking_amount(b)
        for b in bookings
        if b.get("booking_status") in ("pending", "confirmed")
        and (slot_day := _slot_date(b)) is not None
        and today <= slot_day <= week_end
    )

    published_result = (
        supabase.table("experiences")
        .select("id")
        .eq("host_id", host_id)
        .eq("status", "published")
        .execute()
    )
    published = len(published_result.data or [])

    return HostDashboardStats(
        pendingBookings=pending,
        confirmedBookings=confirmed,
        completedBookings=completed,
        revenueCollectedMinor=revenue,
        revenuePendingMinor=revenue_pending,
        weekRevenueEstimateMinor=week_estimate,
        upcomingBookings=upcoming,
        todayBookings=today_bookings,
        publishedExperiences=published,
        totalBookings=total_bookings,
    )


def list_host_bookings(auth: dict, status_filter: str | None = None) -> list[BookingSummary]:
    supabase = get_supabase_admin()
    host_id = _resolve_host_id(auth)
    experience_ids = _host_experience_ids(supabase, host_id)

    if not experience_ids:
        return []

    try:
        auto_complete_due_confirmed_bookings(supabase, experience_ids=experience_ids)
    except Exception:
        pass

    query = (
        supabase.table("bookings")
        .select(BOOKING_SELECT)
        .in_("experience_id", experience_ids)
        .order("created_at", desc=True)
    )

    if status_filter == "pending":
        query = query.eq("booking_status", "pending")
    elif status_filter == "confirmed":
        query = query.eq("booking_status", "confirmed")
    elif status_filter == "completed":
        query = query.eq("booking_status", "completed")
    elif status_filter == "cancelled":
        query = query.eq("booking_status", "cancelled")
    elif status_filter == "upcoming":
        query = query.in_("booking_status", ["pending", "confirmed"])
    elif status_filter == "today":
        query = query.in_("booking_status", ["pending", "confirmed"])

    try:
        result = query.execute()
        rows = result.data or []
    except Exception:
        return []

    if status_filter == "today":
        today = date.today()
        rows = [row for row in rows if _slot_date(row) == today]

    return [_map_booking_row(row) for row in rows]


def get_host_booking_by_id(booking_id: str, auth: dict) -> BookingSummary:
    supabase = get_supabase_admin()
    host_id = _resolve_host_id(auth)
    row = _fetch_host_booking_row(supabase, booking_id, host_id)
    auto_complete_booking_if_due(supabase, row)
    return _map_booking_row(row)


def get_host_revenue(auth: dict) -> HostRevenueSummary:
    supabase = get_supabase_admin()
    host_id = _resolve_host_id(auth)
    experience_ids = _host_experience_ids(supabase, host_id)

    if not experience_ids:
        return HostRevenueSummary(
            collectedMinor=0,
            pendingMinor=0,
            estimatedMinor=0,
            week=[],
        )

    result = (
        supabase.table("bookings")
        .select(
            "booking_status, payment_status, total_amount, subtotal_minor, experience_slots ( slot_date )"
        )
        .in_("experience_id", experience_ids)
        .neq("booking_status", "cancelled")
        .execute()
    )
    bookings = result.data or []

    today = _host_today()
    week_start = today - timedelta(days=6)
    day_keys = [(week_start + timedelta(days=offset)).isoformat() for offset in range(7)]
    buckets = {
        key: {"collectedMinor": 0, "pendingMinor": 0, "estimatedMinor": 0} for key in day_keys
    }

    for row in bookings:
        slot_day = _slot_date(row)
        if slot_day is None or slot_day < week_start or slot_day > today:
            continue

        key = slot_day.isoformat()
        amount = _booking_amount(row)
        booking_status = row.get("booking_status")
        payment_status = row.get("payment_status")
        is_paid = payment_status == "paid"

        if is_paid:
            buckets[key]["collectedMinor"] += amount
        elif booking_status in ("confirmed", "completed"):
            # Confirmed COD still due; completed without paid stays visible as outstanding.
            buckets[key]["pendingMinor"] += amount

        if booking_status in ("pending", "confirmed"):
            buckets[key]["estimatedMinor"] += amount

    week = [
        HostRevenueDay(date=key, **buckets[key])
        for key in day_keys
    ]

    return HostRevenueSummary(
        collectedMinor=sum(day.collectedMinor for day in week),
        pendingMinor=sum(day.pendingMinor for day in week),
        estimatedMinor=sum(day.estimatedMinor for day in week),
        week=week,
    )


def list_host_reviews(auth: dict, limit: int = 20) -> list[HostReviewSummary]:
    supabase = get_supabase_admin()
    host_id = _resolve_host_id(auth)
    experience_ids = _host_experience_ids(supabase, host_id)

    if not experience_ids:
        return []

    result = (
        supabase.table("reviews")
        .select(
            "id, experience_id, rating, comment, reviewer_display_name, host_reply, host_replied_at, is_verified, status, created_at, experiences ( title )"
        )
        .in_("experience_id", experience_ids)
        .order("created_at", desc=True)
        .limit(limit)
        .execute()
    )

    reviews = []
    for row in result.data or []:
        experience = row.get("experiences") or {}
        reviews.append(
            HostReviewSummary(
                id=row["id"],
                experienceId=row["experience_id"],
                experienceTitle=experience.get("title") or "Experience",
                rating=row["rating"],
                comment=row.get("comment"),
                reviewerDisplayName=row.get("reviewer_display_name"),
                hostReply=row.get("host_reply"),
                hostRepliedAt=row.get("host_replied_at"),
                isVerified=bool(row.get("is_verified")),
                createdAt=row.get("created_at", ""),
            )
        )
    return reviews


def _update_host_booking(booking_id: str, auth: dict, updates: dict) -> BookingSummary:
    supabase = get_supabase_admin()
    host_id = _resolve_host_id(auth)
    _fetch_host_booking_row(supabase, booking_id, host_id)
    supabase.table("bookings").update(updates).eq("id", booking_id).execute()
    row = _fetch_host_booking_row(supabase, booking_id, host_id)
    return _map_booking_row(row)


def confirm_host_booking(
    booking_id: str,
    auth: dict,
    *,
    decision_name: str | None = None,
    decision_phone: str | None = None,
) -> BookingSummary:
    from app.services.booking_decision import normalize_decision_contact

    name, phone, _ = normalize_decision_contact(
        decision_name=decision_name,
        decision_phone=decision_phone,
    )

    supabase = get_supabase_admin()
    host_id = _resolve_host_id(auth)
    row = _fetch_host_booking_row(supabase, booking_id, host_id)

    if row.get("booking_status") != "pending":
        raise ValueError("Only pending bookings can be confirmed.")

    now = datetime.now(timezone.utc).isoformat()
    updated = _update_host_booking(
        booking_id,
        auth,
        {
            "booking_status": "confirmed",
            "status": "confirmed",
            "confirmed_at": now,
            "decision_by_name": name,
            "decision_by_phone": phone,
            "rejection_reason": None,
        },
    )
    from app.services.notifications import create_notification

    if row.get("guest_id"):
        create_notification(
            row["guest_id"],
            "booking_confirmed",
            "Booking confirmed",
            "Your host confirmed your booking. Pay at the venue on arrival.",
            {"bookingId": booking_id},
        )
        slot = row.get("experience_slots") or {}
        exp = row.get("experiences") or {}
        guest_email = row.get("guest_email") or ""
        if guest_email:
            try:
                if not send_experience_booking_confirmed_email(
                    to=guest_email,
                    guest_name=row.get("guest_name") or "Guest",
                    experience_title=exp.get("title") or "your experience",
                    slot_date=slot.get("slot_date", ""),
                    slot_start=slot.get("start_time", ""),
                    slot_end=slot.get("end_time", ""),
                    guest_count=row.get("participant_count") or row.get("guest_count") or 1,
                    total_minor=row.get("total_amount") or row.get("subtotal_minor") or 0,
                    currency_code=row.get("currency_code") or "INR",
                    booking_id=booking_id,
                ):
                    logger.error(
                        "Guest booking confirmed email not sent for %s to %s",
                        booking_id,
                        guest_email,
                    )
            except Exception:
                logger.exception(
                    "Failed to send guest booking confirmed email for %s",
                    booking_id,
                )
    from app.services.notifications import mark_booking_request_notifications_read

    mark_booking_request_notifications_read(auth["user"].id, booking_id)
    return updated


def reject_host_booking(
    booking_id: str,
    auth: dict,
    *,
    decision_name: str | None = None,
    decision_phone: str | None = None,
    rejection_reason: str | None = None,
) -> BookingSummary:
    from app.services.booking_decision import normalize_decision_contact

    name, phone, reason = normalize_decision_contact(
        decision_name=decision_name,
        decision_phone=decision_phone,
        rejection_reason=rejection_reason,
        require_reason=True,
    )

    supabase = get_supabase_admin()
    host_id = _resolve_host_id(auth)
    row = _fetch_host_booking_row(supabase, booking_id, host_id)

    if row.get("booking_status") != "pending":
        raise ValueError("Only pending bookings can be rejected.")

    guest_count = row.get("participant_count") or row.get("guest_count") or 1
    now = datetime.now(timezone.utc).isoformat()

    updated = _update_host_booking(
        booking_id,
        auth,
        {
            "booking_status": "cancelled",
            "status": "cancelled_by_host",
            "cancelled_at": now,
            "cancelled_by": "host",
            "decision_by_name": name,
            "decision_by_phone": phone,
            "rejection_reason": reason,
        },
    )
    _release_seats(supabase, row["slot_id"], guest_count)
    from app.services.notifications import create_notification

    if row.get("guest_id"):
        create_notification(
            row["guest_id"],
            "booking_cancelled",
            "Booking rejected",
            f"The host could not accept your booking request. Reason: {reason}",
            {"bookingId": booking_id},
        )
    from app.services.notifications import mark_booking_request_notifications_read

    mark_booking_request_notifications_read(auth["user"].id, booking_id)
    return updated


def mark_host_booking_paid(booking_id: str, auth: dict) -> BookingSummary:
    supabase = get_supabase_admin()
    host_id = _resolve_host_id(auth)
    row = _fetch_host_booking_row(supabase, booking_id, host_id)

    if row.get("booking_status") != "confirmed":
        raise ValueError("Only confirmed bookings can be marked as paid.")
    if row.get("is_paused"):
        raise ValueError("Resume the booking before marking it as paid.")
    if row.get("payment_status") == "paid":
        raise ValueError("Booking is already marked as paid.")

    return _update_host_booking(booking_id, auth, {"payment_status": "paid"})


def complete_host_booking(booking_id: str, auth: dict) -> BookingSummary:
    supabase = get_supabase_admin()
    host_id = _resolve_host_id(auth)
    row = _fetch_host_booking_row(supabase, booking_id, host_id)

    if row.get("booking_status") != "confirmed":
        raise ValueError("Only confirmed bookings can be completed.")
    if row.get("is_paused"):
        raise ValueError("Resume the booking before completing it.")
    if row.get("payment_status") != "paid":
        raise ValueError("Mark the booking as paid before completing.")

    now = datetime.now(timezone.utc).isoformat()
    updated = _update_host_booking(
        booking_id,
        auth,
        {
            "booking_status": "completed",
            "status": "completed",
            "completed_at": now,
        },
    )
    from app.services.notifications import create_notification

    if row.get("guest_id"):
        create_notification(
            row["guest_id"],
            "review_request",
            "How was your experience?",
            "Leave a review to help other travellers discover great experiences.",
            {"bookingId": booking_id},
        )
    return updated


def pause_host_booking(booking_id: str, auth: dict) -> BookingSummary:
    supabase = get_supabase_admin()
    host_id = _resolve_host_id(auth)
    row = _fetch_host_booking_row(supabase, booking_id, host_id)

    if row.get("booking_status") != "confirmed":
        raise ValueError("Only confirmed bookings can be paused.")
    if row.get("is_paused"):
        raise ValueError("Booking is already paused.")

    now = datetime.now(timezone.utc).isoformat()
    updated = _update_host_booking(
        booking_id,
        auth,
        {
            "is_paused": True,
            "paused_at": now,
        },
    )
    from app.services.notifications import create_notification

    if row.get("guest_id"):
        create_notification(
            row["guest_id"],
            "booking_paused",
            "Booking paused",
            "Your host temporarily paused this booking. They will resume it when ready.",
            {"bookingId": booking_id},
        )
    return updated


def resume_host_booking(booking_id: str, auth: dict) -> BookingSummary:
    supabase = get_supabase_admin()
    host_id = _resolve_host_id(auth)
    row = _fetch_host_booking_row(supabase, booking_id, host_id)

    if row.get("booking_status") != "confirmed":
        raise ValueError("Only confirmed bookings can be resumed.")
    if not row.get("is_paused"):
        raise ValueError("Booking is not paused.")

    updated = _update_host_booking(
        booking_id,
        auth,
        {
            "is_paused": False,
            "paused_at": None,
        },
    )
    from app.services.notifications import create_notification

    if row.get("guest_id"):
        create_notification(
            row["guest_id"],
            "booking_resumed",
            "Booking resumed",
            "Your host resumed your booking. See you at the experience.",
            {"bookingId": booking_id},
        )
    return updated
