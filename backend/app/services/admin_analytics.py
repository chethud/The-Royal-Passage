from app.dependencies.supabase import get_supabase_admin
from app.models.schemas import AdminBookingRow, AdminStats
from app.services.audit import list_recent_audit_logs
from app.services.booking_auto_complete import (
    auto_complete_booking_if_due,
    auto_complete_due_confirmed_bookings,
)
from app.services.bookings import BOOKING_SELECT, _map_booking_row


def _booking_total(row: dict) -> int:
    return int(row.get("total_amount") or row.get("subtotal_minor") or 0)


def _get_commission_percent(supabase) -> float:
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


def _count_rows(supabase, table: str, **filters) -> int:
    query = supabase.table(table).select("id")
    for key, value in filters.items():
        query = query.eq(key, value)
    result = query.execute()
    return len(result.data or [])


def get_admin_stats() -> AdminStats:
    supabase = get_supabase_admin()
    commission_percent = _get_commission_percent(supabase)

    total_guests = _count_rows(supabase, "profiles", role="guest")
    total_hosts = _count_rows(supabase, "profiles", role="host")
    published_experiences = _count_rows(supabase, "experiences", status="published")
    pending_reviews = _count_rows(supabase, "experiences", status="pending_review")

    try:
        bookings_result = (
            supabase.table("bookings")
            .select(
                "booking_status, payment_status, total_amount, subtotal_minor, "
                "platform_fee_minor, host_payout_minor"
            )
            .execute()
        )
        rows = bookings_result.data or []
    except Exception:
        rows = []

    pending_bookings = 0
    confirmed_bookings = 0
    completed_bookings = 0
    cancelled_bookings = 0
    revenue_collected_minor = 0
    gross_booking_value_minor = 0
    platform_revenue_minor = 0
    host_payout_due_minor = 0
    cod_pending_collection_minor = 0

    for row in rows:
        status = row.get("booking_status") or "pending"
        payment_status = row.get("payment_status") or "pending"
        total = _booking_total(row)
        platform_fee = int(row.get("platform_fee_minor") or 0)
        host_payout = int(row.get("host_payout_minor") or 0)

        if status == "pending":
            pending_bookings += 1
        elif status == "confirmed":
            confirmed_bookings += 1
        elif status == "completed":
            completed_bookings += 1
        elif status == "cancelled":
            cancelled_bookings += 1

        if status == "cancelled":
            continue

        gross_booking_value_minor += total

        if status in ("confirmed", "completed"):
            platform_revenue_minor += platform_fee
            if payment_status == "paid":
                revenue_collected_minor += total
                host_payout_due_minor += host_payout
            else:
                cod_pending_collection_minor += total

    return AdminStats(
        totalGuests=total_guests,
        totalHosts=total_hosts,
        publishedExperiences=published_experiences,
        totalBookings=len(rows),
        revenueCollectedMinor=revenue_collected_minor,
        pendingExperienceReviews=pending_reviews,
        currencySymbol="₹",
        confirmedBookings=confirmed_bookings,
        pendingBookings=pending_bookings,
        completedBookings=completed_bookings,
        cancelledBookings=cancelled_bookings,
        grossBookingValueMinor=gross_booking_value_minor,
        platformRevenueMinor=platform_revenue_minor,
        hostPayoutDueMinor=host_payout_due_minor,
        codPendingCollectionMinor=cod_pending_collection_minor,
        commissionPercent=commission_percent,
    )


def list_admin_bookings(limit: int = 500) -> list[AdminBookingRow]:
    supabase = get_supabase_admin()
    try:
        auto_complete_due_confirmed_bookings(supabase)
    except Exception:
        pass
    try:
        result = (
            supabase.table("bookings")
            .select(BOOKING_SELECT)
            .order("created_at", desc=True)
            .limit(limit)
            .execute()
        )
    except Exception:
        return []

    rows = []
    for row in result.data or []:
        summary = _map_booking_row(row)
        exp = row.get("experiences") or {}
        host = exp.get("hosts") or {}
        currency = row.get("currency_code") or "INR"
        rows.append(
            AdminBookingRow(
                id=summary.id,
                guestName=summary.guestName,
                guestEmail=summary.guestEmail,
                experienceTitle=summary.experience.title,
                bookingStatus=summary.bookingStatus,
                paymentStatus=summary.paymentStatus,
                totalAmount=summary.totalAmount,
                currencySymbol=summary.currencySymbol,
                createdAt=summary.createdAt,
                slotDate=summary.slot.date,
                platformFeeMinor=int(row.get("platform_fee_minor") or 0),
                hostPayoutMinor=int(row.get("host_payout_minor") or 0),
                hostName=host.get("display_name") or summary.experience.hostName,
                isPaused=summary.isPaused,
            )
        )
    return rows


def get_admin_booking_by_id(booking_id: str):
    supabase = get_supabase_admin()
    result = (
        supabase.table("bookings")
        .select(BOOKING_SELECT)
        .eq("id", booking_id)
        .maybe_single()
        .execute()
    )
    row = result.data if result else None
    if not row:
        raise ValueError("Booking not found.")
    auto_complete_booking_if_due(supabase, row)
    return _map_booking_row(row)


def list_admin_activity(limit: int = 20):
    return list_recent_audit_logs(limit)
