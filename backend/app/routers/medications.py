from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta, timezone
from typing import Optional
import uuid

from app.database import get_db
from app.models.user import User
from app.models.medication import Medication, MedicationLog
from app.schemas.medication import (
    MedicationCreate, MedicationUpdate, MedicationResponse,
    MedicationLogCreate, MedicationLogUpdate, MedicationLogResponse,
    AdherenceResponse, AdherenceByMedication
)
from app.middleware.auth_middleware import get_current_user
from app.ai.vector_store import embed_medication
from app.utils.timeline_builder import add_timeline_event
from datetime import date

router = APIRouter()


@router.post("/", response_model=MedicationResponse)
async def create_medication(
    body: MedicationCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new medication, embed into FAISS, add timeline event."""
    med = Medication(
        user_id=user.id,
        name=body.name,
        dosage=body.dosage,
        frequency=body.frequency,
        times_of_day=body.times_of_day,
        start_date=body.start_date,
        end_date=body.end_date,
        notes=body.notes,
        is_active=True
    )
    db.add(med)
    db.commit()
    db.refresh(med)

    # Embed into patient FAISS vector store
    try:
        await embed_medication(
            user_id=str(user.id),
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
            user_id=str(user.id),
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
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all medications for this user, active ones first."""
    meds = db.query(Medication).filter(
        Medication.user_id == user.id
    ).order_by(Medication.is_active.desc(), Medication.start_date.desc()).all()
    return meds


@router.get("/adherence", response_model=AdherenceResponse)
def get_adherence(
    days: int = 30,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Calculate medication adherence for the last N days."""
    now_utc = datetime.now(timezone.utc)
    cutoff = now_utc - timedelta(days=days)

    # Get all user medications
    user_meds = db.query(Medication).filter(Medication.user_id == user.id).all()
    med_ids = [m.id for m in user_meds]

    if not med_ids:
        return AdherenceResponse(
            total_doses=0, taken=0, missed=0, skipped=0,
            adherence_rate=0.0, by_medication=[]
        )

    # Get logs for these medications in the time window
    logs = db.query(MedicationLog).filter(
        MedicationLog.medication_id.in_(med_ids),
        MedicationLog.scheduled_time >= cutoff
    ).all()

    # Breakdown by medication
    by_med: dict[str, dict] = {}
    for m in user_meds:
        mid = str(m.id)
        
        # Calculate expected historical doses for this medication dynamically
        # Start from the later of (start_date, cutoff.date())
        # End at today.date()
        m_start = m.start_date
        c_start = cutoff.date()
        effective_start = max(m_start, c_start)
        
        m_end = m.end_date if m.end_date else now_utc.date()
        effective_end = min(m_end, now_utc.date())
        
        expected_doses = 0
        if effective_start <= effective_end:
            days_active = (effective_end - effective_start).days + 1
            daily_doses = len(m.times_of_day or [])
            expected_doses = days_active * daily_doses
            
        by_med[mid] = {"total": expected_doses, "taken": 0, "missed": 0, "skipped": 0, "med": m}

    for log in logs:
        mid = str(log.medication_id)
        if mid in by_med:
            # Only count statuses towards actuals
            if log.status in ["taken", "missed", "skipped"]:
                by_med[mid][log.status] = by_med[mid].get(log.status, 0) + 1

    total = sum(d["total"] for d in by_med.values())
    taken = sum(d["taken"] for d in by_med.values())
    missed = sum(d["missed"] for d in by_med.values())
    skipped = sum(d["skipped"] for d in by_med.values())
    
    # If the user has "missed" logs but we want to infer missed from total:
    # A user might not click "missed", so inferred missed = total - taken - skipped
    inferred_missed = max(0, total - taken - skipped)
    
    adherence_rate = round((taken / total * 100), 1) if total > 0 else 0.0

    by_medication = []
    for mid, counts in by_med.items():
        med_obj = counts["med"]
        t = counts["total"]
        tak = counts.get("taken", 0)
        skip = counts.get("skipped", 0)
        # Infer missed for the individual medication
        inf_miss = max(0, t - tak - skip)
        by_medication.append(AdherenceByMedication(
            medication_id=mid,
            medication_name=med_obj.name if med_obj else "Unknown",
            total=t,
            taken=tak,
            missed=inf_miss,
            skipped=skip,
            adherence_rate=round((tak / t * 100), 1) if t > 0 else 0.0
        ))

    return AdherenceResponse(
        total_doses=total,
        taken=taken,
        missed=missed,
        skipped=skipped,
        adherence_rate=adherence_rate,
        by_medication=by_medication
    )


@router.get("/logs/all", response_model=list[MedicationLogResponse])
def get_all_medication_logs(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all logs for all user medications."""
    # Get all user medications
    user_meds = db.query(Medication).filter(Medication.user_id == user.id).all()
    med_ids = [m.id for m in user_meds]

    if not med_ids:
        return []

    logs = db.query(MedicationLog).filter(
        MedicationLog.medication_id.in_(med_ids)
    ).order_by(MedicationLog.scheduled_time.desc()).all()
    
    return logs


@router.get("/{id}", response_model=MedicationResponse)
def get_medication(
    id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a single medication."""
    med = db.query(Medication).filter(
        Medication.id == id, Medication.user_id == user.id
    ).first()
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
    """Update a medication (own only)."""
    med = db.query(Medication).filter(
        Medication.id == id, Medication.user_id == user.id
    ).first()
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
    med = db.query(Medication).filter(
        Medication.id == id, Medication.user_id == user.id
    ).first()
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
    med = db.query(Medication).filter(
        Medication.id == id, Medication.user_id == user.id
    ).first()
    if not med:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Medication not found")

    now_utc = datetime.now(timezone.utc)
    log = MedicationLog(
        medication_id=id,
        scheduled_time=now_utc,
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
    db.refresh(log)
    db.refresh(log)
    return log
