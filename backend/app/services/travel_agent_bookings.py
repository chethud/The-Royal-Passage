"""Travel agent booking lists — experiences and homestays placed on behalf of clients."""

from __future__ import annotations

from datetime import date

from app.dependencies.supabase import get_supabase_admin
from app.models.schemas import AdminTravelAgentBookingSummary, TravelAgentBookingSummary
from app.services.bookings import BOOKING_SELECT, _map_booking_row
from app.services.owner_homestays import _currency_symbol

EXPERIENCE_AGENT_SELECT = BOOKING_SELECT

ADMIN_EXPERIENCE_AGENT_SELECT = """
    *,
    travel_agents ( company_name, contact_name, email ),
    experience_slots ( id, slot_date, start_time, end_time ),
    experiences (
      id, slug, title, city, address, hero_image_url, host_id,
      hosts ( display_name )
    )
"""

HOMESTAY_AGENT_SELECT = """
*,
homestays ( id, slug, title ),
homestay_rooms ( name ),
profiles ( full_name, phone )
"""

ADMIN_HOMESTAY_AGENT_SELECT = """
*,
homestays ( id, slug, title ),
homestay_rooms ( name ),
profiles ( full_name, phone ),
travel_agents ( company_name, contact_name, email )
"""

_BOOKING_STATUSES = frozenset(
    {"pending", "confirmed", "completed", "cancelled", "upcoming", "today"},
)


def _resolve_travel_agent_id(auth: dict) -> str:
    profile = auth["profile"]
    agent_id = profile.get("travel_agent_id")
    if agent_id:
        return str(agent_id)

    supabase = get_supabase_admin()
    result = (
        supabase.table("travel_agents")
        .select("id")
        .eq("auth_user_id", auth["user"].id)
        .maybe_single()
        .execute()
    )
    row = result.data if result else None
    if not row or not row.get("id"):
        raise ValueError("Travel agent profile not linked to this account.")
    return str(row["id"])


def _apply_status_filter_experience(query, status_filter: str | None):
    if status_filter == "pending":
        return query.eq("booking_status", "pending")
    if status_filter == "confirmed":
        return query.eq("booking_status", "confirmed")
    if status_filter == "completed":
        return query.eq("booking_status", "completed")
    if status_filter == "cancelled":
        return query.eq("booking_status", "cancelled")
    if status_filter in ("upcoming", "today"):
        return query.in_("booking_status", ["pending", "confirmed"])
    return query


def _apply_status_filter_homestay(query, status_filter: str | None):
    today = date.today().isoformat()
    if status_filter == "pending":
        return query.eq("booking_status", "pending")
    if status_filter == "confirmed":
        return query.eq("booking_status", "confirmed")
    if status_filter == "completed":
        return query.eq("booking_status", "completed")
    if status_filter == "cancelled":
        return query.eq("booking_status", "cancelled")
    if status_filter == "upcoming":
        return query.in_("booking_status", ["pending", "confirmed"]).gte("check_out", today)
    if status_filter == "today":
        return query.in_("booking_status", ["pending", "confirmed"]).eq("check_in", today)
    return query


def _map_experience_agent_booking(row: dict) -> TravelAgentBookingSummary:
    summary = _map_booking_row(row)
    return TravelAgentBookingSummary(
        id=summary.id,
        kind="experience",
        title=summary.experience.title,
        slug=summary.experience.slug or None,
        clientName=summary.guestName,
        clientEmail=summary.guestEmail,
        clientPhone=summary.guestPhone,
        bookingStatus=summary.bookingStatus,
        paymentStatus=summary.paymentStatus,
        totalAmount=summary.totalAmount,
        agentMarkupMinor=int(row.get("agent_markup_minor") or 0),
        currencyCode=summary.currencyCode,
        currencySymbol=summary.currencySymbol,
        createdAt=summary.createdAt,
        slotDate=str(summary.slot.date)[:10] if summary.slot.date else None,
        slotStart=summary.slot.start,
        slotEnd=summary.slot.end,
        guestCount=summary.participantCount,
    )


def _map_homestay_agent_booking(row: dict) -> TravelAgentBookingSummary:
    stay = row.get("homestays") or {}
    guest = row.get("profiles") or {}
    currency = row.get("currency_code") or "INR"
    client_name = (row.get("guest_name") or guest.get("full_name") or "").strip() or None
    client_email = (row.get("guest_email") or "").strip() or None
    client_phone = (row.get("guest_phone") or guest.get("phone") or "").strip() or None

    return TravelAgentBookingSummary(
        id=str(row["id"]),
        kind="homestay",
        title=str(stay.get("title") or "Homestay"),
        slug=stay.get("slug") or None,
        clientName=client_name,
        clientEmail=client_email,
        clientPhone=client_phone,
        bookingStatus=str(row.get("booking_status") or "pending"),
        paymentStatus=str(row.get("payment_status") or "pending"),
        totalAmount=int(row.get("total_amount") or row.get("subtotal_minor") or 0),
        agentMarkupMinor=int(row.get("agent_markup_minor") or 0),
        currencyCode=currency,
        currencySymbol=_currency_symbol(currency),
        createdAt=str(row.get("created_at") or ""),
        checkIn=str(row.get("check_in") or "")[:10] or None,
        checkOut=str(row.get("check_out") or "")[:10] or None,
        nights=int(row.get("nights") or 0) or None,
        guestCount=int(row.get("guest_count") or 1),
    )


