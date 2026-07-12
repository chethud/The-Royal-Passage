from datetime import date, datetime, timezone
from zoneinfo import ZoneInfo

BOOKING_TZ = ZoneInfo("Asia/Kolkata")


def _parse_time_minutes(value: str | None) -> int:
    if not value:
        return 0
    parts = str(value)[:5].split(":")
    hour = int(parts[0]) if parts and parts[0].isdigit() else 0
    minute = int(parts[1]) if len(parts) > 1 and parts[1].isdigit() else 0
    return hour * 60 + minute


def event_end_datetime(row: dict) -> datetime | None:
    slot = row.get("experience_slots") or {}
    raw_date = slot.get("slot_date")
    end_time = slot.get("end_time")
    if not raw_date or not end_time:
        return None

    day = date.fromisoformat(str(raw_date)[:10])
    hours, minutes = divmod(_parse_time_minutes(str(end_time)), 60)
    return datetime(day.year, day.month, day.day, hours, minutes, tzinfo=BOOKING_TZ)


def is_event_over(row: dict) -> bool:
    end = event_end_datetime(row)
    if end is None:
        return False
    return datetime.now(BOOKING_TZ) >= end


def should_auto_complete(row: dict) -> bool:
    if row.get("booking_status") != "confirmed":
        return False
    if row.get("is_paused"):
        return False
    return is_event_over(row)


def auto_complete_booking_if_due(supabase, row: dict) -> bool:
    if not should_auto_complete(row):
        return False

    booking_id = row["id"]
    now = datetime.now(timezone.utc).isoformat()
    updates: dict = {
        "booking_status": "completed",
        "status": "completed",
        "completed_at": now,
    }
    if row.get("payment_status") != "paid":
        updates["payment_status"] = "paid"

    supabase.table("bookings").update(updates).eq("id", booking_id).execute()

    from app.services.notifications import create_notification

    guest_id = row.get("guest_id")
    if guest_id:
        create_notification(
            guest_id,
            "review_request",
            "How was your experience?",
            "Leave a review to help other travellers discover great experiences.",
            {"bookingId": booking_id},
        )

    row.update(updates)
    return True


def auto_complete_due_confirmed_bookings(
    supabase,
    *,
    experience_ids: list[str] | None = None,
    guest_id: str | None = None,
    limit: int = 100,
) -> int:
    try:
        query = (
            supabase.table("bookings")
            .select("*, experience_slots ( slot_date, start_time, end_time )")
            .eq("booking_status", "confirmed")
            .eq("is_paused", False)
            .order("created_at", desc=False)
            .limit(limit)
        )
        if experience_ids:
            query = query.in_("experience_id", experience_ids)
        if guest_id:
            query = query.eq("guest_id", guest_id)

        result = query.execute()
    except Exception:
        try:
            query = (
                supabase.table("bookings")
                .select("id, guest_id, booking_status, payment_status, is_paused, experience_slots ( slot_date, start_time, end_time )")
                .eq("booking_status", "confirmed")
                .limit(limit)
            )
            if experience_ids:
                query = query.in_("experience_id", experience_ids)
            if guest_id:
                query = query.eq("guest_id", guest_id)
            result = query.execute()
        except Exception:
            return 0

    count = 0
    for row in result.data or []:
        if auto_complete_booking_if_due(supabase, row):
            count += 1
    return count
