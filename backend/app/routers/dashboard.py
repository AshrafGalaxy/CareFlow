from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
import uuid

from app.database import get_db
from app.models.user import User
from app.middleware.rbac import require_role
from app.middleware.auth_middleware import get_current_user
from app.services import dashboard_service
from app.schemas.dashboard import DashboardKPIsResponse

router = APIRouter()

@router.get("/kpis", response_model=DashboardKPIsResponse)
async def get_kpis(
    patient: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return await dashboard_service.get_patient_dashboard_kpis(patient, db)

@router.get("/patients")
async def list_patients(
    doctor: User = Depends(require_role("doctor", "admin")),
    db: Session = Depends(get_db)
):
    return await dashboard_service.get_patient_overview(doctor, db)


@router.get("/analytics/adherence")
async def adherence_analytics(
    days: int = 30,
    doctor: User = Depends(require_role("doctor", "admin")),
    db: Session = Depends(get_db)
):
    return await dashboard_service.get_adherence_analytics(doctor, days, db)


@router.get("/analytics/followups")
async def followup_analytics(
    doctor: User = Depends(require_role("doctor", "admin")),
    db: Session = Depends(get_db)
):
    return await dashboard_service.get_followup_stats(doctor, db)


class AssignPatientRequest(BaseModel):
    patient_id: uuid.UUID


@router.get("/patients/unassigned")
async def list_unassigned_patients(
    provider: User = Depends(require_role("doctor", "admin")),
    db: Session = Depends(get_db)
):
    return await dashboard_service.get_unassigned_patients(provider, db)


@router.post("/patients/assign")
async def assign_patient(
    request: AssignPatientRequest,
    provider: User = Depends(require_role("doctor", "admin")),
    db: Session = Depends(get_db)
):
    success = await dashboard_service.assign_patient(provider.id, request.patient_id, db)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found or not active")
    return {"status": "success", "message": "Patient assigned successfully"}


@router.get("/patients/{id}")
async def patient_detail(
    id: uuid.UUID,
    doctor: User = Depends(require_role("doctor", "admin")),
    db: Session = Depends(get_db)
):
    detail = await dashboard_service.get_patient_detail(id, doctor, db)
    if not detail:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")
    return detail


class MemoCreate(BaseModel):
    content: str


@router.post("/patients/{id}/memos")
async def add_memo(
    id: uuid.UUID,
    memo_data: MemoCreate,
    doctor: User = Depends(require_role("doctor", "admin")),
    db: Session = Depends(get_db)
):
    memo = await dashboard_service.add_patient_memo(
        id,
        doctor,
        memo_data.content,
        db,
    )
    if not memo:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to add memo for this patient",
        )
    return memo


@router.post("/patients/{id}/remove")
async def remove_patient(
    id: uuid.UUID,
    provider: User = Depends(require_role("doctor", "admin")),
    db: Session = Depends(get_db)
):
    success = await dashboard_service.remove_patient(provider.id, id, db)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient assignment not found",
        )
    return {"status": "success", "message": "Patient removed successfully"}


@router.get("/analytics/reports")
async def list_recent_reports(
    limit: int = 5,
    provider: User = Depends(require_role("doctor", "admin")),
    db: Session = Depends(get_db)
):
    return await dashboard_service.get_recent_reports(provider, db, limit)


@router.get("/analytics/upcoming-followups")
async def list_upcoming_followups(
    limit: int = 5,
    provider: User = Depends(require_role("doctor", "admin")),
    db: Session = Depends(get_db)
):
    return await dashboard_service.get_upcoming_followups(provider, db, limit)

