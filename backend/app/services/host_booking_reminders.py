from __future__ import annotations

from datetime import date, datetime, timedelta, timezone

from app.dependencies.supabase import get_supabase_admin
from app.services.transactional_emails import (
    send_host_homestay_booking_reminder_email,
    send_host_new_homestay_booking_email,
    send_host_new_experience_booking_email,
    send_host_experience_booking_reminder_email,
    send_host_experience_upcoming_email,
)

REMINDER_STEPS: tuple[tuple[str, timedelta, str], ...] = (
    ("host_reminder_15m_at", timedelta(minutes=15), "15 minutes"),
    ("host_reminder_2h_at", timedelta(hours=2), "2 hours"),
    ("host_reminder_24h_at", timedelta(hours=24), "24 hours"),
)

ADMIN_PENDING_OVERDUE = timedelta(hours=1)

# Countdown emails before a confirmed experience runs.
UPCOMING_EXPERIENCE_DAYS: tuple[int, ...] = (10, 5, 4, 3, 2, 1)

EXPERIENCE_BOOKING_SELECT = """
id, created_at, booking_status, guest_name, guest_count, participant_count,
total_amount, subtotal_minor, currency_code,
experience_slots ( slot_date, start_time, end_time ),
experiences ( title, host_id, hosts ( id, display_name, email, auth_user_id ) )
"""

EXPERIENCE_UPCOMING_SELECT = """
id, created_at, booking_status, guest_name, guest_count, participant_count,
total_amount, subtotal_minor, currency_code, host_upcoming_reminders,
experience_slots ( slot_date, start_time, end_time ),
experiences ( title, host_id, hosts ( id, display_name, email, auth_user_id ) )
"""

HOMESTAY_BOOKING_SELECT = """
id, created_at, booking_status, guest_count, check_in, check_out, nights,
total_amount, subtotal_minor, currency_code,
homestays ( title, owner_id, homestay_owners ( id, full_name, email, auth_user_id ) ),
profiles ( full_name )
"""


def _parse_ts(value: str | None) -> datetime | None:
    if not value:
        return None
    text = str(value).replace("Z", "+00:00")
    try:
        parsed = datetime.fromisoformat(text)
    except ValueError:
        return None
    if parsed.tzinfo is None:
        return parsed.replace(tzinfo=timezone.utc)
    return parsed.astimezone(timezone.utc)


def resolve_host_email(supabase, auth_user_id: str | None, fallback_email: str | None) -> str:
    if fallback_email and str(fallback_email).strip():
        return str(fallback_email).strip()
    if not auth_user_id:
        return ""
    try:
        user = supabase.auth.admin.get_user_by_id(auth_user_id)
        return user.user.email or ""
    except Exception:
        return ""


def _guest_label(row: dict) -> str:
    return row.get("guest_name") or ((row.get("profiles") or {}).get("full_name")) or "A guest"


def _process_experience_bookings(supabase, now: datetime) -> dict[str, int]:
    sent = {"initial": 0, "reminder_15m": 0, "reminder_2h": 0, "reminder_24h": 0}

    result = (
        supabase.table("bookings")
        .select(EXPERIENCE_BOOKING_SELECT)
        .eq("booking_status", "pending")
        .execute()
    )
    for row in result.data or []:
        created = _parse_ts(row.get("created_at"))
        if not created:
            continue

        exp = row.get("experiences") or {}
        host = exp.get("hosts") or {}
        host_email = resolve_host_email(supabase, host.get("auth_user_id"), host.get("email"))
        if not host_email:
            continue

        host_name = host.get("display_name") or "Host"
        slot = row.get("experience_slots") or {}
        booking_id = row["id"]
        guest_count = row.get("participant_count") or row.get("guest_count") or 1
        total_minor = row.get("total_amount") or row.get("subtotal_minor") or 0
        currency = row.get("currency_code") or "INR"
        common = dict(
            to=host_email,
            host_name=host_name,
            guest_name=_guest_label(row),
            experience_title=exp.get("title") or "an experience",
            slot_date=slot.get("slot_date", ""),
            slot_start=slot.get("start_time", ""),
            slot_end=slot.get("end_time", ""),
            guest_count=guest_count,
            total_minor=total_minor,
            currency_code=currency,
            booking_id=booking_id,
        )

        if not row.get("host_request_email_sent_at"):
            if send_host_new_experience_booking_email(**common):
                supabase.table("bookings").update({"host_request_email_sent_at": now.isoformat()}).eq(
                    "id", booking_id
                ).execute()
                sent["initial"] += 1
            continue

        age = now - created
        for column, delay, label in REMINDER_STEPS:
            if row.get(column) or age < delay:
                continue
            key = column.replace("host_reminder_", "").replace("_at", "")
            if send_host_experience_booking_reminder_email(waiting_for=label, **common):
                supabase.table("bookings").update({column: now.isoformat()}).eq("id", booking_id).execute()
                sent[f"reminder_{key}"] += 1
            break

    return sent


