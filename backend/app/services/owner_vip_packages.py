import re
import uuid

from app.dependencies.supabase import get_supabase_admin
from app.models.schemas import (
    CreateOwnerVipPackageRequest,
    OwnerVipPackageDetail,
    OwnerVipPackageSummary,
    UpdateOwnerVipPackageRequest,
)
from app.services.cities import get_city_by_slug

VALID_PACKAGE_TYPES = {
    "Palace Experience",
    "Heritage Circuit",
    "Wellness Retreat",
    "Culinary Journey",
    "Private Celebration",
}

PACKAGE_SELECT = "*"


def _resolve_owner_id(auth: dict) -> str:
    profile = auth["profile"]
    owner_id = profile.get("vip_owner_id")
    if owner_id:
        return owner_id

    supabase = get_supabase_admin()
    result = (
        supabase.table("vip_owners")
        .select("id")
        .eq("auth_user_id", auth["user"].id)
        .maybe_single()
        .execute()
    )
    row = result.data if result else None
    if not row:
        raise ValueError("VIP owner profile not linked to a provider account.")
    return row["id"]


def _currency_symbol(code: str) -> str:
    if code == "INR":
        return "₹"
    if code == "EUR":
        return "€"
    if code == "USD":
        return "$"
    return "₹"


def _slugify(title: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")
    return slug[:80] or f"vip-package-{uuid.uuid4().hex[:8]}"


def _ensure_unique_slug(supabase, slug: str, exclude_id: str | None = None) -> str:
    candidate = slug
    suffix = 1
    while True:
        query = supabase.table("vip_packages").select("id").eq("slug", candidate)
        if exclude_id:
            query = query.neq("id", exclude_id)
        result = query.maybe_single().execute()
        if not (result.data if result else None):
            return candidate
        candidate = f"{slug}-{suffix}"
        suffix += 1


def _resolve_vip_city_fields(city_slug: str, city_override: str | None = None) -> tuple[str, str]:
    city_slug, city_name = _resolve_city_fields(city_slug, city_override)
    if city_slug != "mysuru":
        raise ValueError("VIP packages are only offered in Mysuru.")
    return city_slug, city_name


def _resolve_city_fields(city_slug: str, city_override: str | None = None) -> tuple[str, str]:
    city_row = get_city_by_slug(city_slug.strip().lower())
    if not city_row:
        raise ValueError("Invalid city.")
    city_name = (city_override or city_row.name).strip()
    return city_slug.strip().lower(), city_name


def _validate_package_type(value: str) -> None:
    if value not in VALID_PACKAGE_TYPES:
        raise ValueError("Invalid package type.")


def _fetch_owner_package_row(supabase, package_id: str, owner_id: str) -> dict:
    result = (
        supabase.table("vip_packages")
        .select(PACKAGE_SELECT)
        .eq("id", package_id)
        .eq("owner_id", owner_id)
        .maybe_single()
        .execute()
    )
    row = result.data if result else None
    if not row:
        raise ValueError("Package not found.")
    return row


def _map_owner_package(row: dict) -> OwnerVipPackageDetail:
    currency = row.get("currency_code") or "INR"
    return OwnerVipPackageDetail(
        id=row["id"],
        slug=row["slug"],
        title=row["title"],
        tagline=row.get("tagline"),
        description=row.get("description"),
        packageType=row["package_type"],
        city=row.get("city") or "",
        citySlug=row.get("city_slug"),
        region=row.get("region"),
        priceFromMinor=int(row.get("price_from_minor") or 0),
        status=row.get("status") or "draft",
        heroImageUrl=row.get("hero_image_url"),
        galleryUrls=row.get("gallery_urls") or [],
        highlights=row.get("highlights") or [],
        conciergeNote=row.get("concierge_note"),
        durationDays=int(row.get("duration_days") or 1),
        maxGuests=int(row.get("max_guests") or 2),
        currencyCode=currency,
        currencySymbol=_currency_symbol(currency),
        createdAt=row.get("created_at", ""),
        updatedAt=row.get("updated_at", ""),
    )


def list_owner_vip_packages(auth: dict) -> list[OwnerVipPackageSummary]:
    supabase = get_supabase_admin()
    owner_id = _resolve_owner_id(auth)

    result = (
        supabase.table("vip_packages")
        .select(
            "id, slug, title, city, status, price_from_minor, currency_code, "
            "duration_days, hero_image_url, package_type"
        )
        .eq("owner_id", owner_id)
        .neq("status", "archived")
        .order("updated_at", desc=True)
        .execute()
    )
    rows = result.data or []

    return [
        OwnerVipPackageSummary(
            id=row["id"],
            slug=row["slug"],
            title=row["title"],
            city=row.get("city") or "",
            status=row.get("status") or "draft",
            priceFromMinor=int(row.get("price_from_minor") or 0),
            currencySymbol=_currency_symbol(row.get("currency_code") or "INR"),
            durationDays=int(row.get("duration_days") or 1),
            image=row.get("hero_image_url"),
            packageType=row.get("package_type") or "",
        )
        for row in rows
    ]


def get_owner_vip_package(auth: dict, package_id: str) -> OwnerVipPackageDetail:
    supabase = get_supabase_admin()
    owner_id = _resolve_owner_id(auth)
    row = _fetch_owner_package_row(supabase, package_id, owner_id)
    return _map_owner_package(row)


def create_owner_vip_package(auth: dict, payload: CreateOwnerVipPackageRequest) -> OwnerVipPackageDetail:
    supabase = get_supabase_admin()
    owner_id = _resolve_owner_id(auth)
    _validate_package_type(payload.packageType)

    slug = _ensure_unique_slug(supabase, payload.slug or _slugify(payload.title))
    status = "pending_review" if payload.submitForReview else "draft"
    city_slug, city_name = _resolve_vip_city_fields(payload.citySlug, payload.city)
    gallery_urls = payload.galleryUrls or []
    hero_image_url = payload.heroImageUrl or (gallery_urls[0] if gallery_urls else None)

    insert_row = {
        "owner_id": owner_id,
        "slug": slug,
        "title": payload.title.strip(),
        "tagline": payload.tagline,
        "description": payload.description.strip(),
        "package_type": payload.packageType,
        "city_slug": city_slug,
        "city": city_name,
        "region": payload.region,
        "price_from_minor": payload.priceFromMinor,
        "hero_image_url": hero_image_url,
        "gallery_urls": gallery_urls,
        "highlights": payload.highlights,
        "concierge_note": payload.conciergeNote,
        "duration_days": payload.durationDays,
        "max_guests": payload.maxGuests,
        "status": status,
        "currency_code": "INR",
    }

    result = supabase.table("vip_packages").insert(insert_row).select("id").execute()
    rows = result.data or []
    row = rows[0] if rows else None
    if not row:
        raise ValueError("Failed to create package.")

    return get_owner_vip_package(auth, row["id"])


def update_owner_vip_package(
    auth: dict, package_id: str, payload: UpdateOwnerVipPackageRequest
) -> OwnerVipPackageDetail:
    supabase = get_supabase_admin()
    owner_id = _resolve_owner_id(auth)
    row = _fetch_owner_package_row(supabase, package_id, owner_id)
    status = row.get("status") or "draft"

    if status == "published":
        raise ValueError("Published packages cannot be edited. Contact admin for changes.")
    if status == "pending_review" and not payload.submitForReview:
        raise ValueError("This package is awaiting admin review.")

    updates: dict = {}
    if payload.title is not None:
        updates["title"] = payload.title.strip()
    if payload.slug is not None:
        updates["slug"] = _ensure_unique_slug(supabase, payload.slug, package_id)
    if payload.tagline is not None:
        updates["tagline"] = payload.tagline
    if payload.description is not None:
        updates["description"] = payload.description.strip()
    if payload.packageType is not None:
        _validate_package_type(payload.packageType)
        updates["package_type"] = payload.packageType
    if payload.citySlug is not None:
        city_slug, city_name = _resolve_vip_city_fields(payload.citySlug, payload.city)
        updates["city_slug"] = city_slug
        updates["city"] = city_name
    elif payload.city is not None:
        updates["city"] = payload.city.strip()
    if payload.region is not None:
        updates["region"] = payload.region
    if payload.priceFromMinor is not None:
        updates["price_from_minor"] = payload.priceFromMinor
    if payload.heroImageUrl is not None:
        updates["hero_image_url"] = payload.heroImageUrl
    if payload.galleryUrls is not None:
        updates["gallery_urls"] = payload.galleryUrls
        if payload.heroImageUrl is None and payload.galleryUrls:
            updates["hero_image_url"] = payload.galleryUrls[0]
    if payload.highlights is not None:
        updates["highlights"] = payload.highlights
    if payload.conciergeNote is not None:
        updates["concierge_note"] = payload.conciergeNote
    if payload.durationDays is not None:
        updates["duration_days"] = payload.durationDays
    if payload.maxGuests is not None:
        updates["max_guests"] = payload.maxGuests
    if payload.submitForReview:
        updates["status"] = "pending_review"

    if updates:
        supabase.table("vip_packages").update(updates).eq("id", package_id).execute()

    return get_owner_vip_package(auth, package_id)
