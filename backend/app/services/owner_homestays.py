import re
import uuid
from datetime import date

from app.dependencies.supabase import get_supabase_admin
from app.models.schemas import (
    CreateOwnerHomestayRequest,
    CreateOwnerHomestayRoomRequest,
    OwnerHomestayAvailability,
    OwnerHomestayDetail,
    OwnerHomestayRoom,
    OwnerHomestaySummary,
    UpdateOwnerHomestayRequest,
    UpdateOwnerHomestayRoomRequest,
    UpsertOwnerAvailabilityRequest,
)
from app.services.cities import get_city_by_slug

VALID_PROPERTY_TYPES = {
    "Villa",
    "Resort",
    "Cottage",
    "Farm House",
    "Apartment",
    "Home Stay",
    "Guest House",
    "Luxury Stay",
}

HOMESTAY_SELECT = "*"


def _resolve_owner_id(auth: dict) -> str:
    profile = auth["profile"]
    owner_id = profile.get("homestay_owner_id")
    if owner_id:
        return owner_id

    supabase = get_supabase_admin()
    result = (
        supabase.table("homestay_owners")
        .select("id")
        .eq("auth_user_id", auth["user"].id)
        .maybe_single()
        .execute()
    )
    row = result.data if result else None
    if not row:
        raise ValueError("Homestay owner profile not linked to a provider account.")
    return row["id"]


def _currency_symbol(code: str) -> str:
    if code == "INR":
        return "₹"
    if code == "EUR":
        return "€"
    if code == "USD":
        return "$"
    return "₹"


def _format_time(value: str) -> str:
    return value[:5] if value and len(value) >= 5 else value or "14:00"


