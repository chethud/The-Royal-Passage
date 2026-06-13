from app.booking_window import filter_guest_bookable_slots
from app.dependencies.supabase import get_supabase_admin
from app.mappers.experience import map_row_to_experience
from app.models.schemas import CatalogResponse, Experience, ExperienceDetailResponse

EXPERIENCE_SELECT = """
*,
hosts ( display_name, bio, verified, approval_status ),
experience_categories ( label )
"""


def _host_visible_in_catalog(host: dict | None) -> bool:
    status = (host or {}).get("approval_status")
    return status not in ("rejected", "suspended")


def load_published_experiences(city_slug: str | None = None) -> list[Experience]:
    supabase = get_supabase_admin()
    query = (
        supabase.table("experiences")
        .select(EXPERIENCE_SELECT)
        .eq("status", "published")
    )
    if city_slug:
        query = query.eq("city_slug", city_slug)
    result = query.execute()
    rows = result.data or []
    visible = [r for r in rows if _host_visible_in_catalog(r.get("hosts"))]
    if not visible:
        return []

    ids = [r["id"] for r in visible]
    slots_result = (
        supabase.table("experience_slots")
        .select("*")
        .in_("experience_id", ids)
        .order("slot_date")
        .execute()
    )
    slots = slots_result.data or []
    by_exp: dict[str, list[dict]] = {}
    for slot in slots:
        by_exp.setdefault(slot["experience_id"], []).append(slot)

    mapped = [
        map_row_to_experience(row, filter_guest_bookable_slots(by_exp.get(row["id"], [])))
        for row in visible
    ]
    return [exp for exp in mapped if any(slot.available > 0 for slot in exp.slots)]


def load_experience_by_slug(slug: str) -> Experience | None:
    supabase = get_supabase_admin()
    result = (
        supabase.table("experiences")
        .select(EXPERIENCE_SELECT)
        .eq("slug", slug)
        .eq("status", "published")
        .maybe_single()
        .execute()
    )
    row = result.data
    if not row:
        return None
    if not _host_visible_in_catalog(row.get("hosts")):
        return None

    slots_result = (
        supabase.table("experience_slots")
        .select("*")
        .eq("experience_id", row["id"])
        .order("slot_date")
        .execute()
    )
    return map_row_to_experience(row, filter_guest_bookable_slots(slots_result.data or []))


def get_catalog(city_slug: str | None = None) -> CatalogResponse:
    experiences = load_published_experiences(city_slug=city_slug)
    return CatalogResponse(
        mode="live",
        experiences=experiences,
        categories=sorted({e.category for e in experiences}),
        cities=sorted({e.city for e in experiences}),
        citySlugs=sorted({e.citySlug for e in experiences if e.citySlug}),
    )


def get_experience_detail(slug: str) -> ExperienceDetailResponse | None:
    exp = load_experience_by_slug(slug)
    if not exp:
        return None
    return ExperienceDetailResponse(exp=exp, source="live")
