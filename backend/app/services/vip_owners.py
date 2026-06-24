from app.dependencies.supabase import get_supabase_admin
from app.models.schemas import CreateVipOwnerRequest, CreateVipOwnerResponse
from app.services.homestay_owners import _error_message, _first_row


def create_vip_owner_account(payload: CreateVipOwnerRequest) -> CreateVipOwnerResponse:
    supabase = get_supabase_admin()

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
        raise ValueError(_error_message(exc, "Failed to create VIP owner login.")) from exc

    user = created.user if created else None
    if not user:
        raise ValueError("Failed to create VIP owner login.")

    user_id = user.id

    try:
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
    except Exception as exc:
        supabase.auth.admin.delete_user(user_id)
        raise ValueError(_error_message(exc, "Failed to create VIP owner profile.")) from exc

    owner_row = _first_row(owner_result.data)
    if not owner_row:
        supabase.auth.admin.delete_user(user_id)
        raise ValueError("Failed to create VIP owner profile.")

    try:
        profile_result = (
            supabase.table("profiles")
            .upsert(
                {
                    "id": user_id,
                    "full_name": payload.fullName,
                    "phone": payload.phone,
                    "role": "vip_owner",
                    "vip_owner_id": owner_row["id"],
                }
            )
            .execute()
        )
    except Exception as exc:
        supabase.table("vip_owners").delete().eq("id", owner_row["id"]).execute()
        supabase.auth.admin.delete_user(user_id)
        raise ValueError(_error_message(exc, "Failed to create VIP owner profile record.")) from exc

    if not profile_result.data:
        supabase.table("vip_owners").delete().eq("id", owner_row["id"]).execute()
        supabase.auth.admin.delete_user(user_id)
        raise ValueError("Failed to create VIP owner profile record.")

    return CreateVipOwnerResponse(
        id=user_id,
        email=str(payload.email),
        fullName=payload.fullName,
        vipOwnerId=owner_row["id"],
    )
