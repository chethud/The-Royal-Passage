from fastapi import APIRouter, HTTPException

from app.config import settings
from app.models.schemas import CitySummary
from app.services.cities import get_city_by_slug, list_active_cities

router = APIRouter(prefix="/api/v1", tags=["cities"])


@router.get("/cities", response_model=list[CitySummary])
def cities():
    if not settings.supabase_configured:
        raise HTTPException(status_code=503, detail="Supabase is not configured on the API server.")
    return list_active_cities()


@router.get("/cities/{slug}", response_model=CitySummary)
def city_detail(slug: str):
    if not settings.supabase_configured:
        raise HTTPException(status_code=503, detail="Supabase is not configured on the API server.")
    city = get_city_by_slug(slug)
    if not city:
        raise HTTPException(status_code=404, detail="City not found.")
    return city
