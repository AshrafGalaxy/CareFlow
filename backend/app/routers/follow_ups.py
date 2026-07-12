from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import uuid

from app.database import get_db
from app.models.user import User
from app.models.follow_up import FollowUp
from app.models.provider import ProviderPatient
from app.models.memo import PatientMemo
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

@router.post("/{id}/confirm", response_model=FollowUpResponse)
def confirm_follow_up(id: uuid.UUID, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    fu = db.query(FollowUp).filter(FollowUp.id == id).first()
    if not fu:
        raise HTTPException(status_code=404, detail="Follow-up not found")
    if user.role == "patient" and fu.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    fu.status = "confirmed"
    db.commit()
    db.refresh(fu)
    return fu

@router.post("/{id}/decline", response_model=FollowUpResponse)
def decline_follow_up(id: uuid.UUID, body: FollowUpUpdate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    fu = db.query(FollowUp).filter(FollowUp.id == id).first()
    if not fu:
        raise HTTPException(status_code=404, detail="Follow-up not found")
    if user.role == "patient" and fu.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    fu.status = "declined"
    
    if body.decline_reason:
        # Create a PatientMemo for the doctor
        provider = db.query(ProviderPatient).filter(ProviderPatient.patient_id == fu.user_id, ProviderPatient.is_active == True).first()
        if provider:
            memo = PatientMemo(
                doctor_id=provider.provider_id,
                patient_id=fu.user_id,
                content=f"Follow-up scheduled on {fu.appointment_date.strftime('%Y-%m-%d')} was declined. Reason: {body.decline_reason}"
            )
            db.add(memo)
    
    db.commit()
    db.refresh(fu)
    return fu


@router.post("/", response_model=FollowUpResponse)
async def create_follow_up(
    body: FollowUpCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new follow-up appointment."""
    target_user_id = user.id
    if body.patient_id:
        if user.role not in ["doctor", "admin"]:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to schedule follow-up for patient")
        if user.role != "admin":
            is_assigned = db.query(ProviderPatient).filter(
                ProviderPatient.provider_id == user.id,
                ProviderPatient.patient_id == body.patient_id,
                ProviderPatient.is_active == True
            ).first()
            if not is_assigned:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Patient not assigned to this provider")
        target_user_id = body.patient_id

    fu_status = "scheduled"
    if user.role == "patient":
        fu_status = "requested"

    fu = FollowUp(
        user_id=target_user_id,
        doctor_name=body.doctor_name,
        specialty=body.specialty,
        appointment_date=body.appointment_date,
        notes=body.notes,
        status=fu_status
    )
    db.add(fu)
    db.commit()
    db.refresh(fu)

    # Add to health timeline
    try:
        await add_timeline_event(
            db=db,
            user_id=str(target_user_id),
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
