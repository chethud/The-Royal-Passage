from datetime import date, timedelta

from app.dependencies.supabase import get_supabase_admin


def load_homestay_date_prices(homestay_id: str, *, horizon_days: int = 365) -> list[dict]:
    """Published property-level holiday / special date prices (not blocked)."""
    supabase = get_supabase_admin()
    today = date.today()
    end = today + timedelta(days=horizon_days)
    result = (
        supabase.table("homestay_availability")
        .select("date, price_override_minor, extra_bed_price_override_minor, note")
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


def _filter_override_rows(rows: list[dict], room_id: str | None) -> list[dict]:
    """Room-specific beats property-wide; keep both room/property tiers ordered."""
    return sorted(
        [
            row
            for row in rows
            if not (
                (row.get("room_id") and room_id and row.get("room_id") != room_id)
                or (row.get("room_id") and not room_id)
            )
        ],
        key=lambda row: 0 if row.get("room_id") else 1,
    )


def load_price_overrides_minor(
    homestay_id: str,
    room_id: str | None,
    check_in: date,
    check_out: date,
) -> dict[str, int]:
    """Resolve nightly room override map for a stay; room-specific beats property-wide."""
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
    overrides: dict[str, int] = {}
    for row in _filter_override_rows(result.data or [], room_id):
        price = row.get("price_override_minor")
        if price is None:
            continue
        overrides[str(row["date"])] = int(price)
    return overrides


def load_extra_bed_overrides_minor(
    homestay_id: str,
    room_id: str | None,
    check_in: date,
    check_out: date,
) -> dict[str, int]:
    """Resolve nightly extra-bed override map; room-specific beats property-wide."""
    supabase = get_supabase_admin()
    result = (
        supabase.table("homestay_availability")
        .select("date, extra_bed_price_override_minor, room_id")
        .eq("homestay_id", homestay_id)
        .eq("is_blocked", False)
        .gte("date", check_in.isoformat())
        .lt("date", check_out.isoformat())
        .not_.is_("extra_bed_price_override_minor", "null")
        .execute()
    )
    overrides: dict[str, int] = {}
    for row in _filter_override_rows(result.data or [], room_id):
        price = row.get("extra_bed_price_override_minor")
        if price is None:
            continue
        overrides[str(row["date"])] = int(price)
    return overrides
