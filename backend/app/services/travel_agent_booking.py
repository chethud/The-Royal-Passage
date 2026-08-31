"""Travel agent booking helpers — pricing, validation, and profile resolution."""

from __future__ import annotations


def profile_is_travel_agent(profile: dict) -> bool:
    if profile.get("travel_agent_id"):
        return True
    role = profile.get("role")
    if role == "travel_agent":
        return True
    roles = profile.get("roles")
    return isinstance(roles, list) and "travel_agent" in roles


def load_travel_agent_row(supabase, profile: dict) -> dict | None:
    agent_id = profile.get("travel_agent_id")
    if not agent_id:
        return None
    result = (
        supabase.table("travel_agents")
        .select("id, email, discount_percent, approval_status")
        .eq("id", agent_id)
        .maybe_single()
        .execute()
    )
    row = result.data if result else None
    if not row or row.get("approval_status") not in (None, "approved"):
        return None
    return row


def assert_client_contact_ready(*, full_name: str | None, email: str | None, phone: str | None) -> None:
    name = (full_name or "").strip()
    mail = (email or "").strip()
    mobile = (phone or "").strip()
    if not name:
        raise ValueError("Customer full name is required.")
    if not mail:
        raise ValueError("Customer email is required.")
    if not mobile:
        raise ValueError("Customer phone number is required.")


def apply_agent_pricing(
    subtotal_minor: int,
    gst_percent: float,
    *,
    discount_percent: float,
    markup_minor: int,
) -> tuple[int, int, int]:
    discount = max(0.0, min(float(discount_percent or 0), 100.0))
    markup = max(0, int(markup_minor or 0))
    discounted_subtotal = round(subtotal_minor * (1 - discount / 100))
    gst_minor = round((discounted_subtotal * gst_percent) / 100) if gst_percent > 0 else 0
    total_minor = discounted_subtotal + gst_minor + markup
    return discounted_subtotal, gst_minor, total_minor
