from __future__ import annotations

from datetime import datetime, timezone
from uuid import uuid4

from app.dependencies.supabase import get_supabase_admin
from app.models.schemas import SiteBanner, UpsertSiteBannerRequest

SITE_BANNERS_KEY = "site_banners"


def _parse_iso(value: str | None) -> datetime | None:
    if not value:
        return None
    try:
        return datetime.fromisoformat(str(value).replace("Z", "+00:00"))
    except Exception:
        return None


def _row_to_banner(raw: dict) -> SiteBanner | None:
    try:
        return SiteBanner(
            id=str(raw.get("id") or uuid4()),
            title=str(raw.get("title") or "").strip() or "Banner",
            body=(str(raw["body"]).strip() if raw.get("body") else None),
            href=(str(raw["href"]).strip() if raw.get("href") else None),
            placement=str(raw.get("placement") or "home_top"),
            startsAt=str(raw.get("startsAt") or raw.get("starts_at") or ""),
            endsAt=str(raw.get("endsAt") or raw.get("ends_at") or ""),
            active=bool(raw.get("active", True)),
        )
    except Exception:
        return None


def _load_banners() -> list[SiteBanner]:
    supabase = get_supabase_admin()
    result = (
        supabase.table("platform_settings")
        .select("value")
        .eq("key", SITE_BANNERS_KEY)
        .limit(1)
        .execute()
    )
    rows = result.data or []
    if not rows:
        return []
    value = rows[0].get("value")
    if isinstance(value, dict):
        raw_list = value.get("banners") or value.get("items") or []
    elif isinstance(value, list):
        raw_list = value
    else:
        raw_list = []
    banners: list[SiteBanner] = []
    for raw in raw_list:
        if isinstance(raw, dict):
            banner = _row_to_banner(raw)
            if banner:
                banners.append(banner)
    return banners


def _save_banners(banners: list[SiteBanner]) -> list[SiteBanner]:
    supabase = get_supabase_admin()
    payload = {"banners": [b.model_dump(mode="json") for b in banners]}
    supabase.table("platform_settings").upsert(
        {"key": SITE_BANNERS_KEY, "value": payload},
        on_conflict="key",
    ).execute()
    return banners


def list_site_banners() -> list[SiteBanner]:
    return _load_banners()


def list_active_site_banners(placement: str = "home_top") -> list[SiteBanner]:
    now = datetime.now(timezone.utc)
    active: list[SiteBanner] = []
    for banner in _load_banners():
        if not banner.active:
            continue
        if placement and banner.placement != placement:
            continue
        start = _parse_iso(banner.startsAt)
        end = _parse_iso(banner.endsAt)
        if start and now < start:
            continue
        if end and now > end:
            continue
        active.append(banner)
    return active


def upsert_site_banner(payload: UpsertSiteBannerRequest) -> SiteBanner:
    banners = _load_banners()
    banner_id = (payload.id or "").strip() or str(uuid4())
    next_banner = SiteBanner(
        id=banner_id,
        title=payload.title.strip(),
        body=(payload.body.strip() if payload.body else None),
        href=(payload.href.strip() if payload.href else None),
        placement=payload.placement or "home_top",
        startsAt=payload.startsAt,
        endsAt=payload.endsAt,
        active=payload.active,
    )
    replaced = False
    for idx, existing in enumerate(banners):
        if existing.id == banner_id:
            banners[idx] = next_banner
            replaced = True
            break
    if not replaced:
        banners.insert(0, next_banner)
    _save_banners(banners)
    return next_banner


def delete_site_banner(banner_id: str) -> None:
    banners = [b for b in _load_banners() if b.id != banner_id]
    _save_banners(banners)
