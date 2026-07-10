from app.dependencies.supabase import get_supabase_admin
from app.models.schemas import (
    CreateHostRequest,
    CreatePlatformUserRequest,
    CreatePlatformUserResponse,
    CreateHostResponse,
    ManagedUser,
)
from app.services.transactional_emails import send_homestay_owner_welcome_email
from app.services.user_roles import (
    normalize_admin_roles,
    pick_primary_role,
    sync_user_roles,
    fetch_user_roles,
)

ADMIN_CREATABLE_ROLES = {"host", "homestay_owner", "vip_owner", "admin", "editor"}


def _first_row(data):
    if not data:
        return None
    if isinstance(data, list):
        return data[0] if data else None
    return data


def _error_message(exc: Exception, fallback: str) -> str:
    message = getattr(exc, "message", None)
    if isinstance(message, str) and message.strip():
        return message.strip()
    text = str(exc).strip()
    return text or fallback


def _resolved_roles(payload: CreatePlatformUserRequest) -> list[str]:
    return normalize_admin_roles(payload.roles, payload.role)


def list_managed_users() -> list[ManagedUser]:
    supabase = get_supabase_admin()
    profiles_result = (
        supabase.table("profiles")
        .select("id, full_name, phone, role, host_id, created_at")
        .order("created_at", desc=True)
        .execute()
    )
    profiles = profiles_result.data or []

    users = supabase.auth.admin.list_users(per_page=1000) or []
    email_by_id = {user.id: user.email for user in users}

    managed: list[ManagedUser] = []
    for row in profiles:
        roles = fetch_user_roles(supabase, row["id"])
        if not roles:
            roles = [row["role"]]
        managed.append(
            ManagedUser(
                id=row["id"],
                email=email_by_id.get(row["id"]),
                fullName=row.get("full_name"),
                phone=row.get("phone"),
                role=row["role"],
                roles=roles,
                hostId=row.get("host_id"),
                createdAt=row["created_at"],
            )
        )
    return managed


def create_host_account(payload: CreateHostRequest) -> CreateHostResponse:
    supabase = get_supabase_admin()

    try:
        created = supabase.auth.admin.create_user(
            {
                "email": str(payload.email),
                "password": payload.password,
                "email_confirm": True,
                "user_metadata": {
                    "full_name": payload.displayName,
                    "phone": payload.phone,
                },
            }
        )
    except Exception as exc:
        raise ValueError(_error_message(exc, "Failed to create host login.")) from exc

    user = created.user if created else None
    if not user:
        raise ValueError("Failed to create host login.")

    user_id = user.id

    try:
        host_result = (
            supabase.table("hosts")
            .insert(
                {
                    "auth_user_id": user_id,
                    "display_name": payload.displayName,
                    "email": str(payload.email),
                    "phone": payload.phone,
                    "bio": payload.bio,
                    "verified": False,
                    "approval_status": "pending",
                }
            )
            .select("id")
            .execute()
        )
    except Exception as exc:
        supabase.auth.admin.delete_user(user_id)
        raise ValueError(_error_message(exc, "Failed to create host profile.")) from exc

    host_row = _first_row(host_result.data)
    if not host_row:
        supabase.auth.admin.delete_user(user_id)
        raise ValueError("Failed to create host profile.")

    try:
        profile_result = (
            supabase.table("profiles")
            .upsert(
                {
                    "id": user_id,
                    "full_name": payload.displayName,
                    "phone": payload.phone,
                    "role": "host",
                    "host_id": host_row["id"],
                }
            )
            .execute()
        )
    except Exception as exc:
        supabase.table("hosts").delete().eq("id", host_row["id"]).execute()
        supabase.auth.admin.delete_user(user_id)
        raise ValueError(_error_message(exc, "Failed to create host profile record.")) from exc

    if not profile_result.data:
        supabase.table("hosts").delete().eq("id", host_row["id"]).execute()
        supabase.auth.admin.delete_user(user_id)
        raise ValueError("Failed to create host profile record.")

    sync_user_roles(supabase, user_id, ["host"])

    return CreateHostResponse(
        id=user_id,
        email=str(payload.email),
        displayName=payload.displayName,
        hostId=host_row["id"],
    )


def _create_auth_user(supabase, payload: CreatePlatformUserRequest) -> str:
    try:
        created = supabase.auth.admin.create_user(
            {
                "email": str(payload.email),
                "password": payload.password,
                "email_confirm": True,
                "user_metadata": {
                    "full_name": payload.fullName,
                    "phone": payload.phone,
                },
            }
        )
    except Exception as exc:
        raise ValueError(_error_message(exc, "Failed to create user login.")) from exc

    user = created.user if created else None
    if not user:
        raise ValueError("Failed to create user login.")
    return user.id


