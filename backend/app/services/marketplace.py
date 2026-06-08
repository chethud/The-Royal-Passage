from app.dependencies.supabase import get_supabase_admin
from app.mappers.experience import map_row_to_experience
from app.models.schemas import CatalogResponse, Experience, ExperienceDetailResponse

EXPERIENCE_SELECT = """
*,
hosts ( display_name, bio, verified, approval_status ),
experience_categories ( label )
"""


def load_published_experiences() -> list[Experience]:
    supabase = get_supabase_admin()
    result = (
        supabase.table("experiences")
        .select(EXPERIENCE_SELECT)
        .eq("status", "published")
        .execute()
    )
    rows = result.data or []
    approved = [r for r in rows if (r.get("hosts") or {}).get("approval_status") == "approved"]
    if not approved:
        return []

    ids = [r["id"] for r in approved]
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

    return [map_row_to_experience(row, by_exp.get(row["id"], [])) for row in approved]


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
    if (row.get("hosts") or {}).get("approval_status") != "approved":
        return None

    slots_result = (
        supabase.table("experience_slots")
        .select("*")
        .eq("experience_id", row["id"])
        .order("slot_date")
        .execute()
    )
    return map_row_to_experience(row, slots_result.data or [])


def get_catalog() -> CatalogResponse:
    experiences = load_published_experiences()
    return CatalogResponse(
        mode="live",
        experiences=experiences,
        categories=sorted({e.category for e in experiences}),
        cities=sorted({e.city for e in experiences}),
    )


def get_experience_detail(slug: str) -> ExperienceDetailResponse | None:
    exp = load_experience_by_slug(slug)
    if not exp:
        return None
    return ExperienceDetailResponse(exp=exp, source="live")
