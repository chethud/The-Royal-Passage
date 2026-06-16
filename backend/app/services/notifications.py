from app.dependencies.supabase import get_supabase_admin
from app.models.schemas import NotificationSummary


def create_notification(
    user_id: str,
    notif_type: str,
    title: str,
    body: str,
    metadata: dict | None = None,
) -> None:
    supabase = get_supabase_admin()
    supabase.table("notifications").insert(
        {
            "user_id": user_id,
            "type": notif_type,
            "title": title,
            "body": body,
            "metadata": metadata or {},
        }
    ).execute()


def list_admin_user_ids() -> list[str]:
    supabase = get_supabase_admin()
    result = supabase.table("profiles").select("id").eq("role", "admin").execute()
    return [row["id"] for row in (result.data or [])]


def notify_admins_new_experience_review(experience_id: str, title: str, host_name: str) -> None:
    for admin_id in list_admin_user_ids():
        create_notification(
            admin_id,
            "experience_submitted",
            "New experience to review",
            f'{host_name} submitted "{title}" for approval.',
            {"experienceId": experience_id},
        )


def mark_experience_review_notifications_read(experience_id: str) -> None:
    from datetime import datetime, timezone

    supabase = get_supabase_admin()
    now = datetime.now(timezone.utc).isoformat()
    (
        supabase.table("notifications")
        .update({"read_at": now})
        .eq("type", "experience_submitted")
        .is_("read_at", "null")
        .contains("metadata", {"experienceId": experience_id})
        .execute()
    )


def notify_admins_new_homestay_review(homestay_id: str, title: str, owner_name: str) -> None:
    for admin_id in list_admin_user_ids():
        create_notification(
            admin_id,
            "homestay_submitted",
            "New homestay to review",
            f'{owner_name} submitted "{title}" for approval.',
            {"homestayId": homestay_id},
        )


def mark_homestay_review_notifications_read(homestay_id: str) -> None:
    from datetime import datetime, timezone

    supabase = get_supabase_admin()
    now = datetime.now(timezone.utc).isoformat()
    (
        supabase.table("notifications")
        .update({"read_at": now})
        .eq("type", "homestay_submitted")
        .is_("read_at", "null")
        .contains("metadata", {"homestayId": homestay_id})
        .execute()
    )


def mark_booking_request_notifications_read(user_id: str, booking_id: str) -> None:
    from datetime import datetime, timezone

    supabase = get_supabase_admin()
    now = datetime.now(timezone.utc).isoformat()
    (
        supabase.table("notifications")
        .update({"read_at": now})
        .eq("user_id", user_id)
        .eq("type", "booking_created")
        .is_("read_at", "null")
        .contains("metadata", {"bookingId": booking_id})
        .execute()
    )


def list_user_notifications(auth: dict, limit: int = 30) -> list[NotificationSummary]:
    supabase = get_supabase_admin()
    user_id = auth["user"].id

    result = (
        supabase.table("notifications")
        .select("id, type, title, body, metadata, read_at, created_at")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .limit(limit)
        .execute()
    )

    return [
        NotificationSummary(
            id=row["id"],
            type=row["type"],
            title=row["title"],
            body=row["body"],
            metadata=row.get("metadata") or {},
            readAt=row.get("read_at"),
            createdAt=row.get("created_at", ""),
        )
        for row in (result.data or [])
    ]


def mark_notification_read(auth: dict, notification_id: str) -> NotificationSummary:
    supabase = get_supabase_admin()
    user_id = auth["user"].id

    existing = (
        supabase.table("notifications")
        .select("id")
        .eq("id", notification_id)
        .eq("user_id", user_id)
        .maybe_single()
        .execute()
    )
    if not existing.data:
        raise ValueError("Notification not found.")

    from datetime import datetime, timezone

    now = datetime.now(timezone.utc).isoformat()
    supabase.table("notifications").update({"read_at": now}).eq("id", notification_id).execute()

    result = (
        supabase.table("notifications")
        .select("id, type, title, body, metadata, read_at, created_at")
        .eq("id", notification_id)
        .maybe_single()
        .execute()
    )
    row = result.data
    return NotificationSummary(
        id=row["id"],
        type=row["type"],
        title=row["title"],
        body=row["body"],
        metadata=row.get("metadata") or {},
        readAt=row.get("read_at"),
        createdAt=row.get("created_at", ""),
    )


def mark_all_notifications_read(auth: dict) -> int:
    supabase = get_supabase_admin()
    user_id = auth["user"].id
    from datetime import datetime, timezone

    now = datetime.now(timezone.utc).isoformat()
    result = (
        supabase.table("notifications")
        .update({"read_at": now})
        .eq("user_id", user_id)
        .is_("read_at", "null")
        .execute()
    )
    return len(result.data or [])
