from datetime import date, datetime, timezone
from zoneinfo import ZoneInfo

BOOKING_TZ = ZoneInfo("Asia/Kolkata")


def _parse_time_minutes(value: str | None) -> int:
    if not value:
        return 11 * 60
    parts = str(value)[:5].split(":")
    hour = int(parts[0]) if parts and parts[0].isdigit() else 11
    minute = int(parts[1]) if len(parts) > 1 and parts[1].isdigit() else 0
    return hour * 60 + minute


def stay_end_datetime(row: dict) -> datetime | None:
    stay = row.get("homestays") or {}
    raw_date = row.get("check_out")
    if not raw_date:
        return None

    day = date.fromisoformat(str(raw_date)[:10])
    hours, minutes = divmod(_parse_time_minutes(stay.get("check_out_time")), 60)
    return datetime(day.year, day.month, day.day, hours, minutes, tzinfo=BOOKING_TZ)


def is_stay_over(row: dict) -> bool:
    end = stay_end_datetime(row)
    if end is None:
        return False
    return datetime.now(BOOKING_TZ) >= end


def should_auto_complete_homestay(row: dict) -> bool:
    if row.get("booking_status") != "confirmed":
        return False
    if row.get("payment_method") != "cod":
        return False
    return is_stay_over(row)


def auto_complete_homestay_if_due(supabase, row: dict) -> bool:
    if not should_auto_complete_homestay(row):
        return False

    booking_id = row["id"]
    now = datetime.now(timezone.utc).isoformat()
    updates = {
        "booking_status": "completed",
        "completed_at": now,
        "payment_status": "paid",
    }

    supabase.table("homestay_bookings").update(updates).eq("id", booking_id).execute()

    from app.services.notifications import create_notification

    guest_id = row.get("guest_id")
    if guest_id:
        create_notification(
            guest_id,
            "review_request",
            "How was your stay?",
            "Share a review of your homestay experience.",
            {"bookingId": booking_id, "bookingType": "homestay"},
        )

    row.update(updates)
    return True


def auto_complete_due_homestay_bookings(
    supabase,
    *,
    homestay_ids: list[str] | None = None,
    guest_id: str | None = None,
) -> int:
    query = (
        supabase.table("homestay_bookings")
        .select("*, homestays ( check_out_time )")
        .eq("booking_status", "confirmed")
        .eq("payment_method", "cod")
    )
    if homestay_ids:
        query = query.in_("homestay_id", homestay_ids)
    if guest_id:
        query = query.eq("guest_id", guest_id)

    result = query.execute()
    count = 0
    for row in result.data or []:
        if auto_complete_homestay_if_due(supabase, row):
            count += 1
    return count
