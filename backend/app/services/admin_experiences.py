from app.dependencies.supabase import get_supabase_admin
from app.models.schemas import AdminExperienceSummary


def list_pending_experiences() -> list[AdminExperienceSummary]:
    supabase = get_supabase_admin()
    result = (
        supabase.table("experiences")
        .select("id, slug, title, city, status, created_at, hosts ( display_name )")
        .eq("status", "pending_review")
        .order("created_at", desc=True)
        .execute()
    )

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
        for row in (result.data or [])
    ]


def publish_experience(experience_id: str) -> AdminExperienceSummary:
    supabase = get_supabase_admin()
    result = (
        supabase.table("experiences")
        .select("id, slug, title, city, status, created_at, hosts ( display_name )")
        .eq("id", experience_id)
        .maybe_single()
        .execute()
    )
    row = result.data
    if not row:
        raise ValueError("Experience not found.")
    if row.get("status") != "pending_review":
        raise ValueError("Only experiences pending review can be published.")

    supabase.table("experiences").update({"status": "published"}).eq("id", experience_id).execute()
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
    row = result.data
    if not row:
        raise ValueError("Experience not found.")
    if row.get("status") != "pending_review":
        raise ValueError("Only experiences pending review can be rejected.")

    supabase.table("experiences").update({"status": "rejected"}).eq("id", experience_id).execute()
    return AdminExperienceSummary(
        id=row["id"],
        slug=row["slug"],
        title=row["title"],
        city=row.get("city") or "",
        status="rejected",
        hostName=(row.get("hosts") or {}).get("display_name") or "Host",
        createdAt=row.get("created_at", ""),
    )
