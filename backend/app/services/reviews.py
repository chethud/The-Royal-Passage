from datetime import datetime, timezone

from app.dependencies.supabase import get_supabase_admin
from app.models.schemas import CreateReviewRequest, HostReplyRequest, ReviewSummary
from app.services.audit import log_audit
from app.services.notifications import create_notification


def _map_review(row: dict) -> ReviewSummary:
    return ReviewSummary(
        id=row["id"],
        experienceId=row["experience_id"],
        bookingId=row.get("booking_id"),
        rating=row["rating"],
        comment=row.get("comment"),
        reviewerDisplayName=row.get("reviewer_display_name"),
        hostReply=row.get("host_reply"),
        hostRepliedAt=row.get("host_replied_at"),
        isVerified=bool(row.get("is_verified")),
        status=row.get("status") or "published",
        createdAt=row.get("created_at", ""),
    )


def list_experience_reviews(slug: str, limit: int = 20) -> list[ReviewSummary]:
    supabase = get_supabase_admin()

    exp_result = (
        supabase.table("experiences")
        .select("id")
        .eq("slug", slug)
        .eq("status", "published")
        .maybe_single()
        .execute()
    )
    exp = exp_result.data
    if not exp:
        return []

    result = (
        supabase.table("reviews")
        .select("*")
        .eq("experience_id", exp["id"])
        .eq("status", "published")
        .order("created_at", desc=True)
        .limit(limit)
        .execute()
    )
    return [_map_review(row) for row in (result.data or [])]


def create_review(auth: dict, payload: CreateReviewRequest) -> ReviewSummary:
    supabase = get_supabase_admin()
    user = auth["user"]
    profile = auth["profile"]
    guest_name = profile.get("full_name") or user.email or "Guest"

    booking_result = (
        supabase.table("bookings")
        .select("id, guest_id, experience_id, booking_status")
        .eq("id", payload.bookingId)
        .maybe_single()
        .execute()
    )
    booking = booking_result.data
    if not booking:
        raise ValueError("Booking not found.")
    if booking.get("guest_id") != user.id:
        raise ValueError("You can only review your own bookings.")
    if booking.get("booking_status") != "completed":
        raise ValueError("Only completed bookings can be reviewed.")

    existing = (
        supabase.table("reviews")
        .select("id")
        .eq("booking_id", payload.bookingId)
        .maybe_single()
        .execute()
    )
    if existing.data:
        raise ValueError("You have already reviewed this booking.")

    insert_result = (
        supabase.table("reviews")
        .insert(
            {
                "experience_id": booking["experience_id"],
                "booking_id": payload.bookingId,
                "guest_id": user.id,
                "rating": payload.rating,
                "comment": payload.comment,
                "reviewer_display_name": guest_name,
                "is_verified": True,
                "status": "published",
            }
        )
        .select("*")
        .single()
        .execute()
    )
    row = insert_result.data
    if not row:
        raise ValueError("Failed to create review.")

    exp_result = (
        supabase.table("experiences")
        .select("title, host_id, hosts ( auth_user_id )")
        .eq("id", booking["experience_id"])
        .maybe_single()
        .execute()
    )
    exp = exp_result.data or {}
    host = exp.get("hosts") or {}
    host_user_id = host.get("auth_user_id")
    if host_user_id:
        create_notification(
            host_user_id,
            "review_received",
            "New review received",
            f"A guest left a {payload.rating}-star review on {exp.get('title', 'your experience')}.",
            {"experienceId": booking["experience_id"], "reviewId": row["id"]},
        )

    log_audit(
        user.id,
        "review_created",
        "review",
        row["id"],
        {"bookingId": payload.bookingId, "rating": payload.rating},
    )

    return _map_review(row)


def host_reply_to_review(auth: dict, review_id: str, payload: HostReplyRequest) -> ReviewSummary:
    from app.services.host_bookings import _resolve_host_id

    supabase = get_supabase_admin()
    host_id = _resolve_host_id(auth)

    review_result = (
        supabase.table("reviews")
        .select("*, experiences ( host_id, title )")
        .eq("id", review_id)
        .maybe_single()
        .execute()
    )
    row = review_result.data
    if not row:
        raise ValueError("Review not found.")

    experience = row.get("experiences") or {}
    if experience.get("host_id") != host_id:
        raise ValueError("You do not have access to this review.")

    now = datetime.now(timezone.utc).isoformat()
    supabase.table("reviews").update(
        {"host_reply": payload.reply.strip(), "host_replied_at": now}
    ).eq("id", review_id).execute()

    updated = (
        supabase.table("reviews")
        .select("*")
        .eq("id", review_id)
        .maybe_single()
        .execute()
    )
    return _map_review(updated.data)


def list_admin_reviews(limit: int = 50) -> list[ReviewSummary]:
    supabase = get_supabase_admin()
    result = (
        supabase.table("reviews")
        .select("*")
        .order("created_at", desc=True)
        .limit(limit)
        .execute()
    )
    return [_map_review(row) for row in (result.data or [])]


def hide_review(auth: dict, review_id: str) -> ReviewSummary:
    supabase = get_supabase_admin()
    result = (
        supabase.table("reviews")
        .select("*")
        .eq("id", review_id)
        .maybe_single()
        .execute()
    )
    row = result.data
    if not row:
        raise ValueError("Review not found.")

    supabase.table("reviews").update({"status": "hidden"}).eq("id", review_id).execute()
    log_audit(auth["user"].id, "review_hidden", "review", review_id, {})

    updated = (
        supabase.table("reviews")
        .select("*")
        .eq("id", review_id)
        .maybe_single()
        .execute()
    )
    return _map_review(updated.data)
