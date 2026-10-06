from sqlalchemy.orm import Session
from datetime import date, datetime
from typing import List, Optional
import uuid

from app.models.checklist import DailyChecklistItem, ChecklistLog
from app.models.user import User

DEFAULT_ELDER_CHECKLIST_ITEMS = [
    {
        "title": "Morning Hydration (Glass of Water)",
        "category": "hydration",
        "scheduled_time": "08:00 AM",
        "priority": "normal"
    },
    {
        "title": "Check Morning Blood Pressure & Vitals",
        "category": "vitals",
        "scheduled_time": "09:00 AM",
        "priority": "high"
    },
    {
        "title": "Afternoon Short Walk & Light Stretch",
        "category": "exercise",
        "scheduled_time": "04:00 PM",
        "priority": "normal"
    },
    {
        "title": "Evening Relaxation & Mindful Rest",
        "category": "custom",
        "scheduled_time": "08:00 PM",
        "priority": "normal"
    }
]

def seed_default_checklist_items_if_none(db: Session, patient_id: uuid.UUID) -> List[DailyChecklistItem]:
    existing_items = db.query(DailyChecklistItem).filter(
        DailyChecklistItem.patient_id == patient_id,
        DailyChecklistItem.active == True
    ).all()

    if existing_items:
        return existing_items

    created_items = []
    for item_data in DEFAULT_ELDER_CHECKLIST_ITEMS:
        item = DailyChecklistItem(
            patient_id=patient_id,
            title=item_data["title"],
            category=item_data["category"],
            scheduled_time=item_data["scheduled_time"],
            priority=item_data["priority"],
            recurrence="daily",
            active=True
        )
        db.add(item)
        created_items.append(item)
    
    db.commit()
    for item in created_items:
        db.refresh(item)
    return created_items

def get_today_checklist(db: Session, patient_id: uuid.UUID) -> List[ChecklistLog]:
    today = date.today()
    items = seed_default_checklist_items_if_none(db, patient_id)
    
    # Check existing logs for today
    existing_logs = db.query(ChecklistLog).filter(
        ChecklistLog.patient_id == patient_id,
        ChecklistLog.scheduled_for == today
    ).all()

    logged_item_ids = {log.item_id for log in existing_logs}

    # Auto-seed logs for today for any missing active item
    new_logs = []
    for item in items:
        if item.id not in logged_item_ids:
            log = ChecklistLog(
                item_id=item.id,
                patient_id=patient_id,
                scheduled_for=today,
                status="PENDING",
                source="manual"
            )
            db.add(log)
            new_logs.append(log)

    if new_logs:
        db.commit()

    # Query all logs for today, eager loading item
    logs = db.query(ChecklistLog).filter(
        ChecklistLog.patient_id == patient_id,
        ChecklistLog.scheduled_for == today
    ).all()

    # Attach item object for schema rendering
    items_map = {item.id: item for item in db.query(DailyChecklistItem).filter(
        DailyChecklistItem.patient_id == patient_id
    ).all()}
    
    for log in logs:
        log.item = items_map.get(log.item_id)

    return logs

def complete_checklist_item(db: Session, log_id: uuid.UUID, patient_id: uuid.UUID) -> Optional[ChecklistLog]:
    log = db.query(ChecklistLog).filter(
        ChecklistLog.id == log_id,
        ChecklistLog.patient_id == patient_id
    ).first()

    if not log:
        return None

    log.status = "COMPLETED"
    log.completed_at = datetime.now()
    db.commit()
    db.refresh(log)

    item = db.query(DailyChecklistItem).filter(DailyChecklistItem.id == log.item_id).first()
    log.item = item
    return log

def skip_checklist_item(db: Session, log_id: uuid.UUID, patient_id: uuid.UUID) -> Optional[ChecklistLog]:
    log = db.query(ChecklistLog).filter(
        ChecklistLog.id == log_id,
        ChecklistLog.patient_id == patient_id
    ).first()

    if not log:
        return None

    log.status = "SKIPPED"
    db.commit()
    db.refresh(log)

    item = db.query(DailyChecklistItem).filter(DailyChecklistItem.id == log.item_id).first()
    log.item = item
    return log
