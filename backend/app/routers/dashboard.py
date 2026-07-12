from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
import uuid

from app.database import get_db
from app.models.user import User
from app.models.memo import PatientMemo
from app.middleware.rbac import require_role
from app.middleware.auth_middleware import get_current_user
from app.services import dashboard_service
from app.schemas.dashboard import DashboardKPIsResponse, MyDoctorResponse
from app.models.provider import ProviderPatient

router = APIRouter()

@router.get("/kpis", response_model=DashboardKPIsResponse)
async def get_kpis(
    patient: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return await dashboard_service.get_patient_dashboard_kpis(patient, db)

@router.get("/my-doctor", response_model=MyDoctorResponse)
async def get_my_doctor(
    patient: User = Depends(require_role("patient")),
    db: Session = Depends(get_db)
):
    assigned_provider = db.query(ProviderPatient).filter(
        ProviderPatient.patient_id == patient.id,
        ProviderPatient.is_active == True
    ).first()
    
    if not assigned_provider:
        raise HTTPException(status_code=404, detail="No doctor assigned to this patient.")
        
    doctor = db.query(User).filter(User.id == assigned_provider.provider_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found.")
        
    return {
        "id": str(doctor.id),
        "name": doctor.name,
        "email": doctor.email,
        "phone": doctor.phone
    }

@router.get("/memos")
async def get_patient_memos(
    patient: User = Depends(require_role("patient")),
    db: Session = Depends(get_db)
):
    memos = db.query(PatientMemo).filter(
        PatientMemo.patient_id == patient.id
    ).order_by(PatientMemo.created_at.desc()).all()
    
    result = []
    for memo in memos:
        doctor = db.query(User).filter(User.id == memo.doctor_id).first()
        if doctor:
            result.append({
                "id": str(memo.id),
                "doctor_name": doctor.name,
                "content": memo.content,
                "created_at": memo.created_at
            })
    return result

@router.get("/doctor-memos")
async def get_doctor_memos(
    doctor: User = Depends(require_role("doctor", "admin")),
    db: Session = Depends(get_db)
):
    memos = db.query(PatientMemo).filter(
        PatientMemo.doctor_id == doctor.id
    ).order_by(PatientMemo.created_at.desc()).limit(10).all()
    
    result = []
    for memo in memos:
        patient = db.query(User).filter(User.id == memo.patient_id).first()
        if patient:
            result.append({
                "id": str(memo.id),
                "patient_name": patient.name,
                "patient_id": str(patient.id),
                "content": memo.content,
                "created_at": memo.created_at
            })
    return result

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

@router.get("/requests")
async def pending_requests(
    doctor: User = Depends(require_role("doctor", "admin")),
    db: Session = Depends(get_db)
):
    from app.models.medication import Medication
    from app.models.follow_up import FollowUp
    from app.models.provider import ProviderPatient
    
    # Get all patients assigned to this doctor
    assigned_patients = db.query(ProviderPatient.patient_id).filter(
        ProviderPatient.provider_id == doctor.id,
        ProviderPatient.is_active == True
    ).all()
    patient_ids = [p[0] for p in assigned_patients]
    
    if not patient_ids:
        return {"medications": [], "follow_ups": []}
    
    # Get pending medications
    pending_meds = db.query(Medication).filter(
        Medication.user_id.in_(patient_ids),
        Medication.status == "pending"
    ).all()
    
    # Get requested follow-ups
    requested_followups = db.query(FollowUp).filter(
        FollowUp.user_id.in_(patient_ids),
        FollowUp.status == "requested"
    ).all()
    
    users = db.query(User).filter(User.id.in_(patient_ids)).all()
    user_map = {u.id: u.name for u in users}
    
    med_list = [{
        "id": str(m.id),
        "patient_name": user_map.get(m.user_id, "Unknown"),
        "patient_id": str(m.user_id),
        "name": m.name,
        "dosage": m.dosage,
        "frequency": m.frequency,
        "notes": m.notes,
        "type": "medication"
    } for m in pending_meds]
    
    fu_list = [{
        "id": str(f.id),
        "patient_name": user_map.get(f.user_id, "Unknown"),
        "patient_id": str(f.user_id),
        "appointment_date": f.appointment_date,
        "notes": f.notes,
        "type": "follow_up"
    } for f in requested_followups]
    
    return {
        "medications": med_list,
        "follow_ups": fu_list
    }

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

