from app.dependencies.supabase import get_supabase_admin
from app.models.schemas import CitySummary


def list_active_cities() -> list[CitySummary]:
    supabase = get_supabase_admin()
    result = (
        supabase.table("cities")
        .select("slug, name, region, state, tagline, description")
        .eq("is_active", True)
        .order("sort_order")
        .execute()
    )
    return [
        CitySummary(
            slug=row["slug"],
            name=row["name"],
            region=row.get("region"),
            state=row.get("state") or "Karnataka",
            tagline=row.get("tagline"),
            description=row.get("description"),
        )
        for row in (result.data or [])
    ]


def get_city_by_slug(slug: str) -> CitySummary | None:
    supabase = get_supabase_admin()
    result = (
        supabase.table("cities")
        .select("slug, name, region, state, tagline, description")
        .eq("slug", slug)
        .eq("is_active", True)
        .maybe_single()
        .execute()
    )
    row = result.data
    if not row:
        return None
    return CitySummary(
        slug=row["slug"],
        name=row["name"],
        region=row.get("region"),
        state=row.get("state") or "Karnataka",
        tagline=row.get("tagline"),
        description=row.get("description"),
    )
