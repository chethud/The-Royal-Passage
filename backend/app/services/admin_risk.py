from __future__ import annotations

from collections import Counter, defaultdict
from datetime import datetime, timedelta, timezone

from app.dependencies.supabase import get_supabase_admin
from app.models.schemas import AdminRiskSignal


def _days_ago(days: int) -> str:
    return (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()


def list_admin_risk_signals(limit: int = 40) -> list[AdminRiskSignal]:
    """Heuristic trust queue — query-only, no new fraud tables."""
    supabase = get_supabase_admin()
    signals: list[AdminRiskSignal] = []

    # Duplicate-ish accounts: same normalized email local-part or identical phone.
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
            if phone and len(phone) >= 8:
                phone_map[phone].append(row)
            name = str(row.get("full_name") or "").strip().lower()
            if name and len(name) >= 3:
                name_map[name].append(row)

        for phone, rows in phone_map.items():
            if len(rows) < 2:
                continue
            signals.append(
                AdminRiskSignal(
                    id=f"dup-phone-{phone[-4:]}",
                    category="duplicate_accounts",
                    severity="high",
                    title="Shared phone across accounts",
                    detail=f"{len(rows)} profiles share phone ending …{phone[-4:]}",
                    entityType="profile",
                    entityId=rows[0].get("id"),
                    href="/admin/profile/users",
                )
            )

        for name, rows in name_map.items():
            if len(rows) < 3:
                continue
            signals.append(
                AdminRiskSignal(
                    id=f"dup-name-{name[:24]}",
                    category="duplicate_accounts",
                    severity="medium",
                    title="Repeated display name",
                    detail=f'"{rows[0].get("full_name")}" appears on {len(rows)} profiles',
                    entityType="profile",
                    entityId=rows[0].get("id"),
                    href="/admin/profile/users",
                )
            )
    except Exception:
        pass

    # Review spam: identical comments or burst 1★ reviews.
    try:
        since = _days_ago(30)
        reviews = (
            supabase.table("reviews")
            .select("id, guest_id, rating, comment, created_at, is_hidden")
            .gte("created_at", since)
            .order("created_at", desc=True)
            .limit(300)
            .execute()
        )
        comment_map: dict[str, list[dict]] = defaultdict(list)
        guest_low: Counter[str] = Counter()
        for row in reviews.data or []:
            if not isinstance(row, dict) or row.get("is_hidden"):
                continue
            comment = " ".join(str(row.get("comment") or "").split()).strip().lower()
            if len(comment) >= 12:
                comment_map[comment].append(row)
            if int(row.get("rating") or 0) <= 1 and row.get("guest_id"):
                guest_low[str(row["guest_id"])] += 1

        for comment, rows in comment_map.items():
            if len(rows) < 2:
                continue
            signals.append(
                AdminRiskSignal(
                    id=f"spam-comment-{rows[0].get('id')}",
                    category="review_spam",
                    severity="high",
                    title="Duplicate review text",
                    detail=f"{len(rows)} reviews share the same comment",
                    entityType="review",
                    entityId=str(rows[0].get("id")),
                    href="/admin/reviews",
                )
            )

        for guest_id, count in guest_low.items():
            if count < 3:
                continue
            signals.append(
                AdminRiskSignal(
                    id=f"spam-guest-{guest_id}",
                    category="review_spam",
                    severity="medium",
                    title="Burst of 1★ reviews",
                    detail=f"Guest left {count} one-star reviews in 30 days",
                    entityType="profile",
                    entityId=guest_id,
                    href="/admin/reviews",
                )
            )
    except Exception:
        pass

    # Suspicious bookings: many cancels / pending COD stacks from one guest.
    try:
        since = _days_ago(14)
        bookings = (
            supabase.table("bookings")
            .select("id, guest_id, booking_status, payment_status, total_amount, created_at")
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
            cancels = sum(1 for row in rows if row.get("booking_status") == "cancelled")
            pending = sum(1 for row in rows if row.get("booking_status") == "pending")
            high_value = sum(
                1
                for row in rows
                if int(row.get("total_amount") or 0) >= 150000
                and row.get("payment_status") != "paid"
            )
            if cancels >= 3:
                signals.append(
                    AdminRiskSignal(
                        id=f"book-cancel-{guest_id}",
                        category="suspicious_bookings",
                        severity="high",
                        title="Repeated cancellations",
                        detail=f"Guest cancelled {cancels} bookings in 14 days",
                        entityType="booking",
                        entityId=str(rows[0].get("id")),
                        href="/admin/bookings",
                    )
                )
            if pending >= 4:
                signals.append(
                    AdminRiskSignal(
                        id=f"book-pending-{guest_id}",
                        category="suspicious_bookings",
                        severity="medium",
                        title="Stacked pending requests",
                        detail=f"Guest has {pending} pending bookings",
                        entityType="booking",
                        entityId=str(rows[0].get("id")),
                        href="/admin/bookings?status=pending",
                    )
                )
            if high_value >= 2:
                signals.append(
                    AdminRiskSignal(
                        id=f"book-value-{guest_id}",
                        category="suspicious_bookings",
                        severity="medium",
                        title="High-value unpaid bookings",
                        detail=f"{high_value} COD bookings ≥ ₹1,500 from one guest",
                        entityType="booking",
                        entityId=str(rows[0].get("id")),
                        href="/admin/bookings",
                    )
                )
    except Exception:
        pass

    severity_rank = {"high": 0, "medium": 1, "low": 2}
    signals.sort(key=lambda s: (severity_rank.get(s.severity, 9), s.title))
    return signals[:limit]
