from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID

class AppointmentBase(BaseModel):
    doctor_name: str
    appointment_date: datetime
    reason: Optional[str] = None
    status: Optional[str] = "confirmed"

class AppointmentCreate(AppointmentBase):
    pass

class AppointmentUpdate(BaseModel):
    status: Optional[str] = None
    appointment_date: Optional[datetime] = None
    reason: Optional[str] = None

class AppointmentResponse(AppointmentBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
