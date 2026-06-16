from app.dependencies.supabase import get_supabase_admin
from app.mappers.homestay import map_row_to_homestay
from app.models.schemas import Homestay, HomestayDetailResponse, ListHomestaysResponse

HOMESTAY_SELECT = """
*,
homestay_owners ( full_name, approval_status )
"""


def _owner_visible_in_catalog(owner: dict | None) -> bool:
    status = (owner or {}).get("approval_status")
    return status not in ("rejected", "suspended")


def load_published_homestays(city_slug: str | None = None) -> list[Homestay]:
    supabase = get_supabase_admin()
    query = (
        supabase.table("homestays")
        .select(HOMESTAY_SELECT)
        .eq("status", "published")
    )
    if city_slug:
        query = query.eq("city_slug", city_slug)
    result = query.execute()
    rows = [row for row in (result.data or []) if _owner_visible_in_catalog(row.get("homestay_owners"))]
    if not rows:
        return []

    ids = [row["id"] for row in rows]
    rooms_result = (
        supabase.table("homestay_rooms")
        .select("*")
        .in_("homestay_id", ids)
        .eq("is_active", True)
        .order("sort_order")
        .execute()
    )
    rooms = rooms_result.data or []
    by_stay: dict[str, list[dict]] = {}
    for room in rooms:
        by_stay.setdefault(room["homestay_id"], []).append(room)

    return [map_row_to_homestay(row, by_stay.get(row["id"], [])) for row in rows]


def load_homestay_by_slug(slug: str) -> Homestay | None:
    supabase = get_supabase_admin()
    result = (
        supabase.table("homestays")
        .select(HOMESTAY_SELECT)
        .eq("slug", slug)
        .eq("status", "published")
        .maybe_single()
        .execute()
    )
    row = result.data
    if not row:
        return None
    if not _owner_visible_in_catalog(row.get("homestay_owners")):
        return None

    rooms_result = (
        supabase.table("homestay_rooms")
        .select("*")
        .eq("homestay_id", row["id"])
        .eq("is_active", True)
        .order("sort_order")
        .execute()
    )
    return map_row_to_homestay(row, rooms_result.data or [])


def list_homestays(city_slug: str | None = None) -> ListHomestaysResponse:
    stays = load_published_homestays(city_slug=city_slug)
    return ListHomestaysResponse(
        mode="live",
        homestays=stays,
        propertyTypes=sorted({stay.propertyType for stay in stays}),
        cities=sorted({stay.city for stay in stays}),
    )


def get_homestay_detail(slug: str) -> HomestayDetailResponse | None:
    stay = load_homestay_by_slug(slug)
    if not stay:
        return None
    return HomestayDetailResponse(homestay=stay, source="live")
