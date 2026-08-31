"""Shared guest contact validation before booking."""

from __future__ import annotations


def assert_guest_contact_ready(profile: dict, user) -> None:
    full_name = (profile.get("full_name") or "").strip()
    phone = (profile.get("phone") or "").strip()
    email = (getattr(user, "email", None) or "").strip()

    if not full_name:
        raise ValueError("Full name is required. Add your name before booking.")
    if not phone:
        raise ValueError("Phone number is required. Add your mobile number before booking.")
    if not email:
        raise ValueError("Email is required. Add your email before booking.")
