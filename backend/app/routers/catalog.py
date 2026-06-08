from fastapi import APIRouter, HTTPException, Query

from app.config import settings
from app.models.schemas import CatalogResponse, ExperienceDetailResponse
from app.services.marketplace import get_catalog, get_experience_detail

router = APIRouter(prefix="/api/v1", tags=["catalog"])


@router.get("/catalog", response_model=CatalogResponse)
def catalog(city: str | None = Query(default=None, max_length=64)):
    if not settings.supabase_configured:
        raise HTTPException(status_code=503, detail="Supabase is not configured on the API server.")
    city_slug = city.strip().lower() if city else None
    return get_catalog(city_slug=city_slug)


@router.get("/experiences/{slug}", response_model=ExperienceDetailResponse)
def experience_detail(slug: str):
    if not settings.supabase_configured:
        raise HTTPException(status_code=503, detail="Supabase is not configured on the API server.")
    detail = get_experience_detail(slug)
    if not detail:
        raise HTTPException(status_code=404, detail="Experience not found.")
    return detail
