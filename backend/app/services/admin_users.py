from app.dependencies.supabase import get_supabase_admin
from app.models.schemas import CreateHostRequest, CreateHostResponse, ManagedUser


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

    return [
        ManagedUser(
            id=row["id"],
            email=email_by_id.get(row["id"]),
            fullName=row.get("full_name"),
            phone=row.get("phone"),
            role=row["role"],
            hostId=row.get("host_id"),
            createdAt=row["created_at"],
        )
        for row in profiles
    ]


def create_host_account(payload: CreateHostRequest) -> CreateHostResponse:
    supabase = get_supabase_admin()

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

    user = created.user if created else None
    if not user:
        raise ValueError("Failed to create host login.")

    user_id = user.id

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
        .single()
        .execute()
    )

    host_row = host_result.data
    if not host_row:
        supabase.auth.admin.delete_user(user_id)
        raise ValueError("Failed to create host profile.")

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

    if profile_result.data is None and getattr(profile_result, "error", None):
        supabase.table("hosts").delete().eq("id", host_row["id"]).execute()
        supabase.auth.admin.delete_user(user_id)
        raise ValueError("Failed to create host profile record.")

    return CreateHostResponse(
        id=user_id,
        email=str(payload.email),
        displayName=payload.displayName,
        hostId=host_row["id"],
    )
