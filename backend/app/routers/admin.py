from fastapi import APIRouter, Depends, HTTPException

from app.config import settings
from app.dependencies.auth import require_admin
from app.models.schemas import CreateHostRequest, CreateHostResponse, ManagedUser
from app.services.admin_users import create_host_account, list_managed_users

router = APIRouter(prefix="/api/v1/admin", tags=["admin"])


@router.get("/users", response_model=list[ManagedUser])
def admin_users(_auth=Depends(require_admin)):
    if not settings.supabase_configured:
        raise HTTPException(status_code=503, detail="Supabase is not configured on the API server.")
    return list_managed_users()


@router.post("/hosts", response_model=CreateHostResponse)
def admin_create_host(payload: CreateHostRequest, _auth=Depends(require_admin)):
    if not settings.supabase_configured:
        raise HTTPException(status_code=503, detail="Supabase is not configured on the API server.")
    try:
        return create_host_account(payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
