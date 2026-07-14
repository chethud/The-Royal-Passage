from __future__ import annotations

ADMIN_CREATABLE_ROLES = frozenset(
    {"host", "homestay_owner", "vip_owner", "admin", "editor"},
)

ALLOWED_ROLES = frozenset(
    {"guest", "host", "homestay_owner", "vip_owner", "admin", "editor"},
)

ROLE_PRIORITY = (
    "admin",
    "host",
    "homestay_owner",
    "vip_owner",
    "editor",
    "guest",
)


def normalize_admin_roles(roles: list[str] | None, fallback_role: str | None = None) -> list[str]:
    raw = [role.strip() for role in (roles or []) if isinstance(role, str) and role.strip()]
    if not raw and fallback_role:
        raw = [fallback_role.strip()]
    unique: list[str] = []
    for role in raw:
        if role not in ADMIN_CREATABLE_ROLES:
            raise ValueError(f"Unsupported role: {role}")
        if role not in unique:
            unique.append(role)
    if not unique:
        raise ValueError("Select at least one access role.")
    return unique


def pick_primary_role(roles: list[str]) -> str:
    for role in ROLE_PRIORITY:
        if role in roles:
            return role
    return roles[0]


def fetch_user_roles(supabase, user_id: str) -> list[str]:
    try:
        result = (
            supabase.table("user_roles")
            .select("role")
            .eq("user_id", user_id)
            .order("role")
            .execute()
        )
        rows = result.data or []
        roles = [row["role"] for row in rows if row.get("role")]
        if roles:
            return roles
    except Exception:
        pass
    return []


def sync_user_roles(supabase, user_id: str, roles: list[str]) -> None:
    unique: list[str] = []
    for role in roles:
        if role not in ALLOWED_ROLES:
            raise ValueError(f"Unsupported role: {role}")
        if role not in unique:
            unique.append(role)
    if not unique:
        raise ValueError("At least one role is required.")
    supabase.table("user_roles").delete().eq("user_id", user_id).execute()
    supabase.table("user_roles").insert(
        [{"user_id": user_id, "role": role} for role in unique],
    ).execute()


def profile_roles(profile: dict, supabase=None) -> list[str]:
    roles = profile.get("roles")
    if isinstance(roles, list) and roles:
        return [role for role in roles if isinstance(role, str)]
    if supabase is not None:
        loaded = fetch_user_roles(supabase, profile["id"])
        if loaded:
            return loaded
    role = profile.get("role")
    return [role] if isinstance(role, str) and role else []


def profile_has_role(profile: dict, role: str, supabase=None) -> bool:
    return role in profile_roles(profile, supabase)
