from datetime import datetime, timedelta, timezone

from app.dependencies.supabase import get_supabase_admin
from app.models.schemas import (
    GuestProfile,
    ListVipCustomPackageRequestsResponse,
    ListVipMembershipApplicationsResponse,
    CreateVipCustomPackageRequest,
    SubmitVipMembershipApplicationRequest,
    VipCustomPackageRequestSummary,
    VipMembershipApplicationDetail,
    VipMembershipApplicationSummary,
)
from app.services.guest_profile import get_guest_profile
from app.services.user_roles import profile_has_role

VALID_ID_TYPE = "aadhaar"
VALID_PROFESSIONAL_CARD_TYPES = {"business", "visitor"}
VIP_REAPPLY_COOLDOWN_DAYS = 60


def _parse_iso_datetime(value: str | None) -> datetime | None:
    if not value:
        return None
    try:
        return datetime.fromisoformat(str(value).replace("Z", "+00:00"))
    except ValueError:
        return None


def _reapply_available_at(reviewed_at: str | None) -> datetime | None:
    reviewed = _parse_iso_datetime(reviewed_at)
    if not reviewed:
        return None
    if reviewed.tzinfo is None:
        reviewed = reviewed.replace(tzinfo=timezone.utc)
    return reviewed + timedelta(days=VIP_REAPPLY_COOLDOWN_DAYS)


def _ensure_can_reapply_after_rejection(existing_row: dict | None) -> None:
    if not existing_row or existing_row.get("status") != "rejected":
        return
    available_at = _reapply_available_at(existing_row.get("reviewed_at"))
    if not available_at:
        return
    now = datetime.now(timezone.utc)
    if now < available_at:
        days_remaining = max((available_at.date() - now.date()).days, 1)
        raise ValueError(
            "You can submit a new Royal VIP application after "
            f"{available_at.strftime('%B %d, %Y')} ({days_remaining} day(s) remaining)."
        )


def _membership_status(profile: dict) -> str:
    return profile.get("vip_membership_status") or "none"


def _refresh_profile(auth: dict) -> dict:
    supabase = get_supabase_admin()
    result = (
        supabase.table("profiles")
        .select("*")
        .eq("id", auth["user"].id)
        .maybe_single()
        .execute()
    )
    row = result.data if result else None
    if row:
        auth["profile"] = row
    return auth["profile"]


def skip_vip_membership_interest(auth: dict) -> GuestProfile:
    if not profile_has_role(auth["profile"], "guest", get_supabase_admin()):
        raise ValueError("Only guest accounts can update VIP membership interest.")
    status = _membership_status(auth["profile"])
    if status == "approved":
        raise ValueError("You are already a VIP member.")
    if status == "pending":
        raise ValueError("Your VIP membership application is already under review.")

    supabase = get_supabase_admin()
    if status != "skipped":
        supabase.table("profiles").update({"vip_membership_status": "skipped"}).eq(
            "id", auth["user"].id
        ).execute()
    _refresh_profile(auth)
    return get_guest_profile(auth)


def _validate_image_url(url: str, label: str) -> str:
    trimmed = url.strip()
    if not trimmed.startswith("http://") and not trimmed.startswith("https://"):
        raise ValueError(f"{label} must be a valid image URL.")
    return trimmed


def _normalize_social_username(value: str | None) -> str | None:
    if not value:
        return None
    trimmed = value.strip().lstrip("@")
    return trimmed or None


def _summary_from_row(row: dict) -> VipMembershipApplicationSummary:
    return VipMembershipApplicationSummary(
        id=row["id"],
        guestUserId=row["guest_user_id"],
        fullName=row["full_name"],
        email=row["email"],
        phone=row.get("phone"),
        idDocumentType=row["id_document_type"],
        status=row.get("status") or "pending",
        createdAt=row.get("created_at", ""),
        idDocumentPhotoUrl=row.get("id_document_photo_url"),
        description=row.get("description"),
        professionalCardType=row.get("professional_card_type"),
        professionalCardPhotoUrl=row.get("professional_card_photo_url"),
        instagramUsername=row.get("instagram_username"),
        facebookUsername=row.get("facebook_username"),
    )


