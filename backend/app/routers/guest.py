from fastapi import APIRouter, Depends, HTTPException

from app.config import settings
from app.dependencies.auth import require_guest
from app.models.schemas import GuestProfile, UpdateGuestProfileRequest, WishlistItem
from app.services.guest_profile import get_guest_profile, update_guest_profile
from app.services.wishlist import add_to_wishlist, list_wishlist, remove_from_wishlist

router = APIRouter(prefix="/api/v1", tags=["guest"])


@router.get("/guest/profile", response_model=GuestProfile)
def guest_profile(_auth=Depends(require_guest)):
    if not settings.supabase_configured:
        raise HTTPException(status_code=503, detail="Supabase is not configured on the API server.")
    return get_guest_profile(_auth)


@router.patch("/guest/profile", response_model=GuestProfile)
def patch_guest_profile(payload: UpdateGuestProfileRequest, _auth=Depends(require_guest)):
    if not settings.supabase_configured:
        raise HTTPException(status_code=503, detail="Supabase is not configured on the API server.")
    try:
        return update_guest_profile(_auth, payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/wishlist", response_model=list[WishlistItem])
def get_wishlist(_auth=Depends(require_guest)):
    if not settings.supabase_configured:
        raise HTTPException(status_code=503, detail="Supabase is not configured on the API server.")
    return list_wishlist(_auth)


@router.post("/wishlist/{experience_id}", response_model=WishlistItem)
def save_wishlist_item(experience_id: str, _auth=Depends(require_guest)):
    if not settings.supabase_configured:
        raise HTTPException(status_code=503, detail="Supabase is not configured on the API server.")
    try:
        return add_to_wishlist(_auth, experience_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.delete("/wishlist/{experience_id}")
def delete_wishlist_item(experience_id: str, _auth=Depends(require_guest)):
    if not settings.supabase_configured:
        raise HTTPException(status_code=503, detail="Supabase is not configured on the API server.")
    remove_from_wishlist(_auth, experience_id)
    return {"ok": True}
