from app.dependencies.supabase import get_supabase_admin
from app.models.schemas import AdminExperienceDetail, AdminExperienceSummary
from app.services.host_experiences import _load_slots, _map_host_experience

ADMIN_EXP_SELECT = """
*,
hosts ( display_name, email, phone, bio, verified ),
experience_categories ( slug, label )
"""


def list_pending_experience_reviews() -> list[AdminExperienceSummary]:
    """Host submissions awaiting admin review only."""
    supabase = get_supabase_admin()
    result = (
        supabase.table("experiences")
        .select("id, slug, title, city, status, created_at, hosts ( display_name )")
        .eq("status", "pending_review")
        .order("created_at", desc=True)
        .execute()
    )
    rows = result.data or []
    return [
        AdminExperienceSummary(
            id=row["id"],
            slug=row["slug"],
            title=row["title"],
            city=row.get("city") or "",
            status=row.get("status") or "pending_review",
            hostName=(row.get("hosts") or {}).get("display_name") or "Host",
            createdAt=row.get("created_at", ""),
        )
        for row in rows
    ]


def list_admin_experience_approvals() -> list[AdminExperienceSummary]:
    """Pending submissions only — for the approve experiences page."""
    return list_pending_experience_reviews()


def list_pending_experiences() -> list[AdminExperienceSummary]:
    """Backward-compatible alias."""
    return list_pending_experience_reviews()


def get_admin_experience(experience_id: str) -> AdminExperienceDetail:
    supabase = get_supabase_admin()
    result = (
        supabase.table("experiences")
        .select(ADMIN_EXP_SELECT)
        .eq("id", experience_id)
        .maybe_single()
        .execute()
    )
    row = result.data if result else None
    if not row:
        raise ValueError("Experience not found.")

    slots = _load_slots(supabase, experience_id)
    mapped = _map_host_experience(row, slots)
    host = row.get("hosts") or {}

    return AdminExperienceDetail(
        **mapped.model_dump(),
        hostName=host.get("display_name") or "Host",
        hostEmail=host.get("email"),
        hostPhone=host.get("phone"),
        hostBio=host.get("bio"),
        hostVerified=bool(host.get("verified")),
    )


def publish_experience(experience_id: str) -> AdminExperienceSummary:
    supabase = get_supabase_admin()
    result = (
        supabase.table("experiences")
        .select("id, slug, title, city, status, created_at, host_id, hosts ( display_name )")
        .eq("id", experience_id)
        .maybe_single()
        .execute()
    )
    row = result.data if result else None
    if not row:
        raise ValueError("Experience not found.")
    if row.get("status") != "pending_review":
        raise ValueError("Only experiences pending review can be published.")

    slots = _load_slots(supabase, experience_id)
    open_slots = [slot for slot in slots if not slot.get("is_blocked")]
    if not open_slots:
        raise ValueError("Cannot publish without at least one bookable slot.")

    supabase.table("experiences").update({"status": "published"}).eq("id", experience_id).execute()

    from app.services.notifications import mark_experience_review_notifications_read

    mark_experience_review_notifications_read(experience_id)

    # Catalog only lists experiences from approved hosts; approving the experience
    # should also approve the host so it appears on the public marketplace.
    host_id = row.get("host_id")
    if host_id:
        supabase.table("hosts").update(
            {"approval_status": "approved", "verified": True}
        ).eq("id", host_id).execute()

    row["status"] = "published"
    return AdminExperienceSummary(
        id=row["id"],
        slug=row["slug"],
        title=row["title"],
        city=row.get("city") or "",
        status="published",
        hostName=(row.get("hosts") or {}).get("display_name") or "Host",
        createdAt=row.get("created_at", ""),
    )


def reject_experience(experience_id: str) -> AdminExperienceSummary:
    supabase = get_supabase_admin()
    result = (
        supabase.table("experiences")
        .select("id, slug, title, city, status, created_at, hosts ( display_name )")
        .eq("id", experience_id)
        .maybe_single()
        .execute()
    )
    row = result.data if result else None
    if not row:
        raise ValueError("Experience not found.")
    if row.get("status") != "pending_review":
        raise ValueError("Only experiences pending review can be rejected.")

    supabase.table("experiences").update({"status": "rejected"}).eq("id", experience_id).execute()

    from app.services.notifications import mark_experience_review_notifications_read

    mark_experience_review_notifications_read(experience_id)
    return AdminExperienceSummary(
        id=row["id"],
        slug=row["slug"],
        title=row["title"],
        city=row.get("city") or "",
        status="rejected",
        hostName=(row.get("hosts") or {}).get("display_name") or "Host",
        createdAt=row.get("created_at", ""),
    )
