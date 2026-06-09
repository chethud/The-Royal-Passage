from app.dependencies.supabase import get_supabase_admin
from app.models.schemas import WishlistExperienceSummary, WishlistItem


def _currency_symbol(code: str) -> str:
    if code == "INR":
        return "₹"
    if code == "EUR":
        return "€"
    if code == "USD":
        return "$"
    return "₹"


def _map_wishlist_row(row: dict) -> WishlistItem:
    experience = row.get("experiences") or {}
    host = experience.get("hosts") or {}

    return WishlistItem(
        experienceId=row["experience_id"],
        savedAt=row.get("created_at", ""),
        experience=WishlistExperienceSummary(
            id=experience.get("id", row["experience_id"]),
            slug=experience.get("slug", ""),
            title=experience.get("title", "Experience"),
            tagline=experience.get("tagline"),
            city=experience.get("city", ""),
            image=experience.get("hero_image_url") or "",
            pricePerPerson=round((experience.get("price_per_person_minor") or 0) / 100),
            rating=float(experience.get("average_rating") or 0),
            reviewsCount=int(experience.get("review_count") or 0),
            currencySymbol=_currency_symbol(experience.get("currency_code") or "INR"),
            hostName=host.get("display_name") or "Host",
        ),
    )


WISHLIST_SELECT = """
    experience_id,
    created_at,
    experiences (
      id, slug, title, tagline, city, hero_image_url,
      price_per_person_minor, average_rating, review_count, currency_code,
      hosts ( display_name )
    )
"""


def list_wishlist(auth: dict) -> list[WishlistItem]:
    supabase = get_supabase_admin()
    user_id = auth["user"].id

    result = (
        supabase.table("wishlist")
        .select(WISHLIST_SELECT)
        .eq("guest_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )

    return [_map_wishlist_row(row) for row in (result.data or [])]


def list_wishlist_experience_ids(auth: dict) -> list[str]:
    supabase = get_supabase_admin()
    user_id = auth["user"].id

    result = (
        supabase.table("wishlist")
        .select("experience_id")
        .eq("guest_id", user_id)
        .execute()
    )

    return [row["experience_id"] for row in (result.data or [])]


def add_to_wishlist(auth: dict, experience_id: str) -> WishlistItem:
    supabase = get_supabase_admin()
    user_id = auth["user"].id

    experience_result = (
        supabase.table("experiences")
        .select("id, status")
        .eq("id", experience_id)
        .maybe_single()
        .execute()
    )
    experience = experience_result.data if experience_result else None
    if not experience:
        raise ValueError("Experience not found.")
    if experience.get("status") != "published":
        raise ValueError("Only published experiences can be saved.")

    existing = (
        supabase.table("wishlist")
        .select("id")
        .eq("guest_id", user_id)
        .eq("experience_id", experience_id)
        .maybe_single()
        .execute()
    )
    if existing and existing.data:
        row_result = (
            supabase.table("wishlist")
            .select(WISHLIST_SELECT)
            .eq("guest_id", user_id)
            .eq("experience_id", experience_id)
            .maybe_single()
            .execute()
        )
        if not row_result or not row_result.data:
            raise ValueError("Wishlist item not found.")
        return _map_wishlist_row(row_result.data)

    insert_result = (
        supabase.table("wishlist")
        .insert({"guest_id": user_id, "experience_id": experience_id})
        .select(WISHLIST_SELECT)
        .execute()
    )
    insert_rows = (insert_result.data if insert_result else None) or []
    row = insert_rows[0] if insert_rows else None
    if not row:
        raise ValueError("Failed to save experience.")

    return _map_wishlist_row(row)


def remove_from_wishlist(auth: dict, experience_id: str) -> None:
    supabase = get_supabase_admin()
    user_id = auth["user"].id

    supabase.table("wishlist").delete().eq("guest_id", user_id).eq(
        "experience_id", experience_id
    ).execute()
