from app.models.schemas import Experience, Slot


def _format_time(value: str) -> str:
    return value[:5] if len(value) >= 5 else value


def _currency_symbol(code: str) -> str:
    if code == "INR":
        return "₹"
    if code == "EUR":
        return "€"
    if code == "USD":
        return "$"
    return "₹"


def map_row_to_experience(row: dict, slots: list[dict]) -> Experience:
    host = row.get("hosts") or {}
    category = (row.get("experience_categories") or {}).get("label") or row.get("category_slug", "")

    sorted_slots = sorted(
        slots,
        key=lambda s: (s.get("slot_date", ""), _format_time(s.get("start_time", ""))),
    )

    ui_slots = [
        Slot(
            id=s["id"],
            date=s["slot_date"],
            start=_format_time(s["start_time"]),
            end=_format_time(s["end_time"]),
            capacity=s["capacity"],
            available=0 if s.get("is_blocked") else max(0, s["capacity"] - s.get("seats_sold", 0)),
        )
        for s in sorted_slots
    ]

    gallery_urls = row.get("gallery_urls") or []
    hero = row.get("hero_image_url") or ""

    return Experience(
        id=row["id"],
        slug=row["slug"],
        title=row["title"],
        tagline=row.get("tagline") or "",
        description=row.get("description") or "",
        category=category,
        city=row["city"],
        citySlug=row.get("city_slug"),
        address=row.get("address") or "",
        durationHours=row["duration_minutes"] / 60,
        hostName=host.get("display_name") or "Host",
        hostBio=host.get("bio") or "",
        verifiedHost=bool(host.get("verified")),
        pricePerPerson=round(row["price_per_person_minor"] / 100),
        compareAtPricePerPerson=(
            round(int(row["compare_at_price_per_person_minor"]) / 100)
            if row.get("compare_at_price_per_person_minor")
            else None
        ),
        gstPercent=float(row.get("gst_percent") or 0),
        rating=float(row.get("average_rating") or 0),
        reviewsCount=int(row.get("review_count") or 0),
        image=hero,
        inclusions=row.get("inclusions") or [],
        galleryUrls=gallery_urls if gallery_urls else ([hero] if hero else []),
        exclusions=row.get("exclusions") or [],
        requirements=row.get("requirements") or [],
        region=row.get("region"),
        mapLink=row.get("map_link"),
        cancellation=row.get("cancellation_policy") or "",
        slots=ui_slots,
        currencySymbol=_currency_symbol(row.get("currency_code") or "INR"),
        minGuestsPerBooking=int(row.get("min_guests_per_booking") or 1),
        maxGuestsPerBooking=int(row.get("max_guests_per_booking") or 10),
    )
