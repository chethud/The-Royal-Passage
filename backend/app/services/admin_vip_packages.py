from app.dependencies.supabase import get_supabase_admin
from app.models.schemas import AdminVipPackageDetail, AdminVipPackageSummary, ListAdminVipPackagesResponse
from app.services.owner_vip_packages import _currency_symbol

ADMIN_SELECT = """
*,
vip_owners ( full_name, email, phone, verified )
"""


def list_pending_vip_package_reviews() -> list[AdminVipPackageSummary]:
    supabase = get_supabase_admin()
    result = (
        supabase.table("vip_packages")
        .select(
            "id, slug, title, city, status, created_at, package_type, vip_owners ( full_name )"
        )
        .eq("status", "pending_review")
        .order("created_at", desc=True)
        .execute()
    )
    rows = result.data or []
    return [
        AdminVipPackageSummary(
            id=row["id"],
            slug=row["slug"],
            title=row["title"],
            city=row.get("city") or "",
            status=row.get("status") or "pending_review",
            ownerName=(row.get("vip_owners") or {}).get("full_name") or "Owner",
            createdAt=row.get("created_at", ""),
            packageType=row.get("package_type") or "",
        )
        for row in rows
    ]


def list_admin_vip_packages() -> ListAdminVipPackagesResponse:
    return ListAdminVipPackagesResponse(packages=list_pending_vip_package_reviews())


def get_admin_vip_package(package_id: str) -> AdminVipPackageDetail:
    supabase = get_supabase_admin()
    result = (
        supabase.table("vip_packages")
        .select(ADMIN_SELECT)
        .eq("id", package_id)
        .maybe_single()
        .execute()
    )
    row = result.data if result else None
    if not row:
        raise ValueError("VIP package not found.")

    owner = row.get("vip_owners") or {}
    currency = row.get("currency_code") or "INR"

    return AdminVipPackageDetail(
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
        ownerName=owner.get("full_name") or "Owner",
        ownerEmail=owner.get("email"),
        ownerPhone=owner.get("phone"),
        ownerVerified=bool(owner.get("verified")),
    )


def publish_vip_package(package_id: str) -> AdminVipPackageSummary:
    supabase = get_supabase_admin()
    result = (
        supabase.table("vip_packages")
        .select(
            "id, slug, title, city, status, created_at, package_type, owner_id, "
            "description, price_from_minor, vip_owners ( full_name )"
        )
        .eq("id", package_id)
        .maybe_single()
        .execute()
    )
    row = result.data if result else None
    if not row:
        raise ValueError("VIP package not found.")
    if row.get("status") != "pending_review":
        raise ValueError("Only packages pending review can be published.")
    if not (row.get("description") or "").strip():
        raise ValueError("Cannot publish without a package description.")
    if int(row.get("price_from_minor") or 0) <= 0:
        raise ValueError("Cannot publish without a starting price.")

    supabase.table("vip_packages").update({"status": "published"}).eq("id", package_id).execute()

    owner_id = row.get("owner_id")
    if owner_id:
        supabase.table("vip_owners").update(
            {"approval_status": "approved", "verified": True}
        ).eq("id", owner_id).execute()

    return AdminVipPackageSummary(
        id=row["id"],
        slug=row["slug"],
        title=row["title"],
        city=row.get("city") or "",
        status="published",
        ownerName=(row.get("vip_owners") or {}).get("full_name") or "Owner",
        createdAt=row.get("created_at", ""),
        packageType=row.get("package_type") or "",
    )


def reject_vip_package(package_id: str) -> AdminVipPackageSummary:
    supabase = get_supabase_admin()
    result = (
        supabase.table("vip_packages")
        .select(
            "id, slug, title, city, status, created_at, package_type, vip_owners ( full_name )"
        )
        .eq("id", package_id)
        .maybe_single()
        .execute()
    )
    row = result.data if result else None
    if not row:
        raise ValueError("VIP package not found.")
    if row.get("status") != "pending_review":
        raise ValueError("Only packages pending review can be rejected.")

    supabase.table("vip_packages").update({"status": "rejected"}).eq("id", package_id).execute()

    return AdminVipPackageSummary(
        id=row["id"],
        slug=row["slug"],
        title=row["title"],
        city=row.get("city") or "",
        status="rejected",
        ownerName=(row.get("vip_owners") or {}).get("full_name") or "Owner",
        createdAt=row.get("created_at", ""),
        packageType=row.get("package_type") or "",
    )
