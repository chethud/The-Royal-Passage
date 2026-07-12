import time

from app.dependencies.supabase import get_supabase_admin
from app.models.schemas import AdminBookingRow, AdminHomestayBookingRow, AdminHomestayStats, AdminStats
from app.services.audit import list_recent_audit_logs
from app.services.booking_auto_complete import (
    auto_complete_booking_if_due,
    auto_complete_due_confirmed_bookings,
)
from app.services.bookings import BOOKING_SELECT, _map_booking_row
from app.services.supabase_query import run_supabase_query
from app.services.ttl_cache import TtlCache

# Auto-complete on every admin bookings list blocked the single worker for seconds.
_AUTO_COMPLETE_MIN_INTERVAL_S = 300.0
_last_admin_auto_complete_at = 0.0
_admin_bookings_cache: TtlCache[list[AdminBookingRow]] = TtlCache(ttl_seconds=15.0, max_size=32)
_admin_stats_cache: TtlCache[AdminStats] = TtlCache(ttl_seconds=20.0, max_size=4)


def _as_int(value, default: int = 0) -> int:
    try:
        if value is None or value is False:
            return default
        return int(value)
    except (TypeError, ValueError):
        return default


def _booking_total(row: dict) -> int:
    return _as_int(row.get("total_amount") or row.get("subtotal_minor") or 0)


def _get_commission_percent(supabase) -> float:
    def _load() -> float:
        result = (
            supabase.table("platform_settings")
            .select("value")
            .eq("key", "commission_percent")
            .limit(1)
            .execute()
        )
        rows = result.data or []
        if not rows:
            return 10.0
        raw_fee = rows[0].get("value", 10)
        if isinstance(raw_fee, dict):
            raw_fee = raw_fee.get("percent", raw_fee.get("value", 10))
        try:
            return float(raw_fee)
        except (TypeError, ValueError):
            return 10.0

    return run_supabase_query(_load, fallback=10.0)


def _count_rows(supabase, table: str, **filters) -> int:
    def _load() -> int:
        query = supabase.table(table).select("id", count="exact", head=True)
        for key, value in filters.items():
            query = query.eq(key, value)
        result = query.execute()
        return int(result.count or 0)

    return run_supabase_query(_load, fallback=0)


