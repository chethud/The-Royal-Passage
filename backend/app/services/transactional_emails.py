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


def _logo_url() -> str:
    custom = (settings.email_logo_url or "").strip()
    if custom:
        return custom
    return f"{settings.site_url.rstrip('/')}/brand/logo.png"


def _email_header_html() -> str:
    logo = _logo_url()
    home = _site_link("/")
    return f"""
    <div style="text-align: center; margin: 0 0 22px; padding-bottom: 20px; border-bottom: 1px solid #e0d4c0;">
      <a href="{home}" style="text-decoration: none;">
        <img src="{logo}" alt="The Royal Passage" width="148" style="display: block; margin: 0 auto 10px; max-width: 168px; height: auto; border: 0;" />
      </a>
      <p style="margin: 0; font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; color: #9a7b4f;">Mysuru &middot; Curated royal journeys</p>
    </div>"""


def _wrap_html(title: str, body_html: str) -> str:
    header = _email_header_html()
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <title>{title}</title>
</head>
<body style="font-family: Georgia, 'Times New Roman', Times, serif; color: #3d2314; background-color: #ebe3d4; margin: 0; padding: 28px 14px;">
  <div style="max-width: 580px; margin: 0 auto; background: #fffdf8; border: 1px solid #d9c9ad; border-radius: 6px; overflow: hidden; box-shadow: 0 8px 32px rgba(60, 28, 20, 0.1);">
    <div style="height: 5px; background: linear-gradient(90deg, #4a0a14 0%, #b8860b 50%, #4a0a14 100%);"></div>
    <div style="padding: 28px 30px 26px;">
      {header}
      <h1 style="margin: 0 0 18px; font-size: 23px; font-weight: normal; line-height: 1.35; color: #5c1a24; text-align: center;">{title}</h1>
      <div style="font-size: 15px; line-height: 1.65; color: #3d2314;">
        {body_html}
      </div>
      <div style="margin-top: 28px; padding-top: 18px; border-top: 1px solid #e8dcc8; text-align: center;">
        <p style="margin: 0 0 4px; font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: #7a1f2b;">The Royal Passage</p>
        <p style="margin: 0; font-size: 12px; color: #8b7355;">Experiences, homestays &amp; royal journeys across India</p>
      </div>
    </div>
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
