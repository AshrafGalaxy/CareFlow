from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime
import uuid

class CheckInCreate(BaseModel):
    wellness_status: str = Field(..., max_length=20)  # GOOD, OKAY, NOT_WELL, NEEDS_HELP
    mood: Optional[str] = Field(default=None, max_length=50)
    notes: Optional[str] = None
    source: str = Field(default="manual", max_length=50)

class CheckInResponse(BaseModel):
    id: uuid.UUID
    patient_id: uuid.UUID
    date: date
    wellness_status: str
    mood: Optional[str] = None
    notes: Optional[str] = None
    source: str
    created_at: datetime

    class Config:
        from_attributes = True

class CheckInHistoryResponse(BaseModel):
    checkins: List[CheckInResponse]