def get_admin_stats() -> AdminStats:
    cached = _admin_stats_cache.get("stats")
    if cached is not None:
        return cached

    try:
        supabase = get_supabase_admin()
        commission_percent = _get_commission_percent(supabase)

        total_guests = _count_rows(supabase, "profiles", role="guest")
        total_hosts = _count_rows(supabase, "profiles", role="host")
        published_experiences = _count_rows(supabase, "experiences", status="published")
        pending_reviews = _count_rows(supabase, "experiences", status="pending_review")

        try:
            # Aggregate columns only — never pull nested joins for the overview.
            bookings_result = (
                supabase.table("bookings")
                .select(
                    "booking_status, payment_status, total_amount, subtotal_minor, "
                    "platform_fee_minor, host_payout_minor"
                )
                .limit(2000)
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
            if not isinstance(row, dict):
                continue
            status = row.get("booking_status") or "pending"
            payment_status = row.get("payment_status") or "pending"
            total = _booking_total(row)
            platform_fee = _as_int(row.get("platform_fee_minor"))
            host_payout = _as_int(row.get("host_payout_minor"))

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

        stats = AdminStats(
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
        _admin_stats_cache.set("stats", stats)
        return stats
    except Exception:
        # Never blank the admin overview — return zeros if analytics cannot load.
        return AdminStats(
            totalGuests=0,
            totalHosts=0,
            publishedExperiences=0,
            totalBookings=0,
            revenueCollectedMinor=0,
            pendingExperienceReviews=0,
            currencySymbol="₹",
        )


def _count_role_users(supabase, role: str) -> int:
    """Count users with a role via user_roles, falling back to profiles.role."""

    def _from_user_roles() -> int:
        result = (
            supabase.table("user_roles")
            .select("user_id")
            .eq("role", role)
            .execute()
        )
        return len({row["user_id"] for row in (result.data or []) if row.get("user_id")})

    count = run_supabase_query(_from_user_roles, fallback=0)
    if count:
        return count
    return _count_rows(supabase, "profiles", role=role)


def get_admin_homestay_stats() -> AdminHomestayStats:
    try:
        supabase = get_supabase_admin()
        commission_percent = _get_commission_percent(supabase)

        total_owners = _count_role_users(supabase, "homestay_owner")
        published_homestays = _count_rows(supabase, "homestays", status="published")
        pending_approvals = _count_rows(supabase, "homestays", status="pending_review")

        try:
            bookings_result = (
                supabase.table("homestay_bookings")
                .select(
                    "booking_status, payment_status, total_amount, "
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
        owner_payout_due_minor = 0
        cod_pending_collection_minor = 0

        for row in rows:
            if not isinstance(row, dict):
                continue
            status = row.get("booking_status") or "pending"
            payment_status = row.get("payment_status") or "pending"
            total = _as_int(row.get("total_amount"))
            platform_fee = _as_int(row.get("platform_fee_minor"))
            owner_payout = _as_int(row.get("host_payout_minor"))

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
                    owner_payout_due_minor += owner_payout
                else:
                    cod_pending_collection_minor += total

        return AdminHomestayStats(
            totalOwners=total_owners,
            publishedHomestays=published_homestays,
            pendingApprovals=pending_approvals,
            totalBookings=len(rows),
            pendingBookings=pending_bookings,
            confirmedBookings=confirmed_bookings,
            completedBookings=completed_bookings,
            cancelledBookings=cancelled_bookings,
            grossBookingValueMinor=gross_booking_value_minor,
            revenueCollectedMinor=revenue_collected_minor,
            platformRevenueMinor=platform_revenue_minor,
            ownerPayoutDueMinor=owner_payout_due_minor,
            codPendingCollectionMinor=cod_pending_collection_minor,
            currencySymbol="₹",
            commissionPercent=commission_percent,
        )
    except Exception:
        return AdminHomestayStats(currencySymbol="₹")


def list_admin_homestay_bookings(
    *,
    statuses: list[str] | None = None,
    limit: int = 100,
) -> list[AdminHomestayBookingRow]:
    """Recent homestay stays for admin module alerts (pending / cancelled, etc.)."""
    try:
        supabase = get_supabase_admin()
        query = (
            supabase.table("homestay_bookings")
            .select(
                "id, homestay_id, check_in, check_out, booking_status, created_at, "
                "homestays ( id, title ), profiles ( full_name )"
            )
            .order("created_at", desc=True)
            .limit(limit)
        )
        if statuses:
            query = query.in_("booking_status", statuses)
        result = query.execute()
    except Exception:
        return []

    rows: list[AdminHomestayBookingRow] = []
    for row in result.data or []:
        if not isinstance(row, dict):
            continue
        stay = row.get("homestays") or {}
        guest = row.get("profiles") or {}
        rows.append(
            AdminHomestayBookingRow(
                id=str(row.get("id") or ""),
                homestayId=str(stay.get("id") or row.get("homestay_id") or ""),
                homestayTitle=str(stay.get("title") or "Homestay"),
                guestName=guest.get("full_name"),
                checkIn=str(row.get("check_in") or "")[:10],
                checkOut=str(row.get("check_out") or "")[:10],
                bookingStatus=str(row.get("booking_status") or "pending"),
                createdAt=str(row.get("created_at") or ""),
            )
        )
    return rows


def _maybe_run_admin_auto_complete(supabase) -> None:
    """Throttle bulk auto-complete so list endpoints stay responsive."""
    global _last_admin_auto_complete_at
    now = time.monotonic()
    if now - _last_admin_auto_complete_at < _AUTO_COMPLETE_MIN_INTERVAL_S:
        return
    _last_admin_auto_complete_at = now
    try:
        auto_complete_due_confirmed_bookings(supabase)
    except Exception:
        pass


def list_admin_bookings(
    limit: int = 100,
    *,
    statuses: list[str] | None = None,
    run_auto_complete: bool = False,
) -> list[AdminBookingRow]:
    capped = max(1, min(int(limit or 100), 500))
    status_key = ",".join(statuses) if statuses else "all"
    cache_key = f"bookings:{status_key}:{capped}:{int(run_auto_complete)}"
    cached = _admin_bookings_cache.get(cache_key)
    if cached is not None:
        return cached

    supabase = get_supabase_admin()
    if run_auto_complete:
        _maybe_run_admin_auto_complete(supabase)

    try:
        query = (
            supabase.table("bookings")
            .select(BOOKING_SELECT)
            .order("created_at", desc=True)
            .limit(capped)
        )
        if statuses:
            query = query.in_("booking_status", statuses)
        result = query.execute()
    except Exception:
        return []

    rows = []
    for row in result.data or []:
        summary = _map_booking_row(row)
        exp = row.get("experiences") or {}
        host = exp.get("hosts") or {}
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
    _admin_bookings_cache.set(cache_key, rows)
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
