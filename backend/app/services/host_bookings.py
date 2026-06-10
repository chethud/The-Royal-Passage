from datetime import date, datetime, timedelta, timezone

from app.dependencies.supabase import get_supabase_admin
from app.models.schemas import (
    BookingSummary,
    HostDashboardStats,
    HostRevenueDay,
    HostRevenueSummary,
    HostReviewSummary,
)
from app.services.bookings import BOOKING_SELECT, _map_booking_row, _release_seats


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


def get_host_dashboard(auth: dict) -> HostDashboardStats:
    supabase = get_supabase_admin()
    host_id = _resolve_host_id(auth)
    experience_ids = _host_experience_ids(supabase, host_id)

    if not experience_ids:
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

    bookings_result = (
        supabase.table("bookings")
        .select(
            "booking_status, payment_status, total_amount, subtotal_minor, experience_slots ( slot_date )"
        )
        .in_("experience_id", experience_ids)
        .execute()
    )
    bookings = bookings_result.data or []

    today = date.today()
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

    exp_result = (
        supabase.table("experiences")
        .select("id", count="exact")
        .eq("host_id", host_id)
        .eq("status", "published")
        .execute()
    )
    published = exp_result.count or 0

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

    result = query.execute()
    rows = result.data or []

    if status_filter == "today":
        today = date.today()
        rows = [row for row in rows if _slot_date(row) == today]

    return [_map_booking_row(row) for row in rows]


def get_host_booking_by_id(booking_id: str, auth: dict) -> BookingSummary:
    supabase = get_supabase_admin()
    host_id = _resolve_host_id(auth)
    row = _fetch_host_booking_row(supabase, booking_id, host_id)
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

    today = date.today()
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

        if payment_status == "paid":
            buckets[key]["collectedMinor"] += amount
        elif booking_status == "confirmed":
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


def confirm_host_booking(booking_id: str, auth: dict) -> BookingSummary:
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
    return updated


def reject_host_booking(booking_id: str, auth: dict) -> BookingSummary:
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
        },
    )
    _release_seats(supabase, row["slot_id"], guest_count)
    from app.services.notifications import create_notification

    if row.get("guest_id"):
        create_notification(
            row["guest_id"],
            "booking_cancelled",
            "Booking rejected",
            "The host could not accept your booking request.",
            {"bookingId": booking_id},
        )
    return updated


def mark_host_booking_paid(booking_id: str, auth: dict) -> BookingSummary:
    supabase = get_supabase_admin()
    host_id = _resolve_host_id(auth)
    row = _fetch_host_booking_row(supabase, booking_id, host_id)

    if row.get("booking_status") != "confirmed":
        raise ValueError("Only confirmed bookings can be marked as paid.")
    if row.get("payment_status") == "paid":
        raise ValueError("Booking is already marked as paid.")

    return _update_host_booking(booking_id, auth, {"payment_status": "paid"})


def complete_host_booking(booking_id: str, auth: dict) -> BookingSummary:
    supabase = get_supabase_admin()
    host_id = _resolve_host_id(auth)
    row = _fetch_host_booking_row(supabase, booking_id, host_id)

    if row.get("booking_status") != "confirmed":
        raise ValueError("Only confirmed bookings can be completed.")
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
