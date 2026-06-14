import re

from app.dependencies.supabase import get_supabase_admin
from app.models.schemas import GuestProfile, UpdateGuestProfileRequest

_DATE_OF_BIRTH_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
_PROFILE_SELECT = "role, full_name, phone, avatar_url, date_of_birth, created_at"


def _normalize_date_of_birth(value) -> str | None:
    if value is None:
        return None
    text = str(value).strip()
    return text or None


def get_guest_profile(auth: dict) -> GuestProfile:
    profile = auth["profile"]
    user = auth["user"]

    return GuestProfile(
        id=user.id,
        email=user.email,
        fullName=profile.get("full_name"),
        phone=profile.get("phone"),
        role=profile.get("role") or "guest",
        createdAt=profile.get("created_at") or "",
        avatarUrl=profile.get("avatar_url"),
        dateOfBirth=_normalize_date_of_birth(profile.get("date_of_birth")),
    )


def update_guest_profile(auth: dict, payload: UpdateGuestProfileRequest) -> GuestProfile:
    updates: dict = {}
    if payload.fullName is not None:
        updates["full_name"] = payload.fullName.strip()
    if payload.phone is not None:
        updates["phone"] = payload.phone.strip() or None
    if payload.avatarUrl is not None:
        url = payload.avatarUrl.strip()
        if url and not (url.startswith("http://") or url.startswith("https://")):
            raise ValueError("Profile photo must be a valid image URL.")
        updates["avatar_url"] = url or None
    if payload.dateOfBirth is not None:
        dob = payload.dateOfBirth.strip()
        if dob:
            if not _DATE_OF_BIRTH_RE.match(dob):
                raise ValueError("Date of birth must use YYYY-MM-DD format.")
            updates["date_of_birth"] = dob
        else:
            updates["date_of_birth"] = None

    if not updates:
        return get_guest_profile(auth)

    supabase = get_supabase_admin()
    supabase.table("profiles").update(updates).eq("id", auth["user"].id).execute()

    profile_result = (
        supabase.table("profiles")
        .select(_PROFILE_SELECT)
        .eq("id", auth["user"].id)
        .maybe_single()
        .execute()
    )
    row = profile_result.data or auth["profile"]
    auth["profile"] = {**auth["profile"], **row}

    return get_guest_profile(auth)
