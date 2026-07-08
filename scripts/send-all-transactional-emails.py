"""
Send every transactional email template once (preview / QA).

Usage:
  cd backend && python ../scripts/send-all-transactional-emails.py chethannd05@gmail.com
  npm run email:preview-all -- chethannd05@gmail.com
"""

from __future__ import annotations

import sys
import time
from pathlib import Path

BACKEND = Path(__file__).resolve().parents[1] / "backend"
sys.path.insert(0, str(BACKEND))

from app.services.transactional_emails import (  # noqa: E402
    send_experience_booking_confirmed_email,
    send_experience_booking_requested_email,
    send_homestay_booking_confirmed_email,
    send_homestay_booking_requested_email,
    send_host_experience_booking_reminder_email,
    send_host_homestay_booking_reminder_email,
    send_host_new_experience_booking_email,
    send_host_new_homestay_booking_email,
)
from app.services.email import email_configured, send_email  # noqa: E402
from app.services.transactional_emails import _wrap_html, _site_link  # noqa: E402


def _welcome_preview(to: str, name: str = "Chethan") -> bool:
    html = _wrap_html(
        "Welcome",
        f"""
    <p style="line-height: 1.6;">Dear {name},</p>
    <p style="line-height: 1.6;">Your account is ready. Discover curated experiences, homestays, and royal journeys across Mysuru.</p>
    <p style="line-height: 1.6;"><a href="{_site_link("/")}" style="color: #7a1f2b;">Explore experiences</a></p>
    """,
    )
    return send_email(to=to, subject="[Preview] Welcome to The Royal Passage", html=html)


