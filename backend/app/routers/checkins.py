from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.database import get_db
from app.models.user import User
from app.middleware.auth_middleware import get_current_user
from app.schemas.checkin import CheckInCreate, CheckInResponse, CheckInHistoryResponse
from app.services.checkin_service import create_or_update_checkin, get_checkin_history

router = APIRouter()

@router.post("", response_model=CheckInResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=CheckInResponse, status_code=status.HTTP_201_CREATED)
def submit_checkin_endpoint(
    checkin_data: CheckInCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Submit or update today's daily wellness check-in."""
    try:
        return create_or_update_checkin(db, current_user.id, checkin_data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/history", response_model=List[CheckInResponse])
def get_checkin_history_endpoint(
    limit: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve recent wellness check-in history for the authenticated patient."""
    return get_checkin_history(db, current_user.id, limit=limit)
