from fastapi import APIRouter, Depends, HTTPException

from app.config import settings
from app.dependencies.auth import get_current_user, require_admin, require_guest, require_host
from app.models.schemas import CreateReviewRequest, HostReplyRequest, ReviewSummary
from app.services.reviews import (
    create_review,
    hide_review,
    host_reply_to_review,
    list_admin_reviews,
    list_experience_reviews,
)

router = APIRouter(prefix="/api/v1", tags=["reviews"])


@router.get("/experiences/{slug}/reviews", response_model=list[ReviewSummary])
def experience_reviews(slug: str):
    if not settings.supabase_configured:
        raise HTTPException(status_code=503, detail="Supabase is not configured on the API server.")
    return list_experience_reviews(slug)


@router.post("/reviews", response_model=ReviewSummary)
def submit_review(payload: CreateReviewRequest, auth=Depends(require_guest)):
    if not settings.supabase_configured:
        raise HTTPException(status_code=503, detail="Supabase is not configured on the API server.")
    try:
        return create_review(auth, payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/host/reviews/{review_id}/reply", response_model=ReviewSummary)
def host_review_reply(review_id: str, payload: HostReplyRequest, _auth=Depends(require_host)):
    if not settings.supabase_configured:
        raise HTTPException(status_code=503, detail="Supabase is not configured on the API server.")
    try:
        return host_reply_to_review(_auth, review_id, payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/admin/reviews", response_model=list[ReviewSummary])
def admin_reviews(_auth=Depends(require_admin)):
    if not settings.supabase_configured:
        raise HTTPException(status_code=503, detail="Supabase is not configured on the API server.")
    return list_admin_reviews()


@router.patch("/admin/reviews/{review_id}/hide", response_model=ReviewSummary)
def admin_hide_review(review_id: str, auth=Depends(require_admin)):
    if not settings.supabase_configured:
        raise HTTPException(status_code=503, detail="Supabase is not configured on the API server.")
    try:
        return hide_review(auth, review_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
