from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import uuid

from app.database import get_db
from app.models.user import User
from app.middleware.rbac import require_role
from app.services import dashboard_service

router = APIRouter()


@router.get("/patients")
async def list_patients(
    provider: User = Depends(require_role("doctor", "admin")),
    db: Session = Depends(get_db)
):
    return await dashboard_service.get_patient_overview(provider, db)


@router.get("/analytics/adherence")
async def adherence_analytics(
    days: int = 30,
    provider: User = Depends(require_role("doctor", "admin")),
    db: Session = Depends(get_db)
):
    return await dashboard_service.get_adherence_analytics(provider, days, db)


@router.get("/analytics/followups")
async def followup_analytics(
    provider: User = Depends(require_role("doctor", "admin")),
    db: Session = Depends(get_db)
):
    return await dashboard_service.get_followup_stats(provider, db)


@router.get("/patients/{id}")
async def patient_detail(
    id: uuid.UUID,
    provider: User = Depends(require_role("doctor", "admin")),
    db: Session = Depends(get_db)
):
    detail = await dashboard_service.get_patient_detail(id, provider, db)
    if not detail:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")
    return detail