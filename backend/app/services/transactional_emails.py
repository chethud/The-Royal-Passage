from __future__ import annotations

from datetime import date, datetime

from app.config import settings
from app.dependencies.supabase import get_supabase_admin
from app.services.email import send_email


def _format_amount(minor: int, currency_code: str) -> str:
    major = minor / 100
    symbol = "₹" if currency_code == "INR" else currency_code + " "
    if currency_code == "INR":
        return f"{symbol}{major:,.0f}"
    return f"{symbol}{major:,.2f}"


def _format_date(value: str | date | None) -> str:
    if not value:
        return ""
    if isinstance(value, date):
        return value.strftime("%d %b %Y")
    text = str(value)[:10]
    try:
        return datetime.strptime(text, "%Y-%m-%d").strftime("%d %b %Y")
    except ValueError:
        return text


def _format_time(value: str | None) -> str:
    if not value:
        return ""
    return value[:5] if len(value) >= 5 else value


def _site_link(path: str) -> str:
    base = settings.site_url.rstrip("/")
    return f"{base}{path}"


def _wrap_html(title: str, body_html: str) -> str:
    return f"""<!DOCTYPE html>
<html>
<body style="font-family: Georgia, 'Times New Roman', serif; color: #3d2314; background: #faf6ef; margin: 0; padding: 24px;">
  <div style="max-width: 560px; margin: 0 auto; background: #fffdf8; border: 1px solid #e8dcc8; border-radius: 12px; padding: 28px;">
    <p style="margin: 0 0 8px; font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; color: #7a1f2b;">The Royal Passage</p>
    <h1 style="margin: 0 0 16px; font-size: 22px; color: #5c1a24;">{title}</h1>
    {body_html}
    <p style="margin: 24px 0 0; font-size: 13px; color: #6b5b4d;">— The Royal Passage</p>
  </div>
</body>
</html>"""


def _welcome_sent(user_id: str) -> bool:
    supabase = get_supabase_admin()
    result = (
        supabase.table("notifications")
        .select("id")
        .eq("user_id", user_id)
        .eq("type", "account_welcome")
        .limit(1)
        .execute()
    )
    return bool(result.data)


def _guest_contact(supabase, guest_id: str) -> tuple[str, str]:
    profile_result = (
        supabase.table("profiles")
        .select("full_name")
        .eq("id", guest_id)
        .maybe_single()
        .execute()
    )
    name = ((profile_result.data if profile_result else None) or {}).get("full_name") or "Guest"
    try:
        user = supabase.auth.admin.get_user_by_id(guest_id)
        email = user.user.email or ""
    except Exception:
        email = ""
    return email, name


def maybe_send_welcome_email(auth: dict) -> None:
    profile = auth.get("profile") or {}
    user = auth.get("user")
    if not user or not user.email:
        return
    if (profile.get("role") or "guest") != "guest":
        return
    if _welcome_sent(user.id):
        return

    name = (profile.get("full_name") or "").strip() or "Guest"
    subject = "Welcome to The Royal Passage"
    html = _wrap_html(
        "Welcome",
        f"""
    <p style="line-height: 1.6;">Dear {name},</p>
    <p style="line-height: 1.6;">Your account is ready. Discover curated experiences, homestays, and royal journeys across India.</p>
    <p style="line-height: 1.6;"><a href="{_site_link("/")}" style="color: #7a1f2b;">Explore experiences</a> or visit your profile to complete your details.</p>
    """,
    )
    if not send_email(to=user.email, subject=subject, html=html):
        return

    from app.services.notifications import create_notification

    try:
        create_notification(
            user.id,
            "account_welcome",
            "Welcome to The Royal Passage",
            "Your account is ready. Start exploring experiences and stays.",
            {},
        )
    except Exception:
        pass


def send_experience_booking_requested_email(
    *,
    to: str,
    guest_name: str,
    experience_title: str,
    slot_date: str,
    slot_start: str,
    slot_end: str,
    guest_count: int,
    total_minor: int,
    currency_code: str,
    booking_id: str,
) -> None:
    amount = _format_amount(total_minor, currency_code)
    html = _wrap_html(
        "Booking request received",
        f"""
    <p style="line-height: 1.6;">Dear {guest_name or "Guest"},</p>
    <p style="line-height: 1.6;">We received your booking request for <strong>{experience_title}</strong>.</p>
    <ul style="line-height: 1.8; padding-left: 20px;">
      <li>Date: {_format_date(slot_date)}</li>
      <li>Time: {_format_time(slot_start)} – {_format_time(slot_end)}</li>
      <li>Guests: {guest_count}</li>
      <li>Estimated total: {amount} (pay at venue on arrival)</li>
    </ul>
    <p style="line-height: 1.6;">Your host will confirm shortly. We will email you again once it is confirmed.</p>
    <p style="line-height: 1.6;"><a href="{_site_link(f"/bookings/{booking_id}")}" style="color: #7a1f2b;">View booking</a></p>
    """,
    )
    send_email(
        to=to,
        subject=f"Booking request received — {experience_title}",
        html=html,
    )


