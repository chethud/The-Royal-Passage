from app.dependencies.supabase import get_supabase_admin
from app.models.schemas import AdminBookingRow, AdminStats
from app.services.audit import list_recent_audit_logs
from app.services.bookings import BOOKING_SELECT, _map_booking_row


def get_admin_stats() -> AdminStats:
    supabase = get_supabase_admin()

    guests = (
        supabase.table("profiles")
        .select("id", count="exact")
        .eq("role", "guest")
        .execute()
    )
    hosts = (
        supabase.table("profiles")
        .select("id", count="exact")
        .eq("role", "host")
        .execute()
    )
    experiences = (
        supabase.table("experiences")
        .select("id", count="exact")
        .eq("status", "published")
        .execute()
    )
    bookings = supabase.table("bookings").select("id", count="exact").execute()
    paid = (
        supabase.table("bookings")
        .select("total_amount, subtotal_minor")
        .eq("payment_status", "paid")
        .execute()
    )
    revenue = sum(
        row.get("total_amount") or row.get("subtotal_minor") or 0
        for row in (paid.data or [])
    )
    pending_reviews = (
        supabase.table("experiences")
        .select("id", count="exact")
        .eq("status", "pending_review")
        .execute()
    )

    return AdminStats(
        totalGuests=guests.count or 0,
        totalHosts=hosts.count or 0,
        publishedExperiences=experiences.count or 0,
        totalBookings=bookings.count or 0,
        revenueCollectedMinor=revenue,
        pendingExperienceReviews=pending_reviews.count or 0,
        currencySymbol="₹",
    )


def list_admin_bookings(limit: int = 50) -> list[AdminBookingRow]:
    supabase = get_supabase_admin()
    result = (
        supabase.table("bookings")
        .select(BOOKING_SELECT)
        .order("created_at", desc=True)
        .limit(limit)
        .execute()
    )

    rows = []
    for row in result.data or []:
        summary = _map_booking_row(row)
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
            )
        )
    return rows


def list_admin_activity(limit: int = 20):
    return list_recent_audit_logs(limit)
