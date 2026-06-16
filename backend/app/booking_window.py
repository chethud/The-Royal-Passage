from datetime import date, datetime, timedelta
from zoneinfo import ZoneInfo

BOOKING_WINDOW_DAYS = 7
BOOKING_WINDOW_TZ = ZoneInfo("Asia/Kolkata")


def booking_today() -> date:
    return datetime.now(BOOKING_WINDOW_TZ).date()


def booking_window_end(from_day: date | None = None) -> date:
    start = from_day or booking_today()
    return start + timedelta(days=BOOKING_WINDOW_DAYS - 1)


def _parse_slot_date(value: date | str) -> date:
    if isinstance(value, date):
        return value
    return date.fromisoformat(str(value)[:10])


def is_within_booking_window(slot_date: date | str, reference: date | None = None) -> bool:
    day = _parse_slot_date(slot_date)
    start = reference or booking_today()
    end = booking_window_end(start)
    return start <= day <= end


def filter_guest_bookable_slots(slots: list[dict]) -> list[dict]:
    return [slot for slot in slots if is_within_booking_window(slot.get("slot_date", ""))]


def assert_slot_in_booking_window(slot_date: date | str) -> None:
    if not is_within_booking_window(slot_date):
        raise ValueError(
            f"Sessions must fall within the next {BOOKING_WINDOW_DAYS} days (today through "
            f"{booking_window_end().isoformat()})."
        )