def main() -> None:
    to = (sys.argv[1] if len(sys.argv) > 1 else "chethannd05@gmail.com").strip()
    if not email_configured():
        print("RESEND_API_KEY and RESEND_FROM_EMAIL must be set in backend/.env")
        sys.exit(1)

    print(f"Sending all transactional email previews to {to}...\n")

    steps: list[tuple[str, callable]] = [
        ("Welcome (registration)", lambda: _welcome_preview(to)),
        (
            "Guest — experience booking requested",
            lambda: send_experience_booking_requested_email(
                to=to,
                guest_name="Chethan",
                experience_title="Royal Mysuru Heritage Walk",
                slot_date="2026-07-15",
                slot_start="10:00",
                slot_end="12:30",
                guest_count=2,
                total_minor=450000,
                currency_code="INR",
                booking_id="00000000-0000-4000-8000-000000000001",
            ),
        ),
        (
            "Guest — experience booking confirmed",
            lambda: send_experience_booking_confirmed_email(
                to=to,
                guest_name="Chethan",
                experience_title="Royal Mysuru Heritage Walk",
                slot_date="2026-07-15",
                slot_start="10:00",
                slot_end="12:30",
                guest_count=2,
                total_minor=450000,
                currency_code="INR",
                booking_id="00000000-0000-4000-8000-000000000001",
            ),
        ),
        (
            "Guest — homestay booking requested",
            lambda: send_homestay_booking_requested_email(
                to=to,
                guest_name="Chethan",
                stay_title="Chamundi Hill Heritage Villa",
                check_in="2026-07-20",
                check_out="2026-07-23",
                nights=3,
                total_minor=2850000,
                currency_code="INR",
                booking_id="00000000-0000-4000-8000-000000000002",
            ),
        ),
        (
            "Guest — homestay booking confirmed",
            lambda: send_homestay_booking_confirmed_email(
                to=to,
                guest_name="Chethan",
                stay_title="Chamundi Hill Heritage Villa",
                check_in="2026-07-20",
                check_out="2026-07-23",
                nights=3,
                total_minor=2850000,
                currency_code="INR",
                booking_id="00000000-0000-4000-8000-000000000002",
            ),
        ),
        (
            "Host — new experience booking",
            lambda: send_host_new_experience_booking_email(
                to=to,
                host_name="Host",
                guest_name="Chethan",
                experience_title="Royal Mysuru Heritage Walk",
                slot_date="2026-07-15",
                slot_start="10:00",
                slot_end="12:30",
                guest_count=2,
                total_minor=450000,
                currency_code="INR",
                booking_id="00000000-0000-4000-8000-000000000001",
            ),
        ),
        (
            "Host — experience reminder (15 min)",
            lambda: send_host_experience_booking_reminder_email(
                to=to,
                host_name="Host",
                guest_name="Chethan",
                experience_title="Royal Mysuru Heritage Walk",
                slot_date="2026-07-15",
                slot_start="10:00",
                slot_end="12:30",
                guest_count=2,
                total_minor=450000,
                currency_code="INR",
                booking_id="00000000-0000-4000-8000-000000000001",
                waiting_for="15 minutes",
            ),
        ),
        (
            "Host — experience reminder (2 hours)",
            lambda: send_host_experience_booking_reminder_email(
                to=to,
                host_name="Host",
                guest_name="Chethan",
                experience_title="Royal Mysuru Heritage Walk",
                slot_date="2026-07-15",
                slot_start="10:00",
                slot_end="12:30",
                guest_count=2,
                total_minor=450000,
                currency_code="INR",
                booking_id="00000000-0000-4000-8000-000000000001",
                waiting_for="2 hours",
            ),
        ),
        (
            "Host — experience reminder (24 hours)",
            lambda: send_host_experience_booking_reminder_email(
                to=to,
                host_name="Host",
                guest_name="Chethan",
                experience_title="Royal Mysuru Heritage Walk",
                slot_date="2026-07-15",
                slot_start="10:00",
                slot_end="12:30",
                guest_count=2,
                total_minor=450000,
                currency_code="INR",
                booking_id="00000000-0000-4000-8000-000000000001",
                waiting_for="24 hours",
            ),
        ),
        (
            "Host — new homestay booking",
            lambda: send_host_new_homestay_booking_email(
                to=to,
                host_name="Host",
                guest_name="Chethan",
                stay_title="Chamundi Hill Heritage Villa",
                check_in="2026-07-20",
                check_out="2026-07-23",
                nights=3,
                guest_count=2,
                total_minor=2850000,
                currency_code="INR",
                booking_id="00000000-0000-4000-8000-000000000002",
            ),
        ),
        (
            "Host — homestay reminder (15 min)",
            lambda: send_host_homestay_booking_reminder_email(
                to=to,
                host_name="Host",
                guest_name="Chethan",
                stay_title="Chamundi Hill Heritage Villa",
                check_in="2026-07-20",
                check_out="2026-07-23",
                nights=3,
                guest_count=2,
                total_minor=2850000,
                currency_code="INR",
                booking_id="00000000-0000-4000-8000-000000000002",
                waiting_for="15 minutes",
            ),
        ),
        (
            "Host — homestay reminder (2 hours)",
            lambda: send_host_homestay_booking_reminder_email(
                to=to,
                host_name="Host",
                guest_name="Chethan",
                stay_title="Chamundi Hill Heritage Villa",
                check_in="2026-07-20",
                check_out="2026-07-23",
                nights=3,
                guest_count=2,
                total_minor=2850000,
                currency_code="INR",
                booking_id="00000000-0000-4000-8000-000000000002",
                waiting_for="2 hours",
            ),
        ),
        (
            "Host — homestay reminder (24 hours)",
            lambda: send_host_homestay_booking_reminder_email(
                to=to,
                host_name="Host",
                guest_name="Chethan",
                stay_title="Chamundi Hill Heritage Villa",
                check_in="2026-07-20",
                check_out="2026-07-23",
                nights=3,
                guest_count=2,
                total_minor=2850000,
                currency_code="INR",
                booking_id="00000000-0000-4000-8000-000000000002",
                waiting_for="24 hours",
            ),
        ),
    ]

    sent = 0
    failed = 0
    for label, fn in steps:
        try:
            ok = fn()
            if ok is False:
                print(f"  skip: {label} (send returned false)")
                failed += 1
            else:
                print(f"  sent: {label}")
                sent += 1
            time.sleep(0.6)
        except Exception as exc:
            print(f"  FAIL: {label} — {exc}")
            failed += 1

    print(f"\nDone. {sent} sent, {failed} failed/skipped. Check inbox and spam at {to}")


if __name__ == "__main__":
    main()
