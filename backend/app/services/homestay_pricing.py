from datetime import date, timedelta


def is_weekend(day: date) -> bool:
    """Saturday and Sunday count as weekend nights."""
    return day.weekday() >= 5


def resolve_weekend_price_minor(weekday_minor: int, weekend_minor: int | None) -> int:
    if weekend_minor is None:
        return weekday_minor
    return int(weekend_minor)


def night_rate_minor(
    day: date,
    weekday_minor: int,
    weekend_minor: int | None,
    price_overrides: dict[str, int] | None = None,
) -> int:
    override = (price_overrides or {}).get(day.isoformat())
    if override is not None:
        return int(override)
    if is_weekend(day):
        return resolve_weekend_price_minor(weekday_minor, weekend_minor)
    return int(weekday_minor)


def stay_subtotal_minor(
    check_in: date,
    check_out: date,
    weekday_minor: int,
    weekend_minor: int | None,
    room_count: int,
    extra_bed_minor: int,
    weekend_extra_bed_minor: int | None,
    extra_bed_count: int,
    price_overrides: dict[str, int] | None = None,
) -> int:
    total = 0
    day = check_in
    while day < check_out:
        nightly = night_rate_minor(day, weekday_minor, weekend_minor, price_overrides)
        extra_nightly = resolve_weekend_price_minor(extra_bed_minor, weekend_extra_bed_minor) if is_weekend(day) else extra_bed_minor
        total += nightly * room_count + extra_nightly * extra_bed_count
        day += timedelta(days=1)
    return total
