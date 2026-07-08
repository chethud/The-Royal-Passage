from app.models.schemas import Homestay, HomestayDatePrice, HomestayRoom
from app.services.homestay_availability import load_homestay_date_prices


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
            weekendPricePerNight=round(int(room.get("weekend_price_per_night_minor") or room.get("price_per_night_minor") or 0) / 100),
            totalUnits=int(room.get("total_units") or 1),
            amenities=room.get("amenities") or [],
            extraBedAvailable=bool(room.get("extra_bed_available", False)),
            extraBedPricePerNight=round(int(room.get("extra_bed_price_per_night_minor") or 0) / 100),
            extraBedWeekendPricePerNight=round(
                int(
                    room.get("weekend_extra_bed_price_per_night_minor")
                    or room.get("extra_bed_price_per_night_minor")
                    or 0
                )
                / 100
            ),
            extraBedsPerRoom=2 if int(room.get("extra_beds_per_room") or 1) >= 2 else 1,
        )
        for room in sorted(rooms, key=lambda item: item.get("sort_order", 0))
        if room.get("is_active", True)
    ]

    base_night = round(int(row.get("price_per_night_minor") or 0) / 100)
    weekend_night = round(
        int(row.get("weekend_price_per_night_minor") or row.get("price_per_night_minor") or 0) / 100
    )
    if ui_rooms and base_night <= 0:
        base_night = min(room.pricePerNight for room in ui_rooms)

    date_prices = [
        HomestayDatePrice(
            date=str(item["date"]),
            pricePerNight=round(int(item["price_override_minor"]) / 100),
            label=item.get("note") or None,
        )
        for item in load_homestay_date_prices(row["id"])
        if item.get("price_override_minor") is not None
    ]

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
        weekendPricePerNight=weekend_night,
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
        extraBedAvailable=bool(row.get("extra_bed_available", False)),
        extraBedPricePerNight=round(int(row.get("extra_bed_price_per_night_minor") or 0) / 100),
        extraBedWeekendPricePerNight=round(
            int(
                row.get("weekend_extra_bed_price_per_night_minor")
                or row.get("extra_bed_price_per_night_minor")
                or 0
            )
            / 100
        ),
        extraBedsPerRoom=2 if int(row.get("extra_beds_per_room") or 1) >= 2 else 1,
        datePrices=date_prices,
    )