def _process_homestay_bookings(supabase, now: datetime) -> dict[str, int]:
    sent = {"initial": 0, "reminder_15m": 0, "reminder_2h": 0, "reminder_24h": 0}

    result = (
        supabase.table("homestay_bookings")
        .select(HOMESTAY_BOOKING_SELECT)
        .eq("booking_status", "pending")
        .execute()
    )
    for row in result.data or []:
        created = _parse_ts(row.get("created_at"))
        if not created:
            continue

        stay = row.get("homestays") or {}
        owner = stay.get("homestay_owners") or {}
        owner_email = resolve_host_email(supabase, owner.get("auth_user_id"), owner.get("email"))
        if not owner_email:
            continue

        owner_name = owner.get("full_name") or "Host"
        booking_id = row["id"]
        nights = row.get("nights")
        if nights is None:
            check_in = str(row.get("check_in", ""))[:10]
            check_out = str(row.get("check_out", ""))[:10]
            try:
                nights = (date.fromisoformat(check_out) - date.fromisoformat(check_in)).days
            except ValueError:
                nights = 1

        common = dict(
            to=owner_email,
            host_name=owner_name,
            guest_name=_guest_label(row),
            stay_title=stay.get("title") or "your property",
            check_in=str(row.get("check_in", "")),
            check_out=str(row.get("check_out", "")),
            nights=int(nights or 1),
            guest_count=int(row.get("guest_count") or 1),
            total_minor=row.get("total_amount") or row.get("subtotal_minor") or 0,
            currency_code=row.get("currency_code") or "INR",
            booking_id=booking_id,
        )

        if not row.get("host_request_email_sent_at"):
            if send_host_new_homestay_booking_email(**common):
                supabase.table("homestay_bookings").update(
                    {"host_request_email_sent_at": now.isoformat()}
                ).eq("id", booking_id).execute()
                sent["initial"] += 1
            continue

        age = now - created
        for column, delay, label in REMINDER_STEPS:
            if row.get(column) or age < delay:
                continue
            key = column.replace("host_reminder_", "").replace("_at", "")
            if send_host_homestay_booking_reminder_email(waiting_for=label, **common):
                supabase.table("homestay_bookings").update({column: now.isoformat()}).eq(
                    "id", booking_id
                ).execute()
                sent[f"reminder_{key}"] += 1
            break

    return sent


def _process_upcoming_experience_reminders(supabase, now: datetime) -> dict[str, int]:
    """Email + notify hosts at 10/5/4/3/2/1 days before a confirmed experience."""
    sent = {f"day_{d}": 0 for d in UPCOMING_EXPERIENCE_DAYS}
    today = now.date()

    try:
        result = (
            supabase.table("bookings")
            .select(EXPERIENCE_UPCOMING_SELECT)
            .eq("booking_status", "confirmed")
            .execute()
        )
    except Exception as exc:
        return {**sent, "error": str(exc)}

    for row in result.data or []:
        slot = row.get("experience_slots") or {}
        raw_date = str(slot.get("slot_date") or "")[:10]
        if not raw_date:
            continue
        try:
            slot_date = date.fromisoformat(raw_date)
        except ValueError:
            continue

        days_left = (slot_date - today).days
        if days_left not in UPCOMING_EXPERIENCE_DAYS:
            continue

        already = row.get("host_upcoming_reminders") or {}
        if not isinstance(already, dict):
            already = {}
        day_key = str(days_left)
        if already.get(day_key):
            continue

        exp = row.get("experiences") or {}
        host = exp.get("hosts") or {}
        host_email = resolve_host_email(supabase, host.get("auth_user_id"), host.get("email"))
        if not host_email:
            continue

        booking_id = row["id"]
        host_name = host.get("display_name") or "Host"
        guest_name = _guest_label(row)
        experience_title = exp.get("title") or "an experience"
        guest_count = row.get("participant_count") or row.get("guest_count") or 1
        total_minor = row.get("total_amount") or row.get("subtotal_minor") or 0
        currency = row.get("currency_code") or "INR"

        ok = send_host_experience_upcoming_email(
            to=host_email,
            host_name=host_name,
            guest_name=guest_name,
            experience_title=experience_title,
            slot_date=raw_date,
            slot_start=slot.get("start_time", ""),
            slot_end=slot.get("end_time", ""),
            guest_count=int(guest_count),
            total_minor=int(total_minor or 0),
            currency_code=currency,
            booking_id=booking_id,
            days_left=days_left,
        )
        if not ok:
            continue

        next_map = {**already, day_key: now.isoformat()}
        try:
            supabase.table("bookings").update({"host_upcoming_reminders": next_map}).eq(
                "id", booking_id
            ).execute()
        except Exception:
            continue
        sent[f"day_{days_left}"] += 1

        host_user_id = host.get("auth_user_id")
        if host_user_id:
            try:
                from app.services.notifications import create_notification

                day_label = "1 day" if days_left == 1 else f"{days_left} days"
                create_notification(
                    host_user_id,
                    "experience_upcoming",
                    f"Experience in {day_label}",
                    f'"{experience_title}" with {guest_name} starts in {day_label}.',
                    {"bookingId": booking_id, "daysLeft": days_left},
                )
            except Exception:
                pass

    return sent


