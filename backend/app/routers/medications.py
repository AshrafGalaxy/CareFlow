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
    MedicationLogCreate, MedicationLogResponse,
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


@router.get("/adherence", response_model=AdherenceResponse)
def get_adherence(
    days: int = 30,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Calculate medication adherence for the last N days."""
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)

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

    total = len(logs)
    taken = sum(1 for l in logs if l.status == "taken")
    missed = sum(1 for l in logs if l.status == "missed")
    skipped = sum(1 for l in logs if l.status == "skipped")
    adherence_rate = round((taken / total * 100), 1) if total > 0 else 0.0

    # Breakdown by medication
    med_map = {str(m.id): m for m in user_meds}
    by_med: dict[str, dict] = {}
    for log in logs:
        mid = str(log.medication_id)
        if mid not in by_med:
            by_med[mid] = {"total": 0, "taken": 0, "missed": 0, "skipped": 0}
        by_med[mid]["total"] += 1
        by_med[mid][log.status] = by_med[mid].get(log.status, 0) + 1

    by_medication = []
    for mid, counts in by_med.items():
        med_obj = med_map.get(mid)
        t = counts["total"]
        tak = counts.get("taken", 0)
        by_medication.append(AdherenceByMedication(
            medication_id=mid,
            medication_name=med_obj.name if med_obj else "Unknown",
            total=t,
            taken=tak,
            missed=counts.get("missed", 0),
            skipped=counts.get("skipped", 0),
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
