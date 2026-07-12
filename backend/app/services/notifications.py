from __future__ import annotations

from datetime import datetime, timezone

from app.dependencies.supabase import get_supabase_admin
from app.models.schemas import NotificationSummary
from app.services.ttl_cache import TtlCache

DEFAULT_NOTIFICATION_LIMIT = 20
MAX_NOTIFICATION_LIMIT = 50

_notification_list_cache: TtlCache[list[NotificationSummary]] = TtlCache(
    ttl_seconds=20.0,
    max_size=256,
)


def _list_cache_key(user_id: str, limit: int) -> str:
    return f"notif:{user_id}:{limit}"


def _invalidate_user_notification_cache(user_id: str) -> None:
    _notification_list_cache.delete_prefix(f"notif:{user_id}:")


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
    _invalidate_user_notification_cache(user_id)


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
    for admin_id in list_admin_user_ids():
        _invalidate_user_notification_cache(admin_id)


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
    for admin_id in list_admin_user_ids():
        _invalidate_user_notification_cache(admin_id)


def mark_booking_request_notifications_read(user_id: str, booking_id: str) -> None:
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
    _invalidate_user_notification_cache(user_id)


def _clamp_limit(limit: int | None) -> int:
    if limit is None:
        return DEFAULT_NOTIFICATION_LIMIT
    try:
        value = int(limit)
    except (TypeError, ValueError):
        return DEFAULT_NOTIFICATION_LIMIT
    return max(1, min(value, MAX_NOTIFICATION_LIMIT))


def _row_to_summary(row: dict) -> NotificationSummary:
    return NotificationSummary(
        id=row["id"],
        type=row["type"],
        title=row["title"],
        body=row["body"],
        metadata=row.get("metadata") or {},
        readAt=row.get("read_at"),
        createdAt=row.get("created_at", ""),
    )


def list_user_notifications(auth: dict, limit: int | None = None) -> list[NotificationSummary]:
    user_id = auth["user"].id
    capped = _clamp_limit(limit)
    cache_key = _list_cache_key(user_id, capped)
    cached = _notification_list_cache.get(cache_key)
    if cached is not None:
        return cached

    supabase = get_supabase_admin()
    result = (
        supabase.table("notifications")
        .select("id, type, title, body, metadata, read_at, created_at")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .limit(capped)
        .execute()
    )

    rows = [_row_to_summary(row) for row in (result.data or [])]
    _notification_list_cache.set(cache_key, rows)
    return rows


def mark_notification_read(auth: dict, notification_id: str) -> NotificationSummary:
    supabase = get_supabase_admin()
    user_id = auth["user"].id
    now = datetime.now(timezone.utc).isoformat()

    result = (
        supabase.table("notifications")
        .update({"read_at": now})
        .eq("id", notification_id)
        .eq("user_id", user_id)
        .select("id, type, title, body, metadata, read_at, created_at")
        .maybe_single()
        .execute()
    )
    row = result.data if result else None
    if not row:
        raise ValueError("Notification not found.")

    _invalidate_user_notification_cache(user_id)
    return _row_to_summary(row)


def mark_all_notifications_read(auth: dict) -> int:
    supabase = get_supabase_admin()
    user_id = auth["user"].id
    now = datetime.now(timezone.utc).isoformat()
    result = (
        supabase.table("notifications")
        .update({"read_at": now})
        .eq("user_id", user_id)
        .is_("read_at", "null")
        .execute()
    )
    _invalidate_user_notification_cache(user_id)
    return len(result.data or [])