def _slugify(title: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")
    return slug[:80] or f"homestay-{uuid.uuid4().hex[:8]}"


def _ensure_unique_slug(supabase, slug: str, exclude_id: str | None = None) -> str:
    candidate = slug
    suffix = 1
    while True:
        query = supabase.table("homestays").select("id").eq("slug", candidate)
        if exclude_id:
            query = query.neq("id", exclude_id)
        result = query.maybe_single().execute()
        if not (result.data if result else None):
            return candidate
        candidate = f"{slug}-{suffix}"
        suffix += 1


def _resolve_city_fields(city_slug: str, city_override: str | None = None) -> tuple[str, str]:
    city_row = get_city_by_slug(city_slug.strip().lower())
    if not city_row:
        raise ValueError("Invalid city.")
    city_name = (city_override or city_row.name).strip()
    return city_slug.strip().lower(), city_name


def _validate_property_type(value: str) -> None:
    if value not in VALID_PROPERTY_TYPES:
        raise ValueError("Invalid property type.")


def _fetch_owner_homestay_row(supabase, homestay_id: str, owner_id: str) -> dict:
    result = (
        supabase.table("homestays")
        .select(HOMESTAY_SELECT)
        .eq("id", homestay_id)
        .eq("owner_id", owner_id)
        .maybe_single()
        .execute()
    )
    row = result.data if result else None
    if not row:
        raise ValueError("Homestay not found.")
    return row


def _load_rooms(supabase, homestay_id: str) -> list[dict]:
    result = (
        supabase.table("homestay_rooms")
        .select("*")
        .eq("homestay_id", homestay_id)
        .order("sort_order")
        .execute()
    )
    return result.data or []


def _load_availability(supabase, homestay_id: str) -> list[dict]:
    result = (
        supabase.table("homestay_availability")
        .select("*")
        .eq("homestay_id", homestay_id)
        .gte("date", date.today().isoformat())
        .order("date")
        .limit(120)
        .execute()
    )
    return result.data or []


def _map_room(row: dict) -> OwnerHomestayRoom:
    return OwnerHomestayRoom(
        id=row["id"],
        name=row["name"],
        category=row.get("category"),
        capacity=int(row.get("capacity") or 2),
        pricePerNightMinor=int(row.get("price_per_night_minor") or 0),
        totalUnits=int(row.get("total_units") or 1),
        amenities=row.get("amenities") or [],
        sortOrder=int(row.get("sort_order") or 0),
        isActive=bool(row.get("is_active", True)),
        extraBedAvailable=bool(row.get("extra_bed_available", False)),
        extraBedPricePerNightMinor=int(row.get("extra_bed_price_per_night_minor") or 0),
    )


def _map_availability(row: dict) -> OwnerHomestayAvailability:
    return OwnerHomestayAvailability(
        id=row["id"],
        date=str(row.get("date", ""))[:10],
        roomId=row.get("room_id"),
        isBlocked=bool(row.get("is_blocked")),
        priceOverrideMinor=row.get("price_override_minor"),
        minNights=row.get("min_nights"),
        note=row.get("note"),
    )


def _map_owner_homestay(row: dict, rooms: list[dict], availability: list[dict]) -> OwnerHomestayDetail:
    currency = row.get("currency_code") or "INR"
    return OwnerHomestayDetail(
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
        rooms=[_map_room(room) for room in rooms],
        availability=[_map_availability(item) for item in availability],
        createdAt=row.get("created_at", ""),
        updatedAt=row.get("updated_at", ""),
    )


def _notify_admins_homestay_submitted(supabase, homestay_id: str, title: str, owner_id: str) -> None:
    owner_result = (
        supabase.table("homestay_owners")
        .select("full_name")
        .eq("id", owner_id)
        .maybe_single()
        .execute()
    )
    owner_name = ((owner_result.data if owner_result else None) or {}).get("full_name") or "An owner"
    from app.services.notifications import notify_admins_new_homestay_review

    notify_admins_new_homestay_review(homestay_id, title, owner_name)


def list_owner_homestays(auth: dict) -> list[OwnerHomestaySummary]:
    supabase = get_supabase_admin()
    owner_id = _resolve_owner_id(auth)

    result = (
        supabase.table("homestays")
        .select("id, slug, title, city, status, price_per_night_minor, currency_code, hero_image_url")
        .eq("owner_id", owner_id)
        .neq("status", "archived")
        .order("updated_at", desc=True)
        .execute()
    )
    rows = result.data or []
    if not rows:
        return []

    ids = [row["id"] for row in rows]
    rooms_result = (
        supabase.table("homestay_rooms")
        .select("homestay_id")
        .in_("homestay_id", ids)
        .eq("is_active", True)
        .execute()
    )
    room_counts: dict[str, int] = {}
    for room in rooms_result.data or []:
        stay_id = room["homestay_id"]
        room_counts[stay_id] = room_counts.get(stay_id, 0) + 1

    return [
        OwnerHomestaySummary(
            id=row["id"],
            slug=row["slug"],
            title=row["title"],
            city=row.get("city") or "",
            status=row.get("status") or "draft",
            pricePerNightMinor=int(row.get("price_per_night_minor") or 0),
            currencySymbol=_currency_symbol(row.get("currency_code") or "INR"),
            roomCount=room_counts.get(row["id"], 0),
            image=row.get("hero_image_url"),
        )
        for row in rows
    ]


def get_owner_homestay(auth: dict, homestay_id: str) -> OwnerHomestayDetail:
    supabase = get_supabase_admin()
    owner_id = _resolve_owner_id(auth)
    row = _fetch_owner_homestay_row(supabase, homestay_id, owner_id)
    rooms = _load_rooms(supabase, homestay_id)
    availability = _load_availability(supabase, homestay_id)
    return _map_owner_homestay(row, rooms, availability)


def create_owner_homestay(auth: dict, payload: CreateOwnerHomestayRequest) -> OwnerHomestayDetail:
    supabase = get_supabase_admin()
    owner_id = _resolve_owner_id(auth)
    _validate_property_type(payload.propertyType)

    slug = _ensure_unique_slug(supabase, payload.slug or _slugify(payload.title))
    status = "pending_review" if payload.submitForReview else "draft"
    city_slug, city_name = _resolve_city_fields(payload.citySlug, payload.city)
    gallery_urls = payload.galleryUrls or []
    hero_image_url = payload.heroImageUrl or (gallery_urls[0] if gallery_urls else None)

    insert_row = {
        "owner_id": owner_id,
        "slug": slug,
        "title": payload.title.strip(),
        "tagline": payload.tagline,
        "description": payload.description.strip(),
        "property_type": payload.propertyType,
        "city_slug": city_slug,
        "city": city_name,
        "region": payload.region,
        "address": payload.address,
        "price_per_night_minor": payload.pricePerNightMinor,
        "hero_image_url": hero_image_url,
        "gallery_urls": gallery_urls,
        "amenities": payload.amenities,
        "house_rules": payload.houseRules,
        "bedrooms": payload.bedrooms,
        "bathrooms": payload.bathrooms,
        "max_guests": payload.maxGuests,
        "check_in_time": payload.checkInTime or "14:00",
        "check_out_time": payload.checkOutTime or "11:00",
        "status": status,
        "currency_code": "INR",
    }
    if payload.mapLink and payload.mapLink.strip():
        insert_row["map_link"] = payload.mapLink.strip()

    result = supabase.table("homestays").insert(insert_row).select("id").execute()
    rows = result.data or []
    row = rows[0] if rows else None
    if not row:
        raise ValueError("Failed to create homestay.")

    if status == "pending_review":
        _notify_admins_homestay_submitted(supabase, row["id"], payload.title.strip(), owner_id)

    return get_owner_homestay(auth, row["id"])


def update_owner_homestay(
    auth: dict, homestay_id: str, payload: UpdateOwnerHomestayRequest
) -> OwnerHomestayDetail:
    supabase = get_supabase_admin()
    owner_id = _resolve_owner_id(auth)
    row = _fetch_owner_homestay_row(supabase, homestay_id, owner_id)
    status = row.get("status") or "draft"

    if status == "published":
        raise ValueError("Published homestays cannot be edited. Contact admin for changes.")
    if status == "pending_review" and not payload.submitForReview:
        raise ValueError("This homestay is awaiting admin review.")

    updates: dict = {}
    if payload.title is not None:
        updates["title"] = payload.title.strip()
    if payload.slug is not None:
        updates["slug"] = _ensure_unique_slug(supabase, payload.slug, homestay_id)
    if payload.tagline is not None:
        updates["tagline"] = payload.tagline
    if payload.description is not None:
        updates["description"] = payload.description.strip()
    if payload.propertyType is not None:
        _validate_property_type(payload.propertyType)
        updates["property_type"] = payload.propertyType
    if payload.citySlug is not None:
        city_slug, city_name = _resolve_city_fields(payload.citySlug, payload.city)
        updates["city_slug"] = city_slug
        updates["city"] = city_name
    elif payload.city is not None:
        updates["city"] = payload.city.strip()
    if payload.region is not None:
        updates["region"] = payload.region
    if payload.address is not None:
        updates["address"] = payload.address
    if payload.mapLink is not None:
        updates["map_link"] = payload.mapLink.strip() or None
    if payload.pricePerNightMinor is not None:
        updates["price_per_night_minor"] = payload.pricePerNightMinor
    if payload.heroImageUrl is not None:
        updates["hero_image_url"] = payload.heroImageUrl
    if payload.galleryUrls is not None:
        updates["gallery_urls"] = payload.galleryUrls
        if payload.heroImageUrl is None and payload.galleryUrls:
            updates["hero_image_url"] = payload.galleryUrls[0]
    if payload.amenities is not None:
        updates["amenities"] = payload.amenities
    if payload.houseRules is not None:
        updates["house_rules"] = payload.houseRules
    if payload.bedrooms is not None:
        updates["bedrooms"] = payload.bedrooms
    if payload.bathrooms is not None:
        updates["bathrooms"] = payload.bathrooms
    if payload.maxGuests is not None:
        updates["max_guests"] = payload.maxGuests
    if payload.checkInTime is not None:
        updates["check_in_time"] = payload.checkInTime
    if payload.checkOutTime is not None:
        updates["check_out_time"] = payload.checkOutTime

    if payload.submitForReview and status in ("draft", "rejected"):
        updates["status"] = "pending_review"

    if updates:
        supabase.table("homestays").update(updates).eq("id", homestay_id).execute()
        if updates.get("status") == "pending_review":
            title = updates.get("title") or row.get("title") or "Homestay"
            _notify_admins_homestay_submitted(supabase, homestay_id, title, owner_id)

    return get_owner_homestay(auth, homestay_id)


def delete_owner_homestay(auth: dict, homestay_id: str) -> None:
    supabase = get_supabase_admin()
    owner_id = _resolve_owner_id(auth)
    row = _fetch_owner_homestay_row(supabase, homestay_id, owner_id)
    status = row.get("status") or "draft"

    bookings = (
        supabase.table("homestay_bookings")
        .select("id", count="exact")
        .eq("homestay_id", homestay_id)
        .execute()
    )
    if (bookings.count or 0) > 0:
        supabase.table("homestays").update({"status": "archived"}).eq("id", homestay_id).execute()
        return

    if status == "draft":
        supabase.table("homestays").delete().eq("id", homestay_id).execute()
        return

    supabase.table("homestays").update({"status": "archived"}).eq("id", homestay_id).execute()


def create_owner_homestay_room(
    auth: dict, homestay_id: str, payload: CreateOwnerHomestayRoomRequest
) -> OwnerHomestayDetail:
    supabase = get_supabase_admin()
    owner_id = _resolve_owner_id(auth)
    _fetch_owner_homestay_row(supabase, homestay_id, owner_id)

    supabase.table("homestay_rooms").insert(
        {
            "homestay_id": homestay_id,
            "name": payload.name.strip(),
            "category": payload.category,
            "capacity": payload.capacity,
            "price_per_night_minor": payload.pricePerNightMinor,
            "total_units": payload.totalUnits,
            "amenities": payload.amenities,
            "sort_order": payload.sortOrder,
            "extra_bed_available": payload.extraBedAvailable,
            "extra_bed_price_per_night_minor": payload.extraBedPricePerNightMinor,
        }
    ).execute()

    return get_owner_homestay(auth, homestay_id)


def update_owner_homestay_room(
    auth: dict, homestay_id: str, room_id: str, payload: UpdateOwnerHomestayRoomRequest
) -> OwnerHomestayDetail:
    supabase = get_supabase_admin()
    owner_id = _resolve_owner_id(auth)
    _fetch_owner_homestay_row(supabase, homestay_id, owner_id)

    room_result = (
        supabase.table("homestay_rooms")
        .select("*")
        .eq("id", room_id)
        .eq("homestay_id", homestay_id)
        .maybe_single()
        .execute()
    )
    room = room_result.data if room_result else None
    if not room:
        raise ValueError("Room not found.")

    updates: dict = {}
    if payload.name is not None:
        updates["name"] = payload.name.strip()
    if payload.category is not None:
        updates["category"] = payload.category
    if payload.capacity is not None:
        updates["capacity"] = payload.capacity
    if payload.pricePerNightMinor is not None:
        updates["price_per_night_minor"] = payload.pricePerNightMinor
    if payload.totalUnits is not None:
        updates["total_units"] = payload.totalUnits
    if payload.amenities is not None:
        updates["amenities"] = payload.amenities
    if payload.sortOrder is not None:
        updates["sort_order"] = payload.sortOrder
    if payload.isActive is not None:
        updates["is_active"] = payload.isActive
    if payload.extraBedAvailable is not None:
        updates["extra_bed_available"] = payload.extraBedAvailable
    if payload.extraBedPricePerNightMinor is not None:
        updates["extra_bed_price_per_night_minor"] = payload.extraBedPricePerNightMinor

    if updates:
        supabase.table("homestay_rooms").update(updates).eq("id", room_id).execute()

    return get_owner_homestay(auth, homestay_id)


def delete_owner_homestay_room(auth: dict, homestay_id: str, room_id: str) -> OwnerHomestayDetail:
    supabase = get_supabase_admin()
    owner_id = _resolve_owner_id(auth)
    _fetch_owner_homestay_row(supabase, homestay_id, owner_id)

    bookings = (
        supabase.table("homestay_bookings")
        .select("id", count="exact")
        .eq("room_id", room_id)
        .in_("booking_status", ["pending", "confirmed"])
        .execute()
    )
    if (bookings.count or 0) > 0:
        raise ValueError("Cannot delete a room with active bookings. Deactivate it instead.")

    supabase.table("homestay_rooms").delete().eq("id", room_id).eq("homestay_id", homestay_id).execute()
    return get_owner_homestay(auth, homestay_id)


def upsert_owner_availability(
    auth: dict, homestay_id: str, payload: UpsertOwnerAvailabilityRequest
) -> OwnerHomestayDetail:
    supabase = get_supabase_admin()
    owner_id = _resolve_owner_id(auth)
    _fetch_owner_homestay_row(supabase, homestay_id, owner_id)

    day = date.fromisoformat(str(payload.date)[:10])
    if day < date.today():
        raise ValueError("Cannot set availability for past dates.")

    if payload.roomId:
        room_result = (
            supabase.table("homestay_rooms")
            .select("id")
            .eq("id", payload.roomId)
            .eq("homestay_id", homestay_id)
            .maybe_single()
            .execute()
        )
        if not (room_result.data if room_result else None):
            raise ValueError("Room not found.")

    row = {
        "homestay_id": homestay_id,
        "room_id": payload.roomId,
        "date": day.isoformat(),
        "is_blocked": payload.isBlocked,
        "price_override_minor": payload.priceOverrideMinor,
        "min_nights": payload.minNights,
        "note": payload.note,
    }

    existing = (
        supabase.table("homestay_availability")
        .select("id")
        .eq("homestay_id", homestay_id)
        .eq("date", day.isoformat())
    )
    if payload.roomId:
        existing = existing.eq("room_id", payload.roomId)
    else:
        existing = existing.is_("room_id", "null")
    existing_result = existing.maybe_single().execute()

    if existing_result.data if existing_result else None:
        supabase.table("homestay_availability").update(row).eq("id", existing_result.data["id"]).execute()
    else:
        supabase.table("homestay_availability").insert(row).execute()

    return get_owner_homestay(auth, homestay_id)


def delete_owner_availability(auth: dict, homestay_id: str, availability_id: str) -> OwnerHomestayDetail:
    supabase = get_supabase_admin()
    owner_id = _resolve_owner_id(auth)
    _fetch_owner_homestay_row(supabase, homestay_id, owner_id)

    result = (
        supabase.table("homestay_availability")
        .select("id")
        .eq("id", availability_id)
        .eq("homestay_id", homestay_id)
        .maybe_single()
        .execute()
    )
    if not (result.data if result else None):
        raise ValueError("Availability entry not found.")

    supabase.table("homestay_availability").delete().eq("id", availability_id).execute()
    return get_owner_homestay(auth, homestay_id)
