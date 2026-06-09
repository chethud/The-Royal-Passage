from app.dependencies.supabase import get_supabase_admin
from app.models.schemas import GuestProfile, UpdateGuestProfileRequest


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
    )


def update_guest_profile(auth: dict, payload: UpdateGuestProfileRequest) -> GuestProfile:
    updates: dict = {}
    if payload.fullName is not None:
        updates["full_name"] = payload.fullName.strip()
    if payload.phone is not None:
        updates["phone"] = payload.phone.strip() or None

    if not updates:
        return get_guest_profile(auth)

    supabase = get_supabase_admin()
    supabase.table("profiles").update(updates).eq("id", auth["user"].id).execute()

    profile_result = (
        supabase.table("profiles")
        .select("role, full_name, phone, created_at")
        .eq("id", auth["user"].id)
        .maybe_single()
        .execute()
    )
    row = profile_result.data or auth["profile"]
    auth["profile"] = {**auth["profile"], **row}

    return get_guest_profile(auth)
