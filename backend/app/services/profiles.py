from app.services.user_roles import fetch_user_roles, sync_user_roles

PROFILE_SELECT = (
    "id, role, full_name, phone, avatar_url, date_of_birth, host_id, homestay_owner_id, vip_owner_id, "
    "created_at, vip_membership_status"
)
PROFILE_SELECT_LEGACY = (
    "id, role, full_name, phone, avatar_url, date_of_birth, host_id, created_at, vip_membership_status"
)


def _profile_name_from_user(user) -> str | None:
    meta = getattr(user, "user_metadata", None) or {}
    if not isinstance(meta, dict):
        meta = {}
    return meta.get("full_name") or meta.get("name") or getattr(user, "email", None)


def _profile_phone_from_user(user) -> str | None:
    meta = getattr(user, "user_metadata", None) or {}
    if not isinstance(meta, dict):
        return None
    phone = meta.get("phone")
    return str(phone) if phone else None


def _attach_roles(supabase, row: dict) -> dict:
    roles = fetch_user_roles(supabase, row["id"])
    if not roles and row.get("role"):
        roles = [row["role"]]
    row["roles"] = roles
    return row


def fetch_profile_row(supabase, user_id: str) -> dict | None:
    try:
        result = (
            supabase.table("profiles")
            .select(PROFILE_SELECT)
            .eq("id", user_id)
            .maybe_single()
            .execute()
        )
        if result and result.data:
            return _attach_roles(supabase, result.data)
    except Exception:
        result = (
            supabase.table("profiles")
            .select(PROFILE_SELECT_LEGACY)
            .eq("id", user_id)
            .maybe_single()
            .execute()
        )
        if result and result.data:
            return _attach_roles(supabase, result.data)
    return None


def ensure_user_profile(supabase, user) -> dict:
    """Return the user's profile row, creating a guest profile if missing."""
    row = fetch_profile_row(supabase, user.id)
    if row:
        return row

    insert_row = {
        "id": user.id,
        "full_name": _profile_name_from_user(user),
        "phone": _profile_phone_from_user(user),
        "role": "guest",
    }
    insert_result = (
        supabase.table("profiles")
        .insert(insert_row)
        .select(PROFILE_SELECT)
        .execute()
    )
    insert_rows = insert_result.data if insert_result else None
    if insert_rows:
        sync_user_roles(supabase, user.id, ["guest"])
        return _attach_roles(supabase, insert_rows[0])

    row = fetch_profile_row(supabase, user.id)
    if row:
        return row

    raise ValueError("Failed to create user profile.")
