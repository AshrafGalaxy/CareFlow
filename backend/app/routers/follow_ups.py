from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import uuid

from app.database import get_db
from app.models.user import User
from app.models.follow_up import FollowUp
from app.schemas.follow_up import FollowUpCreate, FollowUpUpdate, FollowUpResponse
from app.middleware.auth_middleware import get_current_user
from app.utils.timeline_builder import add_timeline_event

router = APIRouter()


@router.get("/", response_model=list[FollowUpResponse])
def get_follow_ups(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all follow-ups for the current user."""
    return db.query(FollowUp).filter(
        FollowUp.user_id == user.id
    ).order_by(FollowUp.appointment_date.asc()).all()


@router.post("/", response_model=FollowUpResponse)
async def create_follow_up(
    body: FollowUpCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new follow-up appointment."""
    fu = FollowUp(
        user_id=user.id,
        doctor_name=body.doctor_name,
        specialty=body.specialty,
        appointment_date=body.appointment_date,
        notes=body.notes,
        status=body.status
    )
    db.add(fu)
    db.commit()
    db.refresh(fu)

    # Add to health timeline
    try:
        await add_timeline_event(
            db=db,
            user_id=str(user.id),
            event_type="followup",
            event_date=body.appointment_date.date(),
            title=f"Follow-up: {body.doctor_name or 'Doctor'}" + (f" ({body.specialty})" if body.specialty else ""),
            description=body.notes or "",
            reference_id=str(fu.id),
            reference_table="follow_ups"
        )
    except Exception as e:
        print(f"Timeline event failed for follow-up {fu.id}: {e}")

    return fu


@router.put("/{id}", response_model=FollowUpResponse)
def update_follow_up(
    id: uuid.UUID,
    body: FollowUpUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a follow-up (own only)."""
    fu = db.query(FollowUp).filter(
        FollowUp.id == id, FollowUp.user_id == user.id
    ).first()
    if not fu:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Follow-up not found")

    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(fu, field, value)

    db.commit()
    db.refresh(fu)
    return fu