def submit_vip_membership_application(
    auth: dict, payload: SubmitVipMembershipApplicationRequest
) -> GuestProfile:
    if not profile_has_role(auth["profile"], "guest", get_supabase_admin()):
        raise ValueError("Only guest accounts can apply for VIP membership.")
    status = _membership_status(auth["profile"])
    if status == "approved":
        raise ValueError("You are already a VIP member.")
    if status == "pending":
        raise ValueError("Your VIP membership application is already under review.")

    photo_url = _validate_image_url(payload.idDocumentPhotoUrl, "Aadhaar photo")
    card_photo_url = _validate_image_url(payload.professionalCardPhotoUrl, "Card photo")
    card_type = payload.professionalCardType
    if card_type not in VALID_PROFESSIONAL_CARD_TYPES:
        raise ValueError("Professional card type must be business or visitor.")

    instagram = _normalize_social_username(payload.instagramUsername)
    facebook = _normalize_social_username(payload.facebookUsername)
    if not instagram and not facebook:
        raise ValueError("Provide at least one Instagram or Facebook username.")

    supabase = get_supabase_admin()
    user_id = auth["user"].id
    application_row = {
        "guest_user_id": user_id,
        "full_name": payload.fullName.strip(),
        "email": str(payload.email).strip(),
        "phone": payload.phone.strip() if payload.phone else None,
        "address": payload.address.strip() if payload.address else None,
        "id_document_type": VALID_ID_TYPE,
        "id_document_number": payload.idDocumentNumber.strip(),
        "id_document_photo_url": photo_url,
        "description": payload.description.strip(),
        "professional_card_type": card_type,
        "professional_card_photo_url": card_photo_url,
        "instagram_username": instagram,
        "facebook_username": facebook,
        "status": "pending",
        "reviewed_by": None,
        "reviewed_at": None,
    }

    existing = (
        supabase.table("vip_membership_applications")
        .select("id, status, reviewed_at")
        .eq("guest_user_id", user_id)
        .limit(1)
        .execute()
    )
    existing_rows = existing.data or []
    existing_row = existing_rows[0] if existing_rows else None
    if existing_row:
        if existing_row.get("status") == "pending":
            raise ValueError("Your VIP membership application is already under review.")
        _ensure_can_reapply_after_rejection(existing_row)
        supabase.table("vip_membership_applications").update(application_row).eq(
            "id", existing_row["id"]
        ).execute()
    else:
        supabase.table("vip_membership_applications").insert(application_row).execute()

    supabase.table("profiles").update({"vip_membership_status": "pending"}).eq(
        "id", user_id
    ).execute()
    _refresh_profile(auth)
    return get_guest_profile(auth)


def list_vip_membership_applications() -> ListVipMembershipApplicationsResponse:
    supabase = get_supabase_admin()
    result = (
        supabase.table("vip_membership_applications")
        .select(
            "id, guest_user_id, full_name, email, phone, id_document_type, status, created_at, "
            "id_document_photo_url, description, professional_card_type, professional_card_photo_url, "
            "instagram_username, facebook_username"
        )
        .eq("status", "pending")
        .order("created_at", desc=True)
        .execute()
    )
    rows = result.data or []
    return ListVipMembershipApplicationsResponse(
        applications=[_summary_from_row(row) for row in rows]
    )


def get_vip_membership_application(application_id: str) -> VipMembershipApplicationDetail:
    supabase = get_supabase_admin()
    result = (
        supabase.table("vip_membership_applications")
        .select("*")
        .eq("id", application_id)
        .maybe_single()
        .execute()
    )
    row = result.data if result else None
    if not row:
        raise ValueError("VIP membership application not found.")
    return VipMembershipApplicationDetail(
        id=row["id"],
        guestUserId=row["guest_user_id"],
        fullName=row["full_name"],
        email=row["email"],
        phone=row.get("phone"),
        address=row.get("address"),
        idDocumentType=row["id_document_type"],
        idDocumentNumber=row["id_document_number"],
        status=row.get("status") or "pending",
        createdAt=row.get("created_at", ""),
        idDocumentPhotoUrl=row.get("id_document_photo_url") or "",
        description=row.get("description") or "",
        professionalCardType=row.get("professional_card_type") or "",
        professionalCardPhotoUrl=row.get("professional_card_photo_url") or "",
        instagramUsername=row.get("instagram_username"),
        facebookUsername=row.get("facebook_username"),
    )


def approve_vip_membership(application_id: str, reviewer_user_id: str) -> VipMembershipApplicationSummary:
    supabase = get_supabase_admin()
    detail = get_vip_membership_application(application_id)
    if detail.status != "pending":
        raise ValueError("Only pending applications can be approved.")

    supabase.table("vip_membership_applications").update(
        {
            "status": "approved",
            "reviewed_by": reviewer_user_id,
            "reviewed_at": datetime.now(timezone.utc).isoformat(),
        }
    ).eq("id", application_id).execute()

    supabase.table("profiles").update({"vip_membership_status": "approved"}).eq(
        "id", detail.guestUserId
    ).execute()

    return VipMembershipApplicationSummary(
        id=detail.id,
        guestUserId=detail.guestUserId,
        fullName=detail.fullName,
        email=detail.email,
        phone=detail.phone,
        idDocumentType=detail.idDocumentType,
        status="approved",
        createdAt=detail.createdAt,
        idDocumentPhotoUrl=detail.idDocumentPhotoUrl,
        description=detail.description,
        professionalCardType=detail.professionalCardType,
        professionalCardPhotoUrl=detail.professionalCardPhotoUrl,
        instagramUsername=detail.instagramUsername,
        facebookUsername=detail.facebookUsername,
    )


