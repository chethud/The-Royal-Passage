from datetime import date, timedelta

from app.dependencies.supabase import get_supabase_admin


def load_homestay_date_prices(homestay_id: str, *, horizon_days: int = 365) -> list[dict]:
    """Published property-level holiday / special date prices (not blocked)."""
    supabase = get_supabase_admin()
    today = date.today()
    end = today + timedelta(days=horizon_days)
    result = (
        supabase.table("homestay_availability")
        .select("date, price_override_minor, note")
        .eq("homestay_id", homestay_id)
        .eq("is_blocked", False)
        .is_("room_id", "null")
        .gte("date", today.isoformat())
        .lte("date", end.isoformat())
        .not_.is_("price_override_minor", "null")
        .order("date")
        .execute()
    )
    return result.data or []


def load_price_overrides_minor(
    homestay_id: str,
    room_id: str | None,
    check_in: date,
    check_out: date,
) -> dict[str, int]:
    """Resolve nightly override map for a stay; room-specific beats property-wide."""
    supabase = get_supabase_admin()
    result = (
        supabase.table("homestay_availability")
        .select("date, price_override_minor, room_id")
        .eq("homestay_id", homestay_id)
        .eq("is_blocked", False)
        .gte("date", check_in.isoformat())
        .lt("date", check_out.isoformat())
        .not_.is_("price_override_minor", "null")
        .execute()
    )
    rows = sorted(
        result.data or [],
        key=lambda row: 0 if row.get("room_id") else 1,
    )
    overrides: dict[str, int] = {}
    for row in rows:
        price = row.get("price_override_minor")
        if price is None:
            continue
        row_room = row.get("room_id")
        if row_room and room_id and row_room != room_id:
            continue
        if row_room and not room_id:
            continue
        overrides[str(row["date"])] = int(price)
    return overrides
