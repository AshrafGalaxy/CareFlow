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

from pydantic import BaseModel
class MemoCreate(BaseModel):
    content: str

@router.post("/patients/{id}/memos")
async def add_memo(
    id: uuid.UUID,
    memo_data: MemoCreate,
    doctor: User = Depends(require_role("doctor", "admin")),
    db: Session = Depends(get_db)
):
    memo = await dashboard_service.add_patient_memo(id, doctor, memo_data.content, db)
    if not memo:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to add memo for this patient")
    return memo