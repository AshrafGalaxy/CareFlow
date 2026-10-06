from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.database import get_db
from app.models.user import User
from app.middleware.auth_middleware import get_current_user
from app.schemas.checklist import ChecklistLogResponse
from app.services.checklist_service import (
    get_today_checklist,
    complete_checklist_item,
    skip_checklist_item
)

router = APIRouter()

@router.get("/today", response_model=List[ChecklistLogResponse])
def get_today_checklist_endpoint(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve today's checklist for the authenticated patient."""
    return get_today_checklist(db, current_user.id)

@router.post("/{log_id}/complete", response_model=ChecklistLogResponse)
def complete_checklist_item_endpoint(
    log_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark a checklist log item as COMPLETED."""
    updated_log = complete_checklist_item(db, log_id, current_user.id)
    if not updated_log:
        raise HTTPException(status_code=404, detail="Checklist log item not found or unauthorized")
    return updated_log

@router.post("/{log_id}/skip", response_model=ChecklistLogResponse)
def skip_checklist_item_endpoint(
    log_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark a checklist log item as SKIPPED."""
    updated_log = skip_checklist_item(db, log_id, current_user.id)
    if not updated_log:
        raise HTTPException(status_code=404, detail="Checklist log item not found or unauthorized")
    return updated_log
