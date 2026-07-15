"""Shared calendar bucketing for host / homestay owner revenue charts."""

from __future__ import annotations

from datetime import date, datetime, timedelta
from zoneinfo import ZoneInfo

DAY_TZ = ZoneInfo("Asia/Kolkata")
REVENUE_PERIODS = frozenset({"month", "monthwise", "months_6", "year"})


def revenue_today() -> date:
    return datetime.now(DAY_TZ).date()


def add_months(value: date, months: int) -> date:
    year = value.year + ((value.month - 1 + months) // 12)
    month = (value.month - 1 + months) % 12 + 1
    return date(year, month, 1)


def revenue_bucket_key(slot_day: date, grain: str) -> str:
    if grain == "month":
        return slot_day.replace(day=1).isoformat()
    return slot_day.isoformat()


def revenue_period_keys(today: date, period: str) -> tuple[list[str], list[str], str]:
    if period == "month":
        start = today.replace(day=1)
        previous_end = start - timedelta(days=1)
        previous_start = previous_end.replace(day=1)
        current_keys = [
            (start + timedelta(days=offset)).isoformat()
            for offset in range((today - start).days + 1)
        ]
        previous_keys = [
            (previous_start + timedelta(days=offset)).isoformat()
            for offset in range((previous_end - previous_start).days + 1)
        ]
        return current_keys, previous_keys, "day"

    if period == "monthwise":
        month_count = today.month
        current_start = date(today.year, 1, 1)
        previous_start = date(today.year - 1, 1, 1)
        current_keys = [add_months(current_start, offset).isoformat() for offset in range(month_count)]
        previous_keys = [
            add_months(previous_start, offset).isoformat() for offset in range(month_count)
        ]
        return current_keys, previous_keys, "month"

    month_count = 6 if period == "months_6" else 12
    current_start = add_months(today.replace(day=1), -(month_count - 1))
    previous_start = add_months(current_start, -month_count)
    current_keys = [add_months(current_start, offset).isoformat() for offset in range(month_count)]
    previous_keys = [
        add_months(previous_start, offset).isoformat() for offset in range(month_count)
    ]
    return current_keys, previous_keys, "month"