def _map_admin_homestay_agent_booking(row: dict) -> AdminTravelAgentBookingSummary:
    base = _map_homestay_agent_booking(row)
    agent = row.get("travel_agents") or {}
    return AdminTravelAgentBookingSummary(
        **base.model_dump(),
        agentCompanyName=agent.get("company_name"),
        agentContactName=agent.get("contact_name"),
        agentEmail=agent.get("email"),
        agentDiscountPercent=(
            float(row["agent_discount_percent"])
            if row.get("agent_discount_percent") is not None
            else None
        ),
    )


def _map_admin_experience_agent_booking(row: dict) -> AdminTravelAgentBookingSummary:
    base = _map_experience_agent_booking(row)
    agent = row.get("travel_agents") or {}
    return AdminTravelAgentBookingSummary(
        **base.model_dump(),
        agentCompanyName=agent.get("company_name"),
        agentContactName=agent.get("contact_name"),
        agentEmail=agent.get("email"),
        agentDiscountPercent=(
            float(row["agent_discount_percent"])
            if row.get("agent_discount_percent") is not None
            else None
        ),
    )


def _filter_experience_today(rows: list[dict]) -> list[dict]:
    today = date.today()
    filtered: list[dict] = []
    for row in rows:
        slot = row.get("experience_slots") or {}
        raw = slot.get("slot_date")
        if not raw:
            continue
        slot_day = date.fromisoformat(str(raw)[:10])
        if slot_day == today:
            filtered.append(row)
    return filtered


def list_travel_agent_bookings(
    auth: dict,
    status_filter: str | None = None,
) -> list[TravelAgentBookingSummary]:
    if status_filter and status_filter not in _BOOKING_STATUSES:
        raise ValueError("Invalid booking status filter.")

    supabase = get_supabase_admin()
    agent_id = _resolve_travel_agent_id(auth)

    exp_query = (
        supabase.table("bookings")
        .select(EXPERIENCE_AGENT_SELECT)
        .eq("travel_agent_id", agent_id)
        .order("created_at", desc=True)
    )
    exp_query = _apply_status_filter_experience(exp_query, status_filter)

    stay_query = (
        supabase.table("homestay_bookings")
        .select(HOMESTAY_AGENT_SELECT)
        .eq("travel_agent_id", agent_id)
        .order("created_at", desc=True)
    )
    stay_query = _apply_status_filter_homestay(stay_query, status_filter)

    try:
        exp_result = exp_query.execute()
        stay_result = stay_query.execute()
    except Exception:
        return []

    exp_rows = exp_result.data or []
    if status_filter == "today":
        exp_rows = _filter_experience_today(exp_rows)

    summaries = [_map_experience_agent_booking(row) for row in exp_rows]
    summaries.extend(_map_homestay_agent_booking(row) for row in (stay_result.data or []))
    summaries.sort(key=lambda row: row.createdAt, reverse=True)
    return summaries


def list_admin_travel_agent_bookings(
    *,
    statuses: list[str] | None = None,
    limit: int = 100,
) -> list[AdminTravelAgentBookingSummary]:
    capped = max(1, min(int(limit or 100), 500))
    supabase = get_supabase_admin()

    exp_query = (
        supabase.table("bookings")
        .select(ADMIN_EXPERIENCE_AGENT_SELECT)
        .not_.is_("travel_agent_id", "null")
        .order("created_at", desc=True)
        .limit(capped)
    )
    if statuses:
        exp_query = exp_query.in_("booking_status", statuses)

    stay_query = (
        supabase.table("homestay_bookings")
        .select(ADMIN_HOMESTAY_AGENT_SELECT)
        .not_.is_("travel_agent_id", "null")
        .order("created_at", desc=True)
        .limit(capped)
    )
    if statuses:
        stay_query = stay_query.in_("booking_status", statuses)

    try:
        exp_result = exp_query.execute()
        stay_result = stay_query.execute()
    except Exception:
        return []

    rows: list[AdminTravelAgentBookingSummary] = [
        _map_admin_experience_agent_booking(row) for row in (exp_result.data or [])
    ]
    rows.extend(_map_admin_homestay_agent_booking(row) for row in (stay_result.data or []))
    rows.sort(key=lambda row: row.createdAt, reverse=True)
    return rows[:capped]
