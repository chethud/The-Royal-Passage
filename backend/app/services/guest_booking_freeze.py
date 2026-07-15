"""Guest book-and-cancel abuse freezes.

If a guest cancels more than 3 bookings in a calendar day (Asia/Kolkata):
- first offense day → freeze new bookings for 24 hours
- later offense days → freeze for 3 days
"""

from __future__ import annotations

import logging
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

from app.dependencies.supabase import get_supabase_admin

logger = logging.getLogger(__name__)

DAY_TZ = ZoneInfo("Asia/Kolkata")
CANCEL_LIMIT_PER_DAY = 3  # freeze when cancellations today exceed this
FIRST_FREEZE = timedelta(hours=24)
REPEAT_FREEZE = timedelta(days=3)


def _parse_timestamptz(value: object) -> datetime | None:
    if value is None:
        return None
    if isinstance(value, datetime):
        return value if value.tzinfo else value.replace(tzinfo=timezone.utc)
    text = str(value).strip()
    if not text:
        return None
    if text.endswith("Z"):
        text = text[:-1] + "+00:00"
    try:
        parsed = datetime.fromisoformat(text)
    except ValueError:
        return None
    return parsed if parsed.tzinfo else parsed.replace(tzinfo=timezone.utc)


def _day_window_utc(now: datetime | None = None) -> tuple[datetime, datetime]:
    local_now = (now or datetime.now(timezone.utc)).astimezone(DAY_TZ)
    start_local = local_now.replace(hour=0, minute=0, second=0, microsecond=0)
    end_local = start_local + timedelta(days=1)
    return start_local.astimezone(timezone.utc), end_local.astimezone(timezone.utc)


def _format_freeze_until(until: datetime) -> str:
    local = until.astimezone(DAY_TZ)
    return local.strftime("%d %b %Y, %I:%M %p IST")


def assert_guest_can_create_booking(user_id: str) -> None:
    """Raise ValueError when the guest is currently frozen from booking."""
    supabase = get_supabase_admin()
    result = (
        supabase.table("profiles")
        .select("booking_freeze_until")
        .eq("id", user_id)
        .maybe_single()
        .execute()
    )
    row = result.data if result else None
    until = _parse_timestamptz((row or {}).get("booking_freeze_until"))
    now = datetime.now(timezone.utc)
    if until and until > now:
        raise ValueError(
            "Booking is temporarily frozen because you cancelled too many bookings. "
            f"You can book again after {_format_freeze_until(until)}."
        )


def record_guest_cancel_and_maybe_freeze(
    user_id: str,
    *,
    booking_id: str,
    booking_kind: str,
) -> None:
    """Record a guest-initiated cancel and freeze if daily abuse threshold is crossed."""
    supabase = get_supabase_admin()
    now = datetime.now(timezone.utc)

    try:
        supabase.table("guest_booking_cancel_events").insert(
            {
                "guest_id": user_id,
                "booking_kind": booking_kind,
                "booking_id": booking_id,
                "cancelled_at": now.isoformat(),
            }
        ).execute()
    except Exception:
        logger.exception(
            "Failed to record guest cancel event user=%s booking=%s kind=%s",
            user_id,
            booking_id,
            booking_kind,
        )
        return

    day_start, day_end = _day_window_utc(now)
    try:
        count_result = (
            supabase.table("guest_booking_cancel_events")
            .select("id", count="exact")
            .eq("guest_id", user_id)
            .gte("cancelled_at", day_start.isoformat())
            .lt("cancelled_at", day_end.isoformat())
            .execute()
        )
        cancel_count = int(count_result.count or 0)
    except Exception:
        logger.exception("Failed to count guest cancel events for user=%s", user_id)
        return

    if cancel_count <= CANCEL_LIMIT_PER_DAY:
        return

    profile_result = (
        supabase.table("profiles")
        .select("booking_freeze_until, booking_cancel_offense_count")
        .eq("id", user_id)
        .maybe_single()
        .execute()
    )
    profile = profile_result.data if profile_result else None
    if not profile:
        return

    now = datetime.now(timezone.utc)
    existing_until = _parse_timestamptz(profile.get("booking_freeze_until"))
    if existing_until and existing_until > now:
        # Already frozen for this abuse window — do not extend or re-count.
        return

    offense_count = int(profile.get("booking_cancel_offense_count") or 0)
    # First freeze day → 24h; any later freeze day → 3 days.
    duration = FIRST_FREEZE if offense_count < 1 else REPEAT_FREEZE
    freeze_until = now + duration
    new_offense = offense_count + 1

    try:
        supabase.table("profiles").update(
            {
                "booking_freeze_until": freeze_until.isoformat(),
                "booking_cancel_offense_count": new_offense,
            }
        ).eq("id", user_id).execute()
    except Exception:
        logger.exception("Failed to set booking freeze for user=%s", user_id)
        return

    hours = int(duration.total_seconds() // 3600)
    days = hours // 24
    duration_label = f"{days} day{'s' if days != 1 else ''}" if days >= 1 else f"{hours} hours"

    try:
        from app.services.notifications import create_notification

        create_notification(
            user_id,
            "booking_frozen",
            "Booking temporarily frozen",
            (
                f"You cancelled more than {CANCEL_LIMIT_PER_DAY} bookings today. "
                f"New bookings are frozen for {duration_label} "
                f"(until {_format_freeze_until(freeze_until)})."
            ),
            {
                "freezeUntil": freeze_until.isoformat(),
                "offenseCount": new_offense,
                "cancelsToday": cancel_count,
            },
        )
    except Exception:
        logger.exception("Failed to notify guest of booking freeze user=%s", user_id)
