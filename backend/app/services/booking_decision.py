"""Shared validation for host/owner accept & reject decision contact."""

from __future__ import annotations


def normalize_decision_contact(
    *,
    decision_name: str | None,
    decision_phone: str | None,
    rejection_reason: str | None = None,
    require_reason: bool = False,
) -> tuple[str, str, str | None]:
    name = (decision_name or "").strip()
    phone = (decision_phone or "").strip()
    reason = (rejection_reason or "").strip() or None

    if len(name) < 2:
        raise ValueError("Please enter your name (at least 2 characters).")
    if len(name) > 120:
        raise ValueError("Name must be 120 characters or fewer.")
    if len(phone) < 7:
        raise ValueError("Please enter a valid phone number.")
    if len(phone) > 40:
        raise ValueError("Phone number must be 40 characters or fewer.")

    if require_reason:
        if not reason or len(reason) < 3:
            raise ValueError("A rejection reason is required (at least 3 characters).")
        if len(reason) > 500:
            raise ValueError("Rejection reason must be 500 characters or fewer.")

    return name, phone, reason
