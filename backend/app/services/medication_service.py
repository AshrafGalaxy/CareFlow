import uuid
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.models.medication import Medication, MedicationLog
import logging

logger = logging.getLogger(__name__)

def sync_missed_medications(user_id: uuid.UUID, db: Session, days_back: int = 30):
    """
    Backfills missing MedicationLog entries with status="missed" 
    for all active medications of a user up to 1 hour ago.
    """
    now_utc = datetime.now(timezone.utc)
    cutoff = now_utc - timedelta(hours=1)
    
    active_meds = db.query(Medication).filter(
        Medication.user_id == user_id, 
        Medication.is_active == True
    ).all()

    if not active_meds:
        return

    med_ids = [m.id for m in active_meds]
    sync_start_datetime = now_utc - timedelta(days=days_back)
    
    existing_logs = db.query(MedicationLog).filter(
        MedicationLog.medication_id.in_(med_ids),
        MedicationLog.scheduled_time >= sync_start_datetime
    ).all()
    
    existing_log_set = set((str(l.medication_id), l.scheduled_time) for l in existing_logs)
    
    new_logs = []
    now_local = datetime.now()
    
    for med in active_meds:
        if not med.times_of_day:
            continue
            
        start_date = med.start_date
        # Combine to UTC aware datetime
        start_dt_utc = datetime.combine(start_date, datetime.min.time()).replace(tzinfo=timezone.utc)
        effective_start = max(start_dt_utc, sync_start_datetime)
        
        current_date = effective_start.date()
        end_date = cutoff.date()
        
        while current_date <= end_date:
            for t_str in med.times_of_day:
                try:
                    h, m_minute = map(int, t_str.split(':'))
                    # Mimic the local time construction used by scheduler
                    local_dt = now_local.replace(
                        year=current_date.year, 
                        month=current_date.month, 
                        day=current_date.day,
                        hour=h, minute=m_minute, second=0, microsecond=0
                    )
                    sched_utc = local_dt.astimezone(timezone.utc)
                    
                    if effective_start <= sched_utc <= cutoff:
                        if (str(med.id), sched_utc) not in existing_log_set:
                            new_log = MedicationLog(
                                medication_id=med.id,
                                scheduled_time=sched_utc,
                                status="missed"
                            )
                            new_logs.append(new_log)
                            existing_log_set.add((str(med.id), sched_utc))
                except Exception as e:
                    logger.error(f"Error parsing time {t_str} for medication {med.id}: {e}")
                    
            current_date += timedelta(days=1)
            
    if new_logs:
        logger.info(f"Auto-backfilling {len(new_logs)} missed medications for user {user_id}")
        db.add_all(new_logs)
        db.commit()

def sync_all_missed_medications(db: Session, days_back: int = 3):
    """
    Called by the cron job to backfill globally. Uses a smaller days_back for performance.
    """
    from app.models.user import User
    patients = db.query(User).filter(User.role == "patient", User.is_active == True).all()
    for patient in patients:
        sync_missed_medications(patient.id, db, days_back=days_back)