def send_experience_booking_confirmed_email(
    *,
    to: str,
    guest_name: str,
    experience_title: str,
    slot_date: str,
    slot_start: str,
    slot_end: str,
    guest_count: int,
    total_minor: int,
    currency_code: str,
    booking_id: str,
) -> None:
    amount = _format_amount(total_minor, currency_code)
    html = _wrap_html(
        "Booking confirmed",
        f"""
    <p style="line-height: 1.6;">Dear {guest_name or "Guest"},</p>
    <p style="line-height: 1.6;">Great news — your host confirmed <strong>{experience_title}</strong>.</p>
    <ul style="line-height: 1.8; padding-left: 20px;">
      <li>Date: {_format_date(slot_date)}</li>
      <li>Time: {_format_time(slot_start)} – {_format_time(slot_end)}</li>
      <li>Guests: {guest_count}</li>
      <li>Total due at venue: {amount}</li>
    </ul>
    <p style="line-height: 1.6;">Please pay your host in cash or UPI when you arrive.</p>
    <p style="line-height: 1.6;"><a href="{_site_link(f"/bookings/{booking_id}")}" style="color: #7a1f2b;">View booking details</a></p>
    """,
    )
    send_email(
        to=to,
        subject=f"Booking confirmed — {experience_title}",
        html=html,
    )


def send_homestay_booking_requested_email(
    *,
    to: str,
    guest_name: str,
    stay_title: str,
    check_in: str,
    check_out: str,
    nights: int,
    total_minor: int,
    currency_code: str,
    booking_id: str,
) -> None:
    amount = _format_amount(total_minor, currency_code)
    html = _wrap_html(
        "Stay request received",
        f"""
    <p style="line-height: 1.6;">Dear {guest_name or "Guest"},</p>
    <p style="line-height: 1.6;">We received your stay request for <strong>{stay_title}</strong>.</p>
    <ul style="line-height: 1.8; padding-left: 20px;">
      <li>Check-in: {_format_date(check_in)}</li>
      <li>Check-out: {_format_date(check_out)}</li>
      <li>Nights: {nights}</li>
      <li>Estimated total: {amount} (pay at check-in once confirmed)</li>
    </ul>
    <p style="line-height: 1.6;">Your host will confirm shortly.</p>
    <p style="line-height: 1.6;"><a href="{_site_link(f"/stays/{booking_id}")}" style="color: #7a1f2b;">View stay request</a></p>
    """,
    )
    send_email(
        to=to,
        subject=f"Stay request received — {stay_title}",
        html=html,
    )


def send_homestay_booking_confirmed_email(
    *,
    to: str,
    guest_name: str,
    stay_title: str,
    check_in: str,
    check_out: str,
    nights: int,
    total_minor: int,
    currency_code: str,
    booking_id: str,
) -> None:
    amount = _format_amount(total_minor, currency_code)
    html = _wrap_html(
        "Stay confirmed",
        f"""
    <p style="line-height: 1.6;">Dear {guest_name or "Guest"},</p>
    <p style="line-height: 1.6;">Your stay at <strong>{stay_title}</strong> is confirmed.</p>
    <ul style="line-height: 1.8; padding-left: 20px;">
      <li>Check-in: {_format_date(check_in)}</li>
      <li>Check-out: {_format_date(check_out)}</li>
      <li>Nights: {nights}</li>
      <li>Total due at check-in: {amount}</li>
    </ul>
    <p style="line-height: 1.6;">Please pay your host in cash or UPI at check-in.</p>
    <p style="line-height: 1.6;"><a href="{_site_link(f"/stays/{booking_id}")}" style="color: #7a1f2b;">View stay details</a></p>
    """,
    )
    send_email(
        to=to,
        subject=f"Stay confirmed — {stay_title}",
        html=html,
    )


def send_host_new_experience_booking_email(
    *,
    to: str,
    host_name: str,
    guest_name: str,
    experience_title: str,
    slot_date: str,
    slot_start: str,
    slot_end: str,
    guest_count: int,
    total_minor: int,
    currency_code: str,
    booking_id: str,
) -> bool:
    amount = _format_amount(total_minor, currency_code)
    html = _wrap_html(
        "New booking request",
        f"""
    <p style="line-height: 1.6;">Dear {host_name},</p>
    <p style="line-height: 1.6;"><strong>{guest_name}</strong> requested a booking for <strong>{experience_title}</strong>.</p>
    <ul style="line-height: 1.8; padding-left: 20px;">
      <li>Date: {_format_date(slot_date)}</li>
      <li>Time: {_format_time(slot_start)} – {_format_time(slot_end)}</li>
      <li>Guests: {guest_count}</li>
      <li>Total: {amount} (pay at venue)</li>
    </ul>
    <p style="line-height: 1.6;">Please <strong>confirm or reject</strong> this request in your host dashboard.</p>
    <p style="line-height: 1.6;"><a href="{_site_link("/host/bookings")}" style="color: #7a1f2b;">Review booking request</a></p>
    """,
    )
    return send_email(
        to=to,
        subject=f"Action required: new booking — {experience_title}",
        html=html,
    )


