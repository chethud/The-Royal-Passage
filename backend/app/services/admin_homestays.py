from app.dependencies.supabase import get_supabase_admin
from app.models.schemas import AdminHomestayDetail, AdminHomestaySummary, ListAdminHomestaysResponse
from app.services.owner_homestays import _currency_symbol, _format_time, _load_rooms, _map_room

ADMIN_SELECT = """
*,
homestay_owners ( full_name, email, phone, verified )
"""


def list_pending_homestay_reviews() -> list[AdminHomestaySummary]:
    supabase = get_supabase_admin()
    result = (
        supabase.table("homestays")
        .select("id, slug, title, city, status, created_at, homestay_owners ( full_name )")
        .eq("status", "pending_review")
        .order("created_at", desc=True)
        .execute()
    )
    rows = result.data or []
    return [
        AdminHomestaySummary(
            id=row["id"],
            slug=row["slug"],
            title=row["title"],
            city=row.get("city") or "",
            status=row.get("status") or "pending_review",
            ownerName=(row.get("homestay_owners") or {}).get("full_name") or "Owner",
            createdAt=row.get("created_at", ""),
        )
        for row in rows
    ]


def list_admin_homestays() -> ListAdminHomestaysResponse:
    return ListAdminHomestaysResponse(homestays=list_pending_homestay_reviews())


def get_admin_homestay(homestay_id: str) -> AdminHomestayDetail:
    supabase = get_supabase_admin()
    result = (
        supabase.table("homestays")
        .select(ADMIN_SELECT)
        .eq("id", homestay_id)
        .maybe_single()
        .execute()
    )
    row = result.data if result else None
    if not row:
        raise ValueError("Homestay not found.")

    rooms = _load_rooms(supabase, homestay_id)
    owner = row.get("homestay_owners") or {}
    currency = row.get("currency_code") or "INR"

    return AdminHomestayDetail(
        id=row["id"],
        slug=row["slug"],
        title=row["title"],
        tagline=row.get("tagline"),
        description=row.get("description"),
        propertyType=row["property_type"],
        city=row.get("city") or "",
        citySlug=row.get("city_slug"),
        region=row.get("region"),
        address=row.get("address"),
        mapLink=row.get("map_link"),
        pricePerNightMinor=int(row.get("price_per_night_minor") or 0),
        weekendPricePerNightMinor=row.get("weekend_price_per_night_minor"),
        status=row.get("status") or "draft",
        heroImageUrl=row.get("hero_image_url"),
        galleryUrls=row.get("gallery_urls") or [],
        amenities=row.get("amenities") or [],
        houseRules=row.get("house_rules") or [],
        bedrooms=int(row.get("bedrooms") or 1),
        bathrooms=int(row.get("bathrooms") or 1),
        maxGuests=int(row.get("max_guests") or 2),
        checkInTime=_format_time(str(row.get("check_in_time") or "14:00")),
        checkOutTime=_format_time(str(row.get("check_out_time") or "11:00")),
        currencyCode=currency,
        currencySymbol=_currency_symbol(currency),
        rooms=[_map_room(room) for room in rooms if room.get("is_active", True)],
        createdAt=row.get("created_at", ""),
        updatedAt=row.get("updated_at", ""),
        ownerName=owner.get("full_name") or "Owner",
        ownerEmail=owner.get("email"),
        ownerPhone=owner.get("phone"),
        ownerVerified=bool(owner.get("verified")),
    )


def publish_homestay(homestay_id: str) -> AdminHomestaySummary:
    supabase = get_supabase_admin()
    result = (
        supabase.table("homestays")
        .select("id, slug, title, city, status, created_at, owner_id, homestay_owners ( full_name )")
        .eq("id", homestay_id)
        .maybe_single()
        .execute()
    )
    row = result.data if result else None
    if not row:
        raise ValueError("Homestay not found.")
    if row.get("status") != "pending_review":
        raise ValueError("Only homestays pending review can be published.")

    rooms = _load_rooms(supabase, homestay_id)
    active_rooms = [room for room in rooms if room.get("is_active", True)]
    if not active_rooms:
        raise ValueError("Cannot publish without at least one active room.")

    supabase.table("homestays").update({"status": "published"}).eq("id", homestay_id).execute()

    from app.services.notifications import mark_homestay_review_notifications_read

    mark_homestay_review_notifications_read(homestay_id)

    owner_id = row.get("owner_id")
    if owner_id:
        supabase.table("homestay_owners").update(
            {"approval_status": "approved", "verified": True}
        ).eq("id", owner_id).execute()

    return AdminHomestaySummary(
        id=row["id"],
        slug=row["slug"],
        title=row["title"],
        city=row.get("city") or "",
        status="published",
        ownerName=(row.get("homestay_owners") or {}).get("full_name") or "Owner",
        createdAt=row.get("created_at", ""),
    )


def reject_homestay(homestay_id: str) -> AdminHomestaySummary:
    supabase = get_supabase_admin()
    result = (
        supabase.table("homestays")
        .select("id, slug, title, city, status, created_at, homestay_owners ( full_name )")
        .eq("id", homestay_id)
        .maybe_single()
        .execute()
    )
    row = result.data if result else None
    if not row:
        raise ValueError("Homestay not found.")
    if row.get("status") != "pending_review":
        raise ValueError("Only homestays pending review can be rejected.")

    supabase.table("homestays").update({"status": "rejected"}).eq("id", homestay_id).execute()

    from app.services.notifications import mark_homestay_review_notifications_read

    mark_homestay_review_notifications_read(homestay_id)

    return AdminHomestaySummary(
        id=row["id"],
        slug=row["slug"],
        title=row["title"],
        city=row.get("city") or "",
        status="rejected",
        ownerName=(row.get("homestay_owners") or {}).get("full_name") or "Owner",
        createdAt=row.get("created_at", ""),
    )
