from app.dependencies.supabase import get_supabase_admin
from app.models.schemas import CitySummary
from app.services.supabase_query import run_supabase_query


def _map_city_row(row: dict) -> CitySummary:
    return CitySummary(
        slug=row["slug"],
        name=row["name"],
        region=row.get("region"),
        state=row.get("state") or "Karnataka",
        tagline=row.get("tagline"),
        description=row.get("description"),
    )


def list_active_cities() -> list[CitySummary]:
    supabase = get_supabase_admin()

    def load_filtered() -> list[CitySummary]:
        result = (
            supabase.table("cities")
            .select("slug, name, region, state, tagline, description")
            .eq("is_active", True)
            .order("sort_order")
            .execute()
        )
        return [_map_city_row(row) for row in (result.data or [])]

    def load_all() -> list[CitySummary]:
        result = (
            supabase.table("cities")
            .select("slug, name, region, state, tagline, description")
            .order("slug")
            .execute()
        )
        return [_map_city_row(row) for row in (result.data or [])]

    try:
        return load_filtered()
    except Exception:
        return run_supabase_query(load_all, fallback=[])


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