def reject_vip_membership(application_id: str, reviewer_user_id: str) -> VipMembershipApplicationSummary:
    supabase = get_supabase_admin()
    detail = get_vip_membership_application(application_id)
    if detail.status != "pending":
        raise ValueError("Only pending applications can be rejected.")

    supabase.table("vip_membership_applications").update(
        {
            "status": "rejected",
            "reviewed_by": reviewer_user_id,
            "reviewed_at": datetime.now(timezone.utc).isoformat(),
        }
    ).eq("id", application_id).execute()

    supabase.table("profiles").update({"vip_membership_status": "rejected"}).eq(
        "id", detail.guestUserId
    ).execute()

    return VipMembershipApplicationSummary(
        id=detail.id,
        guestUserId=detail.guestUserId,
        fullName=detail.fullName,
        email=detail.email,
        phone=detail.phone,
        idDocumentType=detail.idDocumentType,
        status="rejected",
        createdAt=detail.createdAt,
        idDocumentPhotoUrl=detail.idDocumentPhotoUrl,
        description=detail.description,
        professionalCardType=detail.professionalCardType,
        professionalCardPhotoUrl=detail.professionalCardPhotoUrl,
        instagramUsername=detail.instagramUsername,
        facebookUsername=detail.facebookUsername,
    )


def _require_approved_vip_member(auth: dict) -> None:
    if not profile_has_role(auth["profile"], "guest", get_supabase_admin()):
        raise ValueError("Only guest accounts can request custom VIP packages.")
    if _membership_status(auth["profile"]) != "approved":
        raise ValueError("VIP membership approval is required for custom package requests.")


def submit_vip_custom_package_request(
    auth: dict, payload: CreateVipCustomPackageRequest
) -> VipCustomPackageRequestSummary:
    _require_approved_vip_member(auth)
    if payload.travelEnd < payload.travelStart:
        raise ValueError("Travel end date must be on or after the start date.")

    user = auth["user"]
    profile = auth["profile"]
    supabase = get_supabase_admin()
    insert_row = {
        "guest_user_id": user.id,
        "guest_name": (profile.get("full_name") or user.email or "Guest").strip(),
        "guest_email": user.email or "",
        "guest_phone": payload.guestPhone or profile.get("phone"),
        "travel_start": payload.travelStart,
        "travel_end": payload.travelEnd,
        "guest_count": payload.guestCount,
        "preferences": payload.preferences,
        "status": "pending",
    }
    result = supabase.table("vip_custom_package_requests").insert(insert_row).select("id").execute()
    rows = result.data or []
    row = rows[0] if rows else None
    if not row:
        raise ValueError("Failed to submit custom package request.")

    return get_vip_custom_package_request(row["id"])


def get_vip_custom_package_request(request_id: str) -> VipCustomPackageRequestSummary:
    supabase = get_supabase_admin()
    result = (
        supabase.table("vip_custom_package_requests")
        .select("*")
        .eq("id", request_id)
        .maybe_single()
        .execute()
    )
    row = result.data if result else None
    if not row:
        raise ValueError("Custom package request not found.")
    return VipCustomPackageRequestSummary(
        id=row["id"],
        guestUserId=row["guest_user_id"],
        guestName=row["guest_name"],
        guestEmail=row["guest_email"],
        guestPhone=row.get("guest_phone"),
        travelStart=str(row.get("travel_start") or ""),
        travelEnd=str(row.get("travel_end") or ""),
        guestCount=int(row.get("guest_count") or 1),
        preferences=row.get("preferences"),
        status=row.get("status") or "pending",
        createdAt=row.get("created_at", ""),
    )


def list_vip_custom_package_requests() -> ListVipCustomPackageRequestsResponse:
    supabase = get_supabase_admin()
    result = (
        supabase.table("vip_custom_package_requests")
        .select("*")
        .in_("status", ["pending", "in_progress"])
        .order("created_at", desc=True)
        .execute()
    )
    rows = result.data or []
    return ListVipCustomPackageRequestsResponse(
        requests=[
            VipCustomPackageRequestSummary(
                id=row["id"],
                guestUserId=row["guest_user_id"],
                guestName=row["guest_name"],
                guestEmail=row["guest_email"],
                guestPhone=row.get("guest_phone"),
                travelStart=str(row.get("travel_start") or ""),
                travelEnd=str(row.get("travel_end") or ""),
                guestCount=int(row.get("guest_count") or 1),
                preferences=row.get("preferences"),
                status=row.get("status") or "pending",
                createdAt=row.get("created_at", ""),
            )
            for row in rows
        ]
    )