def send_host_experience_booking_reminder_email(
    *,
    to: str,
    host_name: str,
    guest_name: str,
    experience_title: str,
    slot_date: str,
    slot_start: str,
    slot_end: str,
    guest_count: int,
    total_minor: int,
    currency_code: str,
    booking_id: str,
    waiting_for: str,
) -> bool:
    amount = _format_amount(total_minor, currency_code)
    urgency = "Urgent reminder" if waiting_for == "24 hours" else "Reminder"
    html = _wrap_html(
        urgency,
        f"""
    <p style="line-height: 1.6;">Dear {host_name},</p>
    <p style="line-height: 1.6;">{guest_name} is still waiting for your response on <strong>{experience_title}</strong> (pending for {waiting_for}).</p>
    <ul style="line-height: 1.8; padding-left: 20px;">
      <li>Date: {_format_date(slot_date)}</li>
      <li>Time: {_format_time(slot_start)} – {_format_time(slot_end)}</li>
      <li>Guests: {guest_count}</li>
      <li>Total: {amount}</li>
    </ul>
    <p style="line-height: 1.6;">Please confirm or reject this booking so the guest knows what to expect.</p>
    <p style="line-height: 1.6;"><a href="{_site_link(f"/host/bookings/{booking_id}")}" style="color: #7a1f2b;">Respond now</a></p>
    """,
    )
    return send_email(
        to=to,
        subject=f"{urgency}: booking still pending ({waiting_for}) — {experience_title}",
        html=html,
    )


def send_host_new_homestay_booking_email(
    *,
    to: str,
    host_name: str,
    guest_name: str,
    stay_title: str,
    check_in: str,
    check_out: str,
    nights: int,
    guest_count: int,
    total_minor: int,
    currency_code: str,
    booking_id: str,
) -> bool:
    amount = _format_amount(total_minor, currency_code)
    html = _wrap_html(
        "New stay request",
        f"""
    <p style="line-height: 1.6;">Dear {host_name},</p>
    <p style="line-height: 1.6;"><strong>{guest_name}</strong> requested a stay at <strong>{stay_title}</strong>.</p>
    <ul style="line-height: 1.8; padding-left: 20px;">
      <li>Check-in: {_format_date(check_in)}</li>
      <li>Check-out: {_format_date(check_out)}</li>
      <li>Nights: {nights}</li>
      <li>Guests: {guest_count}</li>
      <li>Total: {amount}</li>
    </ul>
    <p style="line-height: 1.6;">Please <strong>confirm or reject</strong> this request in your dashboard.</p>
    <p style="line-height: 1.6;"><a href="{_site_link("/homestay/dashboard")}" style="color: #7a1f2b;">Review stay request</a></p>
    """,
    )
    return send_email(
        to=to,
        subject=f"Action required: new stay request — {stay_title}",
        html=html,
    )


def send_host_homestay_booking_reminder_email(
    *,
    to: str,
    host_name: str,
    guest_name: str,
    stay_title: str,
    check_in: str,
    check_out: str,
    nights: int,
    guest_count: int,
    total_minor: int,
    currency_code: str,
    booking_id: str,
    waiting_for: str,
) -> bool:
    amount = _format_amount(total_minor, currency_code)
    urgency = "Urgent reminder" if waiting_for == "24 hours" else "Reminder"
    html = _wrap_html(
        urgency,
        f"""
    <p style="line-height: 1.6;">Dear {host_name},</p>
    <p style="line-height: 1.6;">{guest_name} is still waiting for your response on <strong>{stay_title}</strong> (pending for {waiting_for}).</p>
    <ul style="line-height: 1.8; padding-left: 20px;">
      <li>Check-in: {_format_date(check_in)}</li>
      <li>Check-out: {_format_date(check_out)}</li>
      <li>Nights: {nights}</li>
      <li>Guests: {guest_count}</li>
      <li>Total: {amount}</li>
    </ul>
    <p style="line-height: 1.6;">Please confirm or reject this stay request.</p>
    <p style="line-height: 1.6;"><a href="{_site_link("/homestay/dashboard")}" style="color: #7a1f2b;">Respond now</a></p>
    """,
    )
    return send_email(
        to=to,
        subject=f"{urgency}: stay request still pending ({waiting_for}) — {stay_title}",
        html=html,
    )
