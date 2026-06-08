import re
import uuid

from app.dependencies.supabase import get_supabase_admin
from app.services.cities import get_city_by_slug
from app.models.schemas import (
    CategoryOption,
    CreateHostExperienceRequest,
    CreateHostSlotRequest,
    HostExperienceDetail,
    HostExperienceSummary,
    HostSlotDetail,
    UpdateHostExperienceRequest,
    UpdateHostSlotRequest,
)
from app.services.host_bookings import _resolve_host_id

HOST_EXP_SELECT = """
    *,
    experience_categories ( slug, label )
"""


def _currency_symbol(code: str) -> str:
    if code == "INR":
        return "₹"
    if code == "EUR":
        return "€"
    if code == "USD":
        return "$"
    return "₹"


def _format_time(value: str) -> str:
    return value[:5] if value and len(value) >= 5 else value or ""


def _slugify(title: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")
    return slug[:80] or f"experience-{uuid.uuid4().hex[:8]}"


def _ensure_unique_slug(supabase, slug: str, exclude_id: str | None = None) -> str:
    candidate = slug
    suffix = 1
    while True:
        query = supabase.table("experiences").select("id").eq("slug", candidate)
        if exclude_id:
            query = query.neq("id", exclude_id)
        result = query.maybe_single().execute()
        if not result.data:
            return candidate
        candidate = f"{slug}-{suffix}"
        suffix += 1


def _fetch_host_experience_row(supabase, experience_id: str, host_id: str) -> dict:
    result = (
        supabase.table("experiences")
        .select(HOST_EXP_SELECT)
        .eq("id", experience_id)
        .eq("host_id", host_id)
        .maybe_single()
        .execute()
    )
    row = result.data
    if not row:
        raise ValueError("Experience not found.")
    return row


def _load_slots(supabase, experience_id: str) -> list[dict]:
    result = (
        supabase.table("experience_slots")
        .select("*")
        .eq("experience_id", experience_id)
        .order("slot_date")
        .order("start_time")
        .execute()
    )
    return result.data or []


def _map_slot(row: dict) -> HostSlotDetail:
    capacity = row.get("capacity") or 0
    seats_sold = row.get("seats_sold") or 0
    blocked = bool(row.get("is_blocked"))
    available = 0 if blocked else max(0, capacity - seats_sold)
    return HostSlotDetail(
        id=row["id"],
        date=str(row.get("slot_date", "")),
        start=_format_time(row.get("start_time", "")),
        end=_format_time(row.get("end_time", "")),
        capacity=capacity,
        seatsSold=seats_sold,
        available=available,
        isBlocked=blocked,
    )


def _map_host_experience(row: dict, slots: list[dict]) -> HostExperienceDetail:
    category = row.get("experience_categories") or {}
    currency = row.get("currency_code") or "INR"
    return HostExperienceDetail(
        id=row["id"],
        slug=row["slug"],
        title=row["title"],
        tagline=row.get("tagline"),
        description=row.get("description"),
        categorySlug=row.get("category_slug") or category.get("slug") or "",
        categoryLabel=category.get("label") or row.get("category_slug") or "",
        city=row.get("city") or "",
        citySlug=row.get("city_slug"),
        region=row.get("region"),
        address=row.get("address"),
        durationMinutes=int(row.get("duration_minutes") or 60),
        pricePerPersonMinor=int(row.get("price_per_person_minor") or 0),
        status=row.get("status") or "draft",
        heroImageUrl=row.get("hero_image_url"),
        inclusions=row.get("inclusions") or [],
        exclusions=row.get("exclusions") or [],
        requirements=row.get("requirements") or [],
        cancellationPolicy=row.get("cancellation_policy"),
        minGuestsPerBooking=int(row.get("min_guests_per_booking") or 1),
        maxGuestsPerBooking=int(row.get("max_guests_per_booking") or 10),
        currencyCode=currency,
        currencySymbol=_currency_symbol(currency),
        slots=[_map_slot(slot) for slot in slots],
        createdAt=row.get("created_at", ""),
        updatedAt=row.get("updated_at", ""),
    )


def list_categories() -> list[CategoryOption]:
    supabase = get_supabase_admin()
    result = (
        supabase.table("experience_categories")
        .select("slug, label")
        .order("sort_order")
        .execute()
    )
    return [
        CategoryOption(slug=row["slug"], label=row["label"])
        for row in (result.data or [])
    ]


def list_host_experiences(auth: dict) -> list[HostExperienceSummary]:
    supabase = get_supabase_admin()
    host_id = _resolve_host_id(auth)

    result = (
        supabase.table("experiences")
        .select("id, slug, title, city, status, price_per_person_minor, currency_code, hero_image_url")
        .eq("host_id", host_id)
        .neq("status", "archived")
        .order("updated_at", desc=True)
        .execute()
    )
    rows = result.data or []
    if not rows:
        return []

    ids = [row["id"] for row in rows]
    slots_result = (
        supabase.table("experience_slots")
        .select("experience_id")
        .in_("experience_id", ids)
        .execute()
    )
    slot_counts: dict[str, int] = {}
    for slot in slots_result.data or []:
        exp_id = slot["experience_id"]
        slot_counts[exp_id] = slot_counts.get(exp_id, 0) + 1

    return [
        HostExperienceSummary(
            id=row["id"],
            slug=row["slug"],
            title=row["title"],
            city=row.get("city") or "",
            status=row.get("status") or "draft",
            pricePerPersonMinor=int(row.get("price_per_person_minor") or 0),
            currencySymbol=_currency_symbol(row.get("currency_code") or "INR"),
            slotCount=slot_counts.get(row["id"], 0),
            image=row.get("hero_image_url"),
        )
        for row in rows
    ]


def get_host_experience(auth: dict, experience_id: str) -> HostExperienceDetail:
    supabase = get_supabase_admin()
    host_id = _resolve_host_id(auth)
    row = _fetch_host_experience_row(supabase, experience_id, host_id)
    slots = _load_slots(supabase, experience_id)
    return _map_host_experience(row, slots)


def _validate_guest_bounds(min_guests: int, max_guests: int) -> None:
    if min_guests > max_guests:
        raise ValueError("Minimum guests cannot exceed maximum guests.")


def _resolve_city_fields(city_slug: str, city_override: str | None = None) -> tuple[str, str]:
    city_row = get_city_by_slug(city_slug.strip().lower())
    if not city_row:
        raise ValueError("Invalid city.")
    city_name = (city_override or city_row.name).strip()
    return city_slug.strip().lower(), city_name


def create_host_experience(auth: dict, payload: CreateHostExperienceRequest) -> HostExperienceDetail:
    supabase = get_supabase_admin()
    host_id = _resolve_host_id(auth)
    _validate_guest_bounds(payload.minGuestsPerBooking, payload.maxGuestsPerBooking)

    category = (
        supabase.table("experience_categories")
        .select("slug")
        .eq("slug", payload.categorySlug)
        .maybe_single()
        .execute()
    )
    if not category.data:
        raise ValueError("Invalid category.")

    slug = _ensure_unique_slug(supabase, payload.slug or _slugify(payload.title))
    status = "pending_review" if payload.submitForReview else "draft"
    city_slug, city_name = _resolve_city_fields(payload.citySlug, payload.city)

    insert_row = {
        "host_id": host_id,
        "slug": slug,
        "title": payload.title.strip(),
        "tagline": payload.tagline,
        "description": payload.description.strip(),
        "category_slug": payload.categorySlug,
        "city_slug": city_slug,
        "city": city_name,
        "region": payload.region,
        "address": payload.address,
        "duration_minutes": payload.durationMinutes,
        "price_per_person_minor": payload.pricePerPersonMinor,
        "hero_image_url": payload.heroImageUrl,
        "inclusions": payload.inclusions,
        "exclusions": payload.exclusions,
        "requirements": payload.requirements,
        "cancellation_policy": payload.cancellationPolicy,
        "min_guests_per_booking": payload.minGuestsPerBooking,
        "max_guests_per_booking": payload.maxGuestsPerBooking,
        "status": status,
        "currency_code": "INR",
    }

    result = supabase.table("experiences").insert(insert_row).select("id").execute()
    rows = result.data or []
    row = rows[0] if rows else None
    if not row:
        raise ValueError("Failed to create experience.")

    return get_host_experience(auth, row["id"])


def update_host_experience(
    auth: dict, experience_id: str, payload: UpdateHostExperienceRequest
) -> HostExperienceDetail:
    supabase = get_supabase_admin()
    host_id = _resolve_host_id(auth)
    row = _fetch_host_experience_row(supabase, experience_id, host_id)
    status = row.get("status") or "draft"

    if status == "published":
        raise ValueError("Published experiences cannot be edited. Contact admin for changes.")
    if status == "pending_review" and not payload.submitForReview:
        raise ValueError("This experience is awaiting admin review.")

    updates: dict = {}
    if payload.title is not None:
        updates["title"] = payload.title.strip()
    if payload.slug is not None:
        updates["slug"] = _ensure_unique_slug(supabase, payload.slug, experience_id)
    if payload.tagline is not None:
        updates["tagline"] = payload.tagline
    if payload.description is not None:
        updates["description"] = payload.description.strip()
    if payload.categorySlug is not None:
        category = (
            supabase.table("experience_categories")
            .select("slug")
            .eq("slug", payload.categorySlug)
            .maybe_single()
            .execute()
        )
        if not category.data:
            raise ValueError("Invalid category.")
        updates["category_slug"] = payload.categorySlug
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
    if payload.durationMinutes is not None:
        updates["duration_minutes"] = payload.durationMinutes
    if payload.pricePerPersonMinor is not None:
        updates["price_per_person_minor"] = payload.pricePerPersonMinor
    if payload.heroImageUrl is not None:
        updates["hero_image_url"] = payload.heroImageUrl
    if payload.inclusions is not None:
        updates["inclusions"] = payload.inclusions
    if payload.exclusions is not None:
        updates["exclusions"] = payload.exclusions
    if payload.requirements is not None:
        updates["requirements"] = payload.requirements
    if payload.cancellationPolicy is not None:
        updates["cancellation_policy"] = payload.cancellationPolicy

    min_guests = payload.minGuestsPerBooking or row.get("min_guests_per_booking") or 1
    max_guests = payload.maxGuestsPerBooking or row.get("max_guests_per_booking") or 10
    if payload.minGuestsPerBooking is not None:
        updates["min_guests_per_booking"] = payload.minGuestsPerBooking
    if payload.maxGuestsPerBooking is not None:
        updates["max_guests_per_booking"] = payload.maxGuestsPerBooking
    _validate_guest_bounds(min_guests, max_guests)

    if payload.submitForReview and status in ("draft", "rejected"):
        updates["status"] = "pending_review"

    if updates:
        supabase.table("experiences").update(updates).eq("id", experience_id).execute()

    return get_host_experience(auth, experience_id)


def delete_host_experience(auth: dict, experience_id: str) -> None:
    supabase = get_supabase_admin()
    host_id = _resolve_host_id(auth)
    row = _fetch_host_experience_row(supabase, experience_id, host_id)
    status = row.get("status") or "draft"

    bookings = (
        supabase.table("bookings")
        .select("id", count="exact")
        .eq("experience_id", experience_id)
        .execute()
    )
    if (bookings.count or 0) > 0:
        supabase.table("experiences").update({"status": "archived"}).eq("id", experience_id).execute()
        return

    if status == "draft":
        supabase.table("experiences").delete().eq("id", experience_id).execute()
        return

    supabase.table("experiences").update({"status": "archived"}).eq("id", experience_id).execute()


def create_host_slot(
    auth: dict, experience_id: str, payload: CreateHostSlotRequest
) -> HostExperienceDetail:
    supabase = get_supabase_admin()
    host_id = _resolve_host_id(auth)
    _fetch_host_experience_row(supabase, experience_id, host_id)

    supabase.table("experience_slots").insert(
        {
            "experience_id": experience_id,
            "slot_date": payload.slotDate,
            "start_time": payload.startTime,
            "end_time": payload.endTime,
            "capacity": payload.capacity,
        }
    ).execute()

    return get_host_experience(auth, experience_id)


def update_host_slot(
    auth: dict, experience_id: str, slot_id: str, payload: UpdateHostSlotRequest
) -> HostExperienceDetail:
    supabase = get_supabase_admin()
    host_id = _resolve_host_id(auth)
    _fetch_host_experience_row(supabase, experience_id, host_id)

    slot_result = (
        supabase.table("experience_slots")
        .select("*")
        .eq("id", slot_id)
        .eq("experience_id", experience_id)
        .maybe_single()
        .execute()
    )
    slot = slot_result.data
    if not slot:
        raise ValueError("Slot not found.")

    updates: dict = {}
    if payload.slotDate is not None:
        updates["slot_date"] = payload.slotDate
    if payload.startTime is not None:
        updates["start_time"] = payload.startTime
    if payload.endTime is not None:
        updates["end_time"] = payload.endTime
    if payload.isBlocked is not None:
        updates["is_blocked"] = payload.isBlocked
    if payload.capacity is not None:
        seats_sold = slot.get("seats_sold") or 0
        if payload.capacity < seats_sold:
            raise ValueError("Capacity cannot be less than seats already sold.")
        updates["capacity"] = payload.capacity

    if updates:
        supabase.table("experience_slots").update(updates).eq("id", slot_id).execute()

    return get_host_experience(auth, experience_id)


def delete_host_slot(auth: dict, experience_id: str, slot_id: str) -> HostExperienceDetail:
    supabase = get_supabase_admin()
    host_id = _resolve_host_id(auth)
    _fetch_host_experience_row(supabase, experience_id, host_id)

    slot_result = (
        supabase.table("experience_slots")
        .select("seats_sold")
        .eq("id", slot_id)
        .eq("experience_id", experience_id)
        .maybe_single()
        .execute()
    )
    slot = slot_result.data
    if not slot:
        raise ValueError("Slot not found.")
    if (slot.get("seats_sold") or 0) > 0:
        raise ValueError("Cannot delete a slot with existing bookings. Block it instead.")

    supabase.table("experience_slots").delete().eq("id", slot_id).execute()
    return get_host_experience(auth, experience_id)
