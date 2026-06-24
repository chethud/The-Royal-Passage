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


def _parse_time_minutes(value: str | None) -> int:
    if not value:
        return 0
    parts = str(value)[:5].split(":")
    hour = int(parts[0]) if parts and parts[0].isdigit() else 0
    minute = int(parts[1]) if len(parts) > 1 and parts[1].isdigit() else 0
    return hour * 60 + minute


def is_slot_still_bookable(
    slot_date: date | str,
    start_time: str | None = None,
    reference: date | None = None,
) -> bool:
    if not is_within_booking_window(slot_date, reference):
        return False
    if not start_time:
        return True

    today = reference or booking_today()
    day = _parse_slot_date(slot_date)
    if day > today:
        return True
    if day < today:
        return False

    now = datetime.now(BOOKING_WINDOW_TZ)
    return _parse_time_minutes(start_time) > now.hour * 60 + now.minute


def filter_guest_bookable_slots(slots: list[dict]) -> list[dict]:
    return [
        slot
        for slot in slots
        if is_slot_still_bookable(slot.get("slot_date", ""), slot.get("start_time"))
    ]


def assert_slot_in_booking_window(slot_date: date | str) -> None:
    if not is_within_booking_window(slot_date):
        raise ValueError(
            f"Sessions must fall within the next {BOOKING_WINDOW_DAYS} days (today through "
            f"{booking_window_end().isoformat()})."
        )


def assert_host_slot_date_valid(slot_date: date | str) -> None:
    day = _parse_slot_date(slot_date)
    today = booking_today()
    if day < today:
        raise ValueError("Session date cannot be in the past.")


def assert_slot_still_bookable(slot_date: date | str, start_time: str | None = None) -> None:
    if not is_slot_still_bookable(slot_date, start_time):
        raise ValueError("This session has already started or passed. Please choose another time.")
