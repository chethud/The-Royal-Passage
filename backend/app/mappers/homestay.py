from app.models.schemas import Homestay, HomestayRoom


def _format_time(value: str) -> str:
    return value[:5] if value and len(value) >= 5 else value or "14:00"


def _currency_symbol(code: str) -> str:
    if code == "INR":
        return "₹"
    if code == "EUR":
        return "€"
    if code == "USD":
        return "$"
    return "₹"


def map_row_to_homestay(row: dict, rooms: list[dict]) -> Homestay:
    owner = row.get("homestay_owners") or {}
    gallery_urls = row.get("gallery_urls") or []
    hero = row.get("hero_image_url") or ""

    ui_rooms = [
        HomestayRoom(
            id=room["id"],
            name=room["name"],
            category=room.get("category"),
            capacity=int(room.get("capacity") or 2),
            pricePerNight=round(int(room.get("price_per_night_minor") or 0) / 100),
            totalUnits=int(room.get("total_units") or 1),
            amenities=room.get("amenities") or [],
        )
        for room in sorted(rooms, key=lambda item: item.get("sort_order", 0))
        if room.get("is_active", True)
    ]

    base_night = round(int(row.get("price_per_night_minor") or 0) / 100)
    if ui_rooms and base_night <= 0:
        base_night = min(room.pricePerNight for room in ui_rooms)

    return Homestay(
        id=row["id"],
        slug=row["slug"],
        title=row["title"],
        tagline=row.get("tagline") or "",
        description=row.get("description") or "",
        propertyType=row["property_type"],
        city=row["city"],
        citySlug=row.get("city_slug"),
        address=row.get("address") or "",
        region=row.get("region"),
        mapLink=row.get("map_link"),
        pricePerNight=base_night,
        rating=float(row.get("rating_avg") or 0),
        reviewsCount=int(row.get("reviews_count") or 0),
        image=hero,
        galleryUrls=gallery_urls if gallery_urls else ([hero] if hero else []),
        amenities=row.get("amenities") or [],
        houseRules=row.get("house_rules") or [],
        bedrooms=int(row.get("bedrooms") or 1),
        bathrooms=int(row.get("bathrooms") or 1),
        maxGuests=int(row.get("max_guests") or 2),
        checkInTime=_format_time(str(row.get("check_in_time") or "14:00")),
        checkOutTime=_format_time(str(row.get("check_out_time") or "11:00")),
        currencySymbol=_currency_symbol(row.get("currency_code") or "INR"),
        ownerName=owner.get("full_name") or "Host",
        rooms=ui_rooms,
    )
