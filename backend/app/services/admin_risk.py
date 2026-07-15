from __future__ import annotations

from collections import Counter, defaultdict
from datetime import datetime, timedelta, timezone
from hashlib import sha1

from app.dependencies.supabase import get_supabase_admin
from app.models.schemas import AdminRiskSignal


def _days_ago(days: int) -> str:
    return (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()


def _short_id(value: str, length: int = 10) -> str:
    return sha1(value.encode("utf-8")).hexdigest()[:length]


def _profile_label(row: dict) -> str:
    name = str(row.get("full_name") or "").strip() or "Unnamed profile"
    role = str(row.get("role") or "guest").strip()
    return f"{name} ({role})"


def _format_money_inr(minor: int) -> str:
    rupees = minor / 100
    if rupees >= 1000:
        return f"₹{rupees:,.0f}"
    return f"₹{rupees:.0f}"


def list_admin_risk_signals(limit: int = 40) -> list[AdminRiskSignal]:
    """Heuristic trust queue — query-only, no new fraud tables."""
    supabase = get_supabase_admin()
    signals: list[AdminRiskSignal] = []

    # Duplicate-ish accounts: identical phone or repeated display names.
    try:
        profiles = (
            supabase.table("profiles")
            .select("id, full_name, phone, role, created_at")
            .order("created_at", desc=True)
            .limit(500)
            .execute()
        )
        phone_map: dict[str, list[dict]] = defaultdict(list)
        name_map: dict[str, list[dict]] = defaultdict(list)
        for row in profiles.data or []:
            if not isinstance(row, dict):
                continue
            phone = str(row.get("phone") or "").strip()
            digits = "".join(ch for ch in phone if ch.isdigit())
            if digits and len(digits) >= 8:
                phone_map[digits].append(row)
            name = str(row.get("full_name") or "").strip().lower()
            if name and len(name) >= 3:
                name_map[name].append(row)

        for phone, rows in phone_map.items():
            if len(rows) < 2:
                continue
            labels = [_profile_label(row) for row in rows[:8]]
            more = len(rows) - len(labels)
            evidence = labels + ([f"+{more} more profiles"] if more > 0 else [])
            signals.append(
                AdminRiskSignal(
                    id=f"dup-phone-{_short_id(phone)}",
                    category="duplicate_accounts",
                    severity="high",
                    title="Shared phone across accounts",
                    detail=(
                        f"{len(rows)} profiles share the same phone number "
                        f"(ending …{phone[-4:]})."
                    ),
                    evidence=evidence,
                    entityType="profile",
                    entityId=str(rows[0].get("id") or ""),
                    href="/admin/profile/users",
                    search=None,
                )
            )

        for name, rows in name_map.items():
            if len(rows) < 3:
                continue
            labels = [_profile_label(row) for row in rows[:8]]
            more = len(rows) - len(labels)
            evidence = labels + ([f"+{more} more profiles"] if more > 0 else [])
            display = str(rows[0].get("full_name") or name)
            signals.append(
                AdminRiskSignal(
                    id=f"dup-name-{_short_id(name)}",
                    category="duplicate_accounts",
                    severity="medium",
                    title="Repeated display name",
                    detail=f'"{display}" is used on {len(rows)} different profiles.',
                    evidence=evidence,
                    entityType="profile",
                    entityId=str(rows[0].get("id") or ""),
                    href="/admin/profile/users",
                    search=None,
                )
            )
    except Exception:
        pass

    # Review spam: identical comments or burst 1★ reviews.
    try:
        since = _days_ago(30)
        reviews = (
            supabase.table("reviews")
            .select("id, guest_id, rating, comment, created_at, is_hidden, experience_id")
            .gte("created_at", since)
            .order("created_at", desc=True)
            .limit(300)
            .execute()
        )
        comment_map: dict[str, list[dict]] = defaultdict(list)
        guest_low: Counter[str] = Counter()
        guest_low_rows: dict[str, list[dict]] = defaultdict(list)
        for row in reviews.data or []:
            if not isinstance(row, dict) or row.get("is_hidden"):
                continue
            comment = " ".join(str(row.get("comment") or "").split()).strip().lower()
            if len(comment) >= 12:
                comment_map[comment].append(row)
            if int(row.get("rating") or 0) <= 1 and row.get("guest_id"):
                guest_id = str(row["guest_id"])
                guest_low[guest_id] += 1
                guest_low_rows[guest_id].append(row)

        for comment, rows in comment_map.items():
            if len(rows) < 2:
                continue
            snippet = comment if len(comment) <= 140 else f"{comment[:137]}…"
            guest_ids = sorted({str(row.get("guest_id") or "") for row in rows if row.get("guest_id")})
            evidence = [
                f'Repeated text: "{snippet}"',
                f"Appears on {len(rows)} reviews from {len(guest_ids) or 'unknown'} guest account(s).",
            ]
            signals.append(
                AdminRiskSignal(
                    id=f"spam-comment-{_short_id(comment)}",
                    category="review_spam",
                    severity="high",
                    title="Duplicate review text",
                    detail=f"{len(rows)} reviews in the last 30 days share identical comment text.",
                    evidence=evidence,
                    entityType="review",
                    entityId=str(rows[0].get("id") or ""),
                    href="/admin/reviews",
                    search=None,
                )
            )

        guest_names: dict[str, str] = {}
        if guest_low:
            name_rows = (
                supabase.table("profiles")
                .select("id, full_name, role")
                .in_("id", list(guest_low.keys())[:80])
                .execute()
            )
            for row in name_rows.data or []:
                if isinstance(row, dict) and row.get("id"):
                    guest_names[str(row["id"])] = _profile_label(row)

        for guest_id, count in guest_low.items():
            if count < 3:
                continue
            evidence = [
                f"Guest: {guest_names.get(guest_id, guest_id)}",
                f"{count} one-star reviews in the last 30 days.",
            ]
            signals.append(
                AdminRiskSignal(
                    id=f"spam-guest-{guest_id}",
                    category="review_spam",
                    severity="medium",
                    title="Burst of 1★ reviews",
                    detail=(
                        f"{guest_names.get(guest_id, 'A guest')} left {count} "
                        "one-star reviews within 30 days."
                    ),
                    evidence=evidence,
                    entityType="profile",
                    entityId=guest_id,
                    href="/admin/reviews",
                    search=None,
                )
            )
    except Exception:
        pass

    # Suspicious bookings: many cancels / pending COD stacks from one guest.
    try:
        since = _days_ago(14)
        bookings = (
            supabase.table("bookings")
            .select(
                "id, guest_id, booking_status, payment_status, total_amount, created_at, "
                "profiles ( full_name, role )"
            )
            .gte("created_at", since)
            .order("created_at", desc=True)
            .limit(500)
            .execute()
        )
        by_guest: dict[str, list[dict]] = defaultdict(list)
        for row in bookings.data or []:
            if not isinstance(row, dict) or not row.get("guest_id"):
                continue
            by_guest[str(row["guest_id"])].append(row)

        for guest_id, rows in by_guest.items():
            profile = (rows[0].get("profiles") or {}) if isinstance(rows[0], dict) else {}
            guest_label = _profile_label(
                {
                    "full_name": profile.get("full_name") if isinstance(profile, dict) else None,
                    "role": (profile.get("role") if isinstance(profile, dict) else None) or "guest",
                }
            )
            cancels = [row for row in rows if row.get("booking_status") == "cancelled"]
            pending = [row for row in rows if row.get("booking_status") == "pending"]
            high_value = [
                row
                for row in rows
                if row.get("booking_status") == "confirmed"
                and int(row.get("total_amount") or 0) >= 150000
                and row.get("payment_status") != "paid"
            ]

            if len(cancels) >= 3:
                evidence = [
                    f"Guest: {guest_label}",
                    f"{len(cancels)} cancellations in the last 14 days.",
                    *[
                        f"Booking {str(row.get('id'))[:8]}… · {_format_money_inr(int(row.get('total_amount') or 0))}"
                        for row in cancels[:5]
                    ],
                ]
                signals.append(
                    AdminRiskSignal(
                        id=f"book-cancel-{guest_id}",
                        category="suspicious_bookings",
                        severity="high",
                        title="Repeated cancellations",
                        detail=(
                            f"{guest_label} cancelled {len(cancels)} experience bookings "
                            "in the last 14 days."
                        ),
                        evidence=evidence,
                        entityType="booking",
                        entityId=str(cancels[0].get("id") or rows[0].get("id") or ""),
                        href="/admin/bookings",
                        search={"status": "cancelled", "dateView": "all"},
                    )
                )

            if len(pending) >= 4:
                evidence = [
                    f"Guest: {guest_label}",
                    f"{len(pending)} open pending requests.",
                    *[
                        f"Booking {str(row.get('id'))[:8]}… · {_format_money_inr(int(row.get('total_amount') or 0))}"
                        for row in pending[:5]
                    ],
                ]
                signals.append(
                    AdminRiskSignal(
                        id=f"book-pending-{guest_id}",
                        category="suspicious_bookings",
                        severity="medium",
                        title="Stacked pending requests",
                        detail=(
                            f"{guest_label} currently has {len(pending)} pending "
                            "experience bookings awaiting host accept."
                        ),
                        evidence=evidence,
                        entityType="booking",
                        entityId=str(pending[0].get("id") or rows[0].get("id") or ""),
                        href="/admin/bookings",
                        search={"status": "pending", "dateView": "all"},
                    )
                )

            if len(high_value) >= 2:
                evidence = [
                    f"Guest: {guest_label}",
                    f"{len(high_value)} unpaid bookings at or above ₹1,500.",
                    *[
                        f"Booking {str(row.get('id'))[:8]}… · {_format_money_inr(int(row.get('total_amount') or 0))} · {row.get('payment_status') or 'unpaid'}"
                        for row in high_value[:5]
                    ],
                ]
                signals.append(
                    AdminRiskSignal(
                        id=f"book-value-{guest_id}",
                        category="suspicious_bookings",
                        severity="medium",
                        title="High-value unpaid bookings",
                        detail=(
                            f"{guest_label} has {len(high_value)} pay-at-experience bookings "
                            "of ₹1,500+ that are not marked paid."
                        ),
                        evidence=evidence,
                        entityType="booking",
                        entityId=str(high_value[0].get("id") or rows[0].get("id") or ""),
                        href="/admin/bookings",
                        search={"status": "confirmed", "payment": "cod-pending", "dateView": "all"},
                    )
                )
    except Exception:
        pass

    severity_rank = {"high": 0, "medium": 1, "low": 2}
    signals.sort(key=lambda s: (severity_rank.get(s.severity, 9), s.title))
    return signals[:limit]
