#!/usr/bin/env python3
"""Preview the royal booking invitation email in a browser.

Usage (from repo root):
  python scripts/preview-royal-booking-email.py
  python scripts/preview-royal-booking-email.py --open
"""

from __future__ import annotations

import argparse
import sys
import webbrowser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "backend"))

from app.services.royal_email_templates import (  # noqa: E402
    RoyalBookingRequestContext,
    render_royal_booking_request_email,
)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--open", action="store_true", help="Open preview in default browser")
    parser.add_argument("-o", "--output", default="royal-booking-email-preview.html")
    args = parser.parse_args()

    ctx = RoyalBookingRequestContext(
        guest_name="Maharaja Guest",
        experience_name="Royal Pottery & Palace Walk",
        booking_id="a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        booking_date="30 Jun 2026",
        booking_time="09:00",
        booking_time_end="12:00",
        guests=2,
        venue="Mysuru Palace District, Karnataka",
        price="₹4,800",
        payment_method="Pay at Venue",
    )
    html = render_royal_booking_request_email(ctx)
    out = Path(args.output)
    out.write_text(html, encoding="utf-8")
    print(f"Wrote {out.resolve()}")
    if args.open:
        webbrowser.open(out.resolve().as_uri())


if __name__ == "__main__":
    main()
