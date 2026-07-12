from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime


class FollowUpCreate(BaseModel):
    doctor_name: Optional[str] = None
    specialty: Optional[str] = None
    appointment_date: datetime
    notes: Optional[str] = None
    status: str = "scheduled"
    patient_id: Optional[UUID] = None


class FollowUpUpdate(BaseModel):
    doctor_name: Optional[str] = None
    specialty: Optional[str] = None
    appointment_date: Optional[datetime] = None
    notes: Optional[str] = None
    status: Optional[str] = None
    decline_reason: Optional[str] = None


class FollowUpResponse(BaseModel):
    id: UUID
    user_id: UUID
    doctor_name: Optional[str] = None
    specialty: Optional[str] = None
    appointment_date: datetime
    notes: Optional[str] = None
    status: str
    reminder_sent: bool

    class Config:
        from_attributes = True