def _rollback_platform_user(
    supabase,
    user_id: str,
    *,
    host_id: str | None = None,
    homestay_owner_id: str | None = None,
    vip_owner_id: str | None = None,
) -> None:
    if host_id:
        supabase.table("hosts").delete().eq("id", host_id).execute()
    if homestay_owner_id:
        supabase.table("homestay_owners").delete().eq("id", homestay_owner_id).execute()
    if vip_owner_id:
        supabase.table("vip_owners").delete().eq("id", vip_owner_id).execute()
    supabase.table("user_roles").delete().eq("user_id", user_id).execute()
    supabase.auth.admin.delete_user(user_id)


def create_platform_user(payload: CreatePlatformUserRequest) -> CreatePlatformUserResponse:
    roles = _resolved_roles(payload)
    supabase = get_supabase_admin()
    user_id = _create_auth_user(supabase, payload)

    host_id: str | None = None
    homestay_owner_id: str | None = None
    vip_owner_id: str | None = None

    try:
        if "host" in roles:
            host_result = (
                supabase.table("hosts")
                .insert(
                    {
                        "auth_user_id": user_id,
                        "display_name": payload.fullName,
                        "email": str(payload.email),
                        "phone": payload.phone,
                        "bio": payload.bio,
                        "verified": False,
                        "approval_status": "pending",
                    }
                )
                .select("id")
                .execute()
            )
            host_row = _first_row(host_result.data)
            if not host_row:
                raise ValueError("Failed to create host profile.")
            host_id = host_row["id"]

        if "homestay_owner" in roles:
            owner_result = (
                supabase.table("homestay_owners")
                .insert(
                    {
                        "auth_user_id": user_id,
                        "full_name": payload.fullName,
                        "email": str(payload.email),
                        "phone": payload.phone,
                        "address": payload.address,
                        "verified": False,
                        "approval_status": "approved",
                    }
                )
                .select("id")
                .execute()
            )
            owner_row = _first_row(owner_result.data)
            if not owner_row:
                raise ValueError("Failed to create homestay owner profile.")
            homestay_owner_id = owner_row["id"]

        if "vip_owner" in roles:
            owner_result = (
                supabase.table("vip_owners")
                .insert(
                    {
                        "auth_user_id": user_id,
                        "full_name": payload.fullName,
                        "email": str(payload.email),
                        "phone": payload.phone,
                        "address": payload.address,
                        "verified": False,
                        "approval_status": "approved",
                    }
                )
                .select("id")
                .execute()
            )
            owner_row = _first_row(owner_result.data)
            if not owner_row:
                raise ValueError("Failed to create VIP owner profile.")
            vip_owner_id = owner_row["id"]

        primary_role = pick_primary_role(roles)
        profile_patch = {
            "id": user_id,
            "full_name": payload.fullName,
            "phone": payload.phone,
            "role": primary_role,
        }
        if host_id:
            profile_patch["host_id"] = host_id
        if homestay_owner_id:
            profile_patch["homestay_owner_id"] = homestay_owner_id
        if vip_owner_id:
            profile_patch["vip_owner_id"] = vip_owner_id

        profile_result = supabase.table("profiles").upsert(profile_patch).execute()
        if not profile_result.data:
            raise ValueError("Failed to create profile record.")

        sync_user_roles(supabase, user_id, roles)

        if "homestay_owner" in roles:
            try:
                send_homestay_owner_welcome_email(to=str(payload.email), owner_name=payload.fullName)
            except Exception:
                pass
    except Exception as exc:
        _rollback_platform_user(
            supabase,
            user_id,
            host_id=host_id,
            homestay_owner_id=homestay_owner_id,
            vip_owner_id=vip_owner_id,
        )
        if isinstance(exc, ValueError):
            raise
        raise ValueError(_error_message(exc, "Failed to create platform user.")) from exc

    return CreatePlatformUserResponse(
        id=user_id,
        email=str(payload.email),
        fullName=payload.fullName,
        role=pick_primary_role(roles),
        roles=roles,
        hostId=host_id,
        homestayOwnerId=homestay_owner_id,
        vipOwnerId=vip_owner_id,
    )


# Legacy alias for older callers.
def create_staff_account(payload: CreatePlatformUserRequest) -> CreatePlatformUserResponse:
    return create_platform_user(payload)
