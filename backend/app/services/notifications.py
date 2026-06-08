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
