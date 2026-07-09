from __future__ import annotations

import logging
from datetime import date, datetime
from html import escape as esc

from app.config import settings
from app.dependencies.supabase import get_supabase_admin
from app.services.email import send_email
from app.services.royal_email_templates import (
    EMAIL_GOLD_BRIGHT,
    EMAIL_INK,
    EMAIL_INK_MUTED,
    RoyalBookingRequestContext,
    RoyalHostAlertContext,
    format_duration_label,
    render_royal_booking_request_email,
    render_royal_host_alert_email,
    render_royal_transactional_email,
    royal_centered_message,
    royal_link,
    royal_list,
    royal_luxury_recipient_message,
    royal_paragraph,
)

logger = logging.getLogger(__name__)


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


def _wrap_html(title: str, body_html: str, *, cta_label: str | None = None, cta_url: str | None = None) -> str:
    return render_royal_transactional_email(
        title=title,
        body_html=body_html,
        cta_label=cta_label,
        cta_url=cta_url,
        preheader=title,
    )


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
        royal_paragraph(f'Dear <span style="color: #f7f1e8; font-style: italic;">{esc(name)}</span>,')
        + royal_paragraph(
            "Your account is ready. Discover curated experiences, homestays, and royal journeys across Mysuru."
        )
        + royal_paragraph(royal_link(_site_link("/"), "Explore experiences")),
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
    experience_description: str = "",
    experience_image_url: str = "",
    venue: str = "",
    map_link: str = "",
    host_name: str = "",
    duration_minutes: int | None = None,
) -> bool:
    amount = _format_amount(total_minor, currency_code)
    ctx = RoyalBookingRequestContext(
        guest_name=guest_name or "Guest",
        experience_name=experience_title,
        booking_id=booking_id,
        booking_date=_format_date(slot_date),
        booking_time=_format_time(slot_start),
        booking_time_end=_format_time(slot_end),
        guests=guest_count,
        venue=venue or experience_title,
        price=amount,
        payment_method="Pay at Venue",
        host_name=host_name or "",
        duration_label=format_duration_label(duration_minutes),
        experience_description=experience_description or "",
        experience_image_url=experience_image_url or "",
    )
    html = render_royal_booking_request_email(ctx)
    return send_email(
        to=to,
        subject=f"Booking Request Received — {experience_title}",
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
) -> bool:
    amount = _format_amount(total_minor, currency_code)
    booking_path = _site_link(f"/bookings/{booking_id}")
    html = _wrap_html(
        "Booking Confirmed",
        royal_paragraph(f'Dear <span style="color: #f7f1e8; font-style: italic;">{esc(guest_name or "Guest")}</span>,')
        + royal_paragraph(f'Great news — your host confirmed <strong style="color: #d4af6a;">{esc(experience_title)}</strong>.')
        + royal_list(
            [
                f"Date: {_format_date(slot_date)}",
                f"Time: {_format_time(slot_start)} – {_format_time(slot_end)}",
                f"Guests: {guest_count}",
                f"Total due at venue: {amount}",
            ]
        )
        + royal_paragraph("Please pay your host in cash or UPI when you arrive."),
        cta_label="View Booking Details",
        cta_url=booking_path,
    )
    return send_email(
        to=to,
        subject=f"Booking Confirmed — {experience_title}",
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
) -> bool:
    amount = _format_amount(total_minor, currency_code)
    stay_path = _site_link(f"/stays/{booking_id}")
    html = _wrap_html(
        "Stay Request Received",
        royal_paragraph(f'Dear <span style="color: #f7f1e8; font-style: italic;">{guest_name or "Guest"}</span>,')
        + royal_paragraph(f'We received your stay request for <strong style="color: #d4af6a;">{stay_title}</strong>.')
        + royal_list(
            [
                f"Check-in: {_format_date(check_in)}",
                f"Check-out: {_format_date(check_out)}",
                f"Nights: {nights}",
                f"Estimated total: {amount} (pay at check-in once confirmed)",
            ]
        )
        + royal_paragraph("Your host will confirm shortly."),
        cta_label="View Stay Request",
        cta_url=stay_path,
    )
    return send_email(
        to=to,
        subject=f"Stay Request Received — {stay_title}",
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
) -> bool:
    amount = _format_amount(total_minor, currency_code)
    stay_path = _site_link(f"/stays/{booking_id}")
    html = _wrap_html(
        "Stay Confirmed",
        royal_paragraph(f'Dear <span style="color: #f7f1e8; font-style: italic;">{guest_name or "Guest"}</span>,')
        + royal_paragraph(f'Your stay at <strong style="color: #d4af6a;">{stay_title}</strong> is confirmed.')
        + royal_list(
            [
                f"Check-in: {_format_date(check_in)}",
                f"Check-out: {_format_date(check_out)}",
                f"Nights: {nights}",
                f"Total due at check-in: {amount}",
            ]
        )
        + royal_paragraph("Please pay your host in cash or UPI at check-in."),
        cta_label="View Stay Details",
        cta_url=stay_path,
    )
    return send_email(
        to=to,
        subject=f"Stay Confirmed — {stay_title}",
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
    time_range = _format_time(slot_start)
    if slot_end:
        time_range = f"{_format_time(slot_start)} – {_format_time(slot_end)}"
    html = render_royal_host_alert_email(
        RoyalHostAlertContext(
            host_name=host_name,
            headline="New Booking",
            headline_accent="Request",
            badge="Action Required",
            preheader=f"New booking request — {experience_title}",
            message_html=royal_luxury_recipient_message(
                host_name,
                lead_html=(
                    f'thank you for hosting with <strong style="font-weight: 600; color: {EMAIL_GOLD_BRIGHT};">The Royal Passage</strong>.<br/>'
                    f'<span style="font-size: 16px; color: {EMAIL_INK_MUTED};">'
                    f'<strong style="color: {EMAIL_INK};">{esc(guest_name)}</strong> requested '
                    f'<strong style="color: {EMAIL_GOLD_BRIGHT};">{esc(experience_title)}</strong>. '
                    f"Please confirm or reject in your host dashboard."
                    f"</span>"
                ),
            ),
            booking_id=booking_id,
            hero_label="Requested Experience",
            hero_name=experience_title,
            detail_rows=[
                ("Date", _format_date(slot_date)),
                ("Time", time_range),
                ("Guests", str(guest_count)),
            ],
            payment_method="Pay at Venue",
            highlight_label="Total",
            highlight_value=amount,
            closing_note="A prompt response helps guests plan their royal journey.",
            cta_label="Review Booking Request",
            cta_url=_site_link("/host/bookings"),
        )
    )
    return send_email(
        to=to,
        subject=f"Action Required: New Booking — {experience_title}",
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
    urgency = "Urgent Reminder" if waiting_for == "24 hours" else "Reminder"
    time_range = _format_time(slot_start)
    if slot_end:
        time_range = f"{_format_time(slot_start)} – {_format_time(slot_end)}"
    html = render_royal_host_alert_email(
        RoyalHostAlertContext(
            host_name=host_name,
            headline=urgency,
            badge="Response Needed",
            preheader=f"{urgency}: booking pending for {waiting_for} — {experience_title}",
            message_html=royal_luxury_recipient_message(
                host_name,
                lead_html=(
                    f'<span style="font-size: 16px; color: {EMAIL_INK_MUTED};">'
                    f"{esc(guest_name)} is still waiting for your response on "
                    f'<strong style="color: {EMAIL_GOLD_BRIGHT};">{esc(experience_title)}</strong> '
                    f"(pending for {esc(waiting_for)})."
                    f"</span>"
                ),
            ),
            booking_id=booking_id,
            hero_label="Requested Experience",
            hero_name=experience_title,
            detail_rows=[
                ("Date", _format_date(slot_date)),
                ("Time", time_range),
                ("Guests", str(guest_count)),
            ],
            payment_method="Pay at Venue",
            highlight_label="Total",
            highlight_value=amount,
            closing_note="Please confirm or reject so the guest knows what to expect.",
            cta_label="Respond Now",
            cta_url=_site_link(f"/host/bookings/{booking_id}"),
        )
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
    return send_homestay_owner_new_booking_email(
        to=to,
        owner_name=host_name,
        guest_name=guest_name,
        stay_title=stay_title,
        check_in=check_in,
        check_out=check_out,
        nights=nights,
        guest_count=guest_count,
        total_minor=total_minor,
        currency_code=currency_code,
        booking_id=booking_id,
    )


def send_homestay_owner_new_booking_email(
    *,
    to: str,
    owner_name: str,
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
    html = render_royal_host_alert_email(
        RoyalHostAlertContext(
            host_name=owner_name,
            headline="New Stay",
            headline_accent="Request",
            badge="Action Required",
            preheader=f"New stay request — {stay_title}",
            message_html=royal_luxury_recipient_message(
                owner_name,
                lead_html=(
                    f'thank you for hosting with <strong style="font-weight: 600; color: {EMAIL_GOLD_BRIGHT};">The Royal Passage</strong>.<br/>'
                    f'<span style="font-size: 16px; color: {EMAIL_INK_MUTED};">'
                    f'<strong style="color: {EMAIL_INK};">{esc(guest_name)}</strong> requested a stay at '
                    f'<strong style="color: {EMAIL_GOLD_BRIGHT};">{esc(stay_title)}</strong>. '
                    f"Please confirm or reject in your property owner dashboard."
                    f"</span>"
                ),
            ),
            booking_id=booking_id,
            hero_label="Requested Property",
            hero_name=stay_title,
            detail_rows=[
                ("Check-in", _format_date(check_in)),
                ("Check-out", _format_date(check_out)),
                ("Nights", str(nights)),
                ("Guests", str(guest_count)),
            ],
            payment_method="Pay at check-in",
            highlight_label="Total",
            highlight_value=amount,
            closing_note="A prompt response helps guests plan their stay.",
            cta_label="Review Stay Request",
            cta_url=_site_link("/homestay/bookings"),
        )
    )
    return send_email(
        to=to,
        subject=f"Action Required: New Stay Request — {stay_title}",
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
    return send_homestay_owner_booking_reminder_email(
        to=to,
        owner_name=host_name,
        guest_name=guest_name,
        stay_title=stay_title,
        check_in=check_in,
        check_out=check_out,
        nights=nights,
        guest_count=guest_count,
        total_minor=total_minor,
        currency_code=currency_code,
        booking_id=booking_id,
        waiting_for=waiting_for,
    )


def send_homestay_owner_booking_reminder_email(
    *,
    to: str,
    owner_name: str,
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
    urgency = "Urgent Reminder" if waiting_for == "24 hours" else "Reminder"
    html = render_royal_host_alert_email(
        RoyalHostAlertContext(
            host_name=owner_name,
            headline=urgency,
            badge="Response Needed",
            preheader=f"{urgency}: stay request pending for {waiting_for} — {stay_title}",
            message_html=royal_luxury_recipient_message(
                owner_name,
                lead_html=(
                    f'<span style="font-size: 16px; color: {EMAIL_INK_MUTED};">'
                    f"{esc(guest_name)} is still waiting for your response on "
                    f'<strong style="color: {EMAIL_GOLD_BRIGHT};">{esc(stay_title)}</strong> '
                    f"(pending for {esc(waiting_for)})."
                    f"</span>"
                ),
            ),
            booking_id=booking_id,
            hero_label="Requested Property",
            hero_name=stay_title,
            detail_rows=[
                ("Check-in", _format_date(check_in)),
                ("Check-out", _format_date(check_out)),
                ("Nights", str(nights)),
                ("Guests", str(guest_count)),
            ],
            payment_method="Pay at check-in",
            highlight_label="Total",
            highlight_value=amount,
            closing_note="Please confirm or reject this stay request.",
            cta_label="Respond Now",
            cta_url=_site_link("/homestay/bookings"),
        )
    )
    return send_email(
        to=to,
        subject=f"{urgency}: stay request still pending ({waiting_for}) — {stay_title}",
        html=html,
    )


def send_homestay_owner_welcome_email(*, to: str, owner_name: str) -> bool:
    html = render_royal_host_alert_email(
        RoyalHostAlertContext(
            host_name=owner_name,
            headline="Welcome",
            headline_accent="Property Owner",
            badge="Account Ready",
            preheader="Your Royal Passage property owner account is ready",
            message_html=royal_luxury_recipient_message(
                owner_name,
                lead_html=(
                    f'<span style="font-size: 16px; color: {EMAIL_INK_MUTED};">'
                    f"Your property owner account is ready. Add your homestay, manage bookings, "
                    f"and welcome guests to Mysuru."
                    f"</span>"
                ),
            ),
            hero_label="Welcome to",
            hero_name="The Royal Passage Homestays",
            closing_note="We are honoured to host your property on The Royal Passage.",
            cta_label="Open Property Dashboard",
            cta_url=_site_link("/homestay/dashboard"),
        )
    )
    return send_email(
        to=to,
        subject="Welcome — The Royal Passage Property Owner",
        html=html,
    )
