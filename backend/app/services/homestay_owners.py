from app.dependencies.supabase import get_supabase_admin
from app.models.schemas import CreateHomestayOwnerRequest, CreateHomestayOwnerResponse


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


def create_homestay_owner_account(payload: CreateHomestayOwnerRequest) -> CreateHomestayOwnerResponse:
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
        raise ValueError(_error_message(exc, "Failed to create homestay owner login.")) from exc

    user = created.user if created else None
    if not user:
        raise ValueError("Failed to create homestay owner login.")

    user_id = user.id

    try:
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
    except Exception as exc:
        supabase.auth.admin.delete_user(user_id)
        raise ValueError(_error_message(exc, "Failed to create homestay owner profile.")) from exc

    owner_row = _first_row(owner_result.data)
    if not owner_row:
        supabase.auth.admin.delete_user(user_id)
        raise ValueError("Failed to create homestay owner profile.")

    try:
        profile_result = (
            supabase.table("profiles")
            .upsert(
                {
                    "id": user_id,
                    "full_name": payload.fullName,
                    "phone": payload.phone,
                    "role": "homestay_owner",
                    "homestay_owner_id": owner_row["id"],
                }
            )
            .execute()
        )
    except Exception as exc:
        supabase.table("homestay_owners").delete().eq("id", owner_row["id"]).execute()
        supabase.auth.admin.delete_user(user_id)
        raise ValueError(_error_message(exc, "Failed to create homestay owner profile record.")) from exc

    if not profile_result.data:
        supabase.table("homestay_owners").delete().eq("id", owner_row["id"]).execute()
        supabase.auth.admin.delete_user(user_id)
        raise ValueError("Failed to create homestay owner profile record.")

    return CreateHomestayOwnerResponse(
        id=user_id,
        email=str(payload.email),
        fullName=payload.fullName,
        homestayOwnerId=owner_row["id"],
    )
