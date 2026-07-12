from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta, timezone
from typing import Optional
import uuid

from app.database import get_db
from app.models.user import User
from app.models.medication import Medication, MedicationLog
from app.models.provider import ProviderPatient
from app.schemas.medication import (
    MedicationCreate, MedicationUpdate, MedicationResponse,
    MedicationLogCreate, MedicationLogUpdate, MedicationLogResponse,
    AdherenceResponse, AdherenceByMedication
)
from app.middleware.auth_middleware import get_current_user
from app.ai.vector_store import embed_medication
from app.utils.timeline_builder import add_timeline_event
from app.services.medication_service import sync_missed_medications
from datetime import date

router = APIRouter()


@router.post("/{id}/approve", response_model=MedicationResponse)
def approve_medication(
    id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if user.role not in ["doctor", "admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    med = db.query(Medication).filter(Medication.id == id).first()
    if not med:
        raise HTTPException(status_code=404, detail="Medication not found")
    # Verify doctor is assigned
    if user.role != "admin":
        is_assigned = db.query(ProviderPatient).filter(
            ProviderPatient.provider_id == user.id,
            ProviderPatient.patient_id == med.user_id,
            ProviderPatient.is_active == True
        ).first()
        if not is_assigned:
            raise HTTPException(status_code=403, detail="Patient not assigned")
    
    med.status = "active"
    med.is_active = True
    db.commit()
    db.refresh(med)
    return med


@router.post("/{id}/reject", response_model=MedicationResponse)
def reject_medication(
    id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if user.role not in ["doctor", "admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    med = db.query(Medication).filter(Medication.id == id).first()
    if not med:
        raise HTTPException(status_code=404, detail="Medication not found")
    if user.role != "admin":
        is_assigned = db.query(ProviderPatient).filter(
            ProviderPatient.provider_id == user.id,
            ProviderPatient.patient_id == med.user_id,
            ProviderPatient.is_active == True
        ).first()
        if not is_assigned:
            raise HTTPException(status_code=403, detail="Patient not assigned")
    
    med.status = "rejected"
    med.is_active = False
    db.commit()
    db.refresh(med)
    return med


def get_medication_for_user(medication_id: uuid.UUID, user: User, db: Session):
    med = db.query(Medication).filter(Medication.id == medication_id).first()
    if not med:
        return None
    if user.role == "admin":
        return med
    if user.id == med.user_id:
        return med
    if user.role == "doctor":
        is_assigned = db.query(ProviderPatient).filter(
            ProviderPatient.provider_id == user.id,
            ProviderPatient.patient_id == med.user_id,
            ProviderPatient.is_active == True
        ).first()
        if is_assigned:
            return med
    return None


@router.post("/", response_model=MedicationResponse)
async def create_medication(
    body: MedicationCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new medication, embed into FAISS, add timeline event."""
    target_user_id = user.id
    if body.patient_id:
        if user.role not in ["doctor", "admin"]:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to create medication for patient")
        if user.role != "admin":
            is_assigned = db.query(ProviderPatient).filter(
                ProviderPatient.provider_id == user.id,
                ProviderPatient.patient_id == body.patient_id,
                ProviderPatient.is_active == True
            ).first()
            if not is_assigned:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Patient not assigned to this provider")
        target_user_id = body.patient_id

    med_status = "active"
    med_active = True
    if user.role == "patient":
        med_status = "pending"
        med_active = False

    med = Medication(
        user_id=target_user_id,
        name=body.name,
        dosage=body.dosage,
        frequency=body.frequency,
        times_of_day=body.times_of_day,
        start_date=body.start_date,
        end_date=body.end_date,
        notes=body.notes,
        is_active=med_active,
        status=med_status
    )
    db.add(med)
    db.commit()
    db.refresh(med)

    # Embed into patient FAISS vector store
    try:
        await embed_medication(
            user_id=str(target_user_id),
            medication_name=body.name,
            dosage=body.dosage or "",
            frequency=body.frequency or "",
            medication_id=str(med.id)
        )
    except Exception as e:
        print(f"FAISS embed failed for medication {med.id}: {e}")

    # Add timeline event
    try:
        await add_timeline_event(
            db=db,
            user_id=str(target_user_id),
            event_type="medication",
            event_date=body.start_date,
            title=f"Medication Added: {body.name}",
            description=f"{body.name} {body.dosage or ''} — {body.frequency or ''}".strip(" —"),
            reference_id=str(med.id),
            reference_table="medications"
        )
    except Exception as e:
        print(f"Timeline event failed for medication {med.id}: {e}")

    return med


@router.get("/", response_model=list[MedicationResponse])
def get_medications(
    patient_id: Optional[uuid.UUID] = None,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all medications for this user, active ones first."""
    target_user_id = user.id
    if patient_id:
        if user.role not in ["doctor", "admin"]:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
        if user.role == "doctor":
            is_assigned = db.query(ProviderPatient).filter(
                ProviderPatient.provider_id == user.id,
                ProviderPatient.patient_id == patient_id,
                ProviderPatient.is_active == True
            ).first()
            if not is_assigned:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Patient not assigned")
        target_user_id = patient_id

    meds = db.query(Medication).filter(
        Medication.user_id == target_user_id
    ).order_by(Medication.is_active.desc(), Medication.start_date.desc()).all()
    return meds


@router.get("/adherence", response_model=AdherenceResponse)
def get_adherence(
    days: int = 30,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Calculate medication adherence for the last N days."""
    # Ensure logs are synced before calculating
    sync_missed_medications(user.id, db, days_back=days)
    
    now_utc = datetime.now(timezone.utc)
    cutoff = now_utc - timedelta(days=days)

    user_meds = db.query(Medication).filter(Medication.user_id == user.id).all()
    med_ids = [m.id for m in user_meds]

    if not med_ids:
        return AdherenceResponse(
            total_doses=0, taken=0, missed=0, skipped=0,
            adherence_rate=0.0, by_medication=[]
        )

    logs = db.query(MedicationLog).filter(
        MedicationLog.medication_id.in_(med_ids),
        MedicationLog.scheduled_time >= cutoff
    ).all()

    by_med: dict[str, dict] = {}
    for m in user_meds:
        by_med[str(m.id)] = {"taken": 0, "missed": 0, "skipped": 0, "med": m}

    for log in logs:
        mid = str(log.medication_id)
        if mid in by_med and log.status in ["taken", "missed", "skipped"]:
            by_med[mid][log.status] += 1

    total = taken = missed = skipped = 0
    by_medication = []
    
    for mid, counts in by_med.items():
        med_obj = counts["med"]
        tak = counts["taken"]
        miss = counts["missed"]
        skip = counts["skipped"]
        t = tak + miss + skip
        
        total += t
        taken += tak
        missed += miss
        skipped += skip
        
        adherence_rate = round((tak / t * 100), 1) if t > 0 else 0.0
        by_medication.append(AdherenceByMedication(
            medication_id=mid,
            medication_name=med_obj.name,
            total=t,
            taken=tak,
            missed=miss,
            skipped=skip,
            adherence_rate=adherence_rate
        ))

    overall_adherence_rate = round((taken / total * 100), 1) if total > 0 else 0.0

    return AdherenceResponse(
        total_doses=total,
        taken=taken,
        missed=missed,
        skipped=skipped,
        adherence_rate=overall_adherence_rate,
        by_medication=by_medication
    )


@router.get("/logs/all", response_model=list[MedicationLogResponse])
def get_all_medication_logs(
    patient_id: Optional[uuid.UUID] = None,
    days: Optional[int] = 30,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get logs for all user medications."""
    target_user_id = user.id
    if patient_id:
        if user.role not in ["doctor", "admin"]:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
        if user.role == "doctor":
            is_assigned = db.query(ProviderPatient).filter(
                ProviderPatient.provider_id == user.id,
                ProviderPatient.patient_id == patient_id,
                ProviderPatient.is_active == True
            ).first()
            if not is_assigned:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Patient not assigned")
        target_user_id = patient_id

    # Get all user medications
    user_meds = db.query(Medication).filter(Medication.user_id == target_user_id).all()
    med_ids = [m.id for m in user_meds]

    if not med_ids:
        return []

    query = db.query(MedicationLog).filter(
        MedicationLog.medication_id.in_(med_ids)
    )
    
    if days and days > 0:
        now_utc = datetime.now(timezone.utc)
        cutoff = now_utc - timedelta(days=days)
        query = query.filter(MedicationLog.scheduled_time >= cutoff)

    logs = query.order_by(MedicationLog.scheduled_time.desc()).all()
    
    return logs


@router.get("/{id}", response_model=MedicationResponse)
def get_medication(
    id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a single medication."""
    med = get_medication_for_user(id, user, db)
    if not med:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Medication not found")
    return med


@router.put("/{id}", response_model=MedicationResponse)
def update_medication(
    id: uuid.UUID,
    body: MedicationUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a medication (own or assigned patient)."""
    med = get_medication_for_user(id, user, db)
    if not med:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Medication not found")

    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(med, field, value)

    db.commit()
    db.refresh(med)
    return med


@router.delete("/{id}")
def delete_medication(
    id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Soft-delete a medication (set is_active=False)."""
    med = get_medication_for_user(id, user, db)
    if not med:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Medication not found")

    med.is_active = False
    db.commit()
    return {"message": "deleted"}


@router.post("/{id}/log", response_model=MedicationLogResponse)
def log_medication(
    id: uuid.UUID,
    body: MedicationLogCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Log a medication dose (taken/missed/skipped)."""
    med = get_medication_for_user(id, user, db)
    if not med:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Medication not found")

    now_utc = datetime.now(timezone.utc)
    
    # Check if a log already exists for this exact scheduled time to prevent duplicates
    existing_log = db.query(MedicationLog).filter(
        MedicationLog.medication_id == id,
        MedicationLog.scheduled_time == body.scheduled_time
    ).first()

    if existing_log:
        existing_log.status = body.status
        existing_log.taken_at = body.taken_at or (now_utc if body.status == "taken" else None)
        db.commit()
        db.refresh(existing_log)
        return existing_log

    log = MedicationLog(
        medication_id=id,
        scheduled_time=body.scheduled_time,
        taken_at=body.taken_at or (now_utc if body.status == "taken" else None),
        status=body.status
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


@router.get("/{id}/logs", response_model=list[MedicationLogResponse])
def get_medication_logs(
    id: uuid.UUID,
    limit: int = 30,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get recent logs for a specific medication."""
    med = db.query(Medication).filter(
        Medication.id == id, Medication.user_id == user.id
    ).first()
    if not med:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Medication not found")

    logs = db.query(MedicationLog).filter(
        MedicationLog.medication_id == id
    ).order_by(MedicationLog.scheduled_time.desc()).limit(limit).all()
    
    return logs


@router.put("/logs/{log_id}", response_model=MedicationLogResponse)
def update_medication_log(
    log_id: uuid.UUID,
    body: MedicationLogUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a specific medication log (e.g., change missed to taken)."""
    log = db.query(MedicationLog).join(Medication).filter(
        MedicationLog.id == log_id,
        Medication.user_id == user.id
    ).first()
    
    if not log:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Log not found")

    log.status = body.status
    if body.status == "taken" and not log.taken_at:
        log.taken_at = datetime.now(timezone.utc)
    elif body.status != "taken":
        log.taken_at = None

    db.commit()
    db.commit()
    db.refresh(log)
    return log

@router.delete("/logs/{log_id}")
def delete_medication_log(
    log_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a specific medication log (Undo action)."""
    log = db.query(MedicationLog).join(Medication).filter(
        MedicationLog.id == log_id,
        Medication.user_id == user.id
    ).first()
    
    if not log:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Log not found")

    db.delete(log)
    db.commit()
    return {"message": "log deleted"}
