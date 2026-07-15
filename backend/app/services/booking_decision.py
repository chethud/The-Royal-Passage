"""Shared validation for host/owner accept & reject decision contact."""

from __future__ import annotations

import re

_NAME_RE = re.compile(r"^[A-Za-z]+(?: [A-Za-z]+)*$")


def _normalize_ten_digit_phone(phone: str) -> str:
    digits = re.sub(r"\D", "", phone)
    if digits.startswith("91") and len(digits) == 12:
        digits = digits[2:]
    if len(digits) != 10:
        raise ValueError("Mobile number must be exactly 10 digits.")
    return digits


def normalize_decision_contact(
    *,
    decision_name: str | None,
    decision_phone: str | None,
    rejection_reason: str | None = None,
    require_reason: bool = False,
) -> tuple[str, str, str | None]:
    name = re.sub(r"\s+", " ", (decision_name or "").strip())
    phone_raw = (decision_phone or "").strip()
    reason = (rejection_reason or "").strip() or None

    if len(name) < 2:
        raise ValueError("Please enter your full name.")
    if len(name) > 120:
        raise ValueError("Name must be 120 characters or fewer.")
    if not _NAME_RE.fullmatch(name):
        raise ValueError("Name may only contain alphabetic letters and spaces.")

    phone = _normalize_ten_digit_phone(phone_raw)

    if require_reason:
        if not reason:
            raise ValueError("Rejection reason is required.")
        if len(reason) > 500:
            raise ValueError("Rejection reason must be 500 characters or fewer.")

    return name, f"+91{phone}", reason