def _process_admin_pending_1h_alerts(supabase, now: datetime) -> dict[str, int]:
    """Notify admins once when a booking is still pending after 1 hour."""
    from app.services.notifications import notify_admins_pending_booking_overdue

    notified = {"experience": 0, "homestay": 0}
    cutoff = (now - ADMIN_PENDING_OVERDUE).isoformat()

    try:
        exp_result = (
            supabase.table("bookings")
            .select(
                "id, created_at, guest_name, experiences ( title )"
            )
            .eq("booking_status", "pending")
            .is_("admin_pending_1h_notified_at", "null")
            .lte("created_at", cutoff)
            .execute()
        )
    except Exception as exc:
        return {**notified, "experienceError": str(exc)}

    for row in exp_result.data or []:
        booking_id = row["id"]
        exp = row.get("experiences") or {}
        listing = exp.get("title") or "an experience"
        guest = row.get("guest_name") or "A guest"
        try:
            notify_admins_pending_booking_overdue(
                booking_id=booking_id,
                module="experience",
                title="Experience booking overdue",
                guest_name=guest,
                listing_title=listing,
            )
            supabase.table("bookings").update(
                {"admin_pending_1h_notified_at": now.isoformat()}
            ).eq("id", booking_id).execute()
            notified["experience"] += 1
        except Exception:
            continue

    try:
        stay_result = (
            supabase.table("homestay_bookings")
            .select(
                "id, created_at, guest_count, homestays ( title ), profiles ( full_name )"
            )
            .eq("booking_status", "pending")
            .is_("admin_pending_1h_notified_at", "null")
            .lte("created_at", cutoff)
            .execute()
        )
    except Exception as exc:
        return {**notified, "homestayError": str(exc)}

    for row in stay_result.data or []:
        booking_id = row["id"]
        stay = row.get("homestays") or {}
        listing = stay.get("title") or "a homestay"
        guest = ((row.get("profiles") or {}).get("full_name")) or "A guest"
        try:
            notify_admins_pending_booking_overdue(
                booking_id=booking_id,
                module="homestay",
                title="Homestay booking overdue",
                guest_name=guest,
                listing_title=listing,
            )
            supabase.table("homestay_bookings").update(
                {"admin_pending_1h_notified_at": now.isoformat()}
            ).eq("id", booking_id).execute()
            notified["homestay"] += 1
        except Exception:
            continue

    return notified


def process_host_booking_reminders() -> dict:
    supabase = get_supabase_admin()
    now = datetime.now(timezone.utc)

    experience = _process_experience_bookings(supabase, now)
    homestay = _process_homestay_bookings(supabase, now)
    upcoming = _process_upcoming_experience_reminders(supabase, now)
    admin_pending = _process_admin_pending_1h_alerts(supabase, now)

    return {
        "ok": True,
        "processedAt": now.isoformat(),
        "experience": experience,
        "homestay": homestay,
        "upcomingExperience": upcoming,
        "adminPendingOverdue": admin_pending,
    }
