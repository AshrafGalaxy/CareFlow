from sqlalchemy.orm import Session
from datetime import date, datetime
from typing import List, Optional
import uuid

from app.models.checkin import DailyCheckIn
from app.schemas.checkin import CheckInCreate

VALID_WELLNESS_STATUSES = {"GOOD", "OKAY", "NOT_WELL", "NEEDS_HELP"}

def create_or_update_checkin(db: Session, patient_id: uuid.UUID, data: CheckInCreate) -> DailyCheckIn:
    if data.wellness_status not in VALID_WELLNESS_STATUSES:
        raise ValueError(f"Invalid wellness status: {data.wellness_status}. Must be one of {VALID_WELLNESS_STATUSES}")

    today = date.today()
    checkin = db.query(DailyCheckIn).filter(
        DailyCheckIn.patient_id == patient_id,
        DailyCheckIn.date == today
    ).first()

    if checkin:
        checkin.wellness_status = data.wellness_status
        checkin.mood = data.mood
        checkin.notes = data.notes
        checkin.source = data.source
    else:
        checkin = DailyCheckIn(
            patient_id=patient_id,
            date=today,
            wellness_status=data.wellness_status,
            mood=data.mood,
            notes=data.notes,
            source=data.source
        )
        db.add(checkin)

    db.commit()
    db.refresh(checkin)
    return checkin

def get_checkin_history(db: Session, patient_id: uuid.UUID, limit: int = 30) -> List[DailyCheckIn]:
    return db.query(DailyCheckIn).filter(
        DailyCheckIn.patient_id == patient_id
    ).order_by(DailyCheckIn.date.desc()).limit(limit).all()
