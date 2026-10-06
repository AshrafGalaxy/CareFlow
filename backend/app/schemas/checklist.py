from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime
import uuid

class ChecklistItemBase(BaseModel):
    title: str = Field(..., max_length=255)
    category: str = Field(default="custom", max_length=50)
    scheduled_time: Optional[str] = Field(default="08:00 AM", max_length=50)
    recurrence: str = Field(default="daily", max_length=50)
    priority: str = Field(default="normal", max_length=20)
    active: bool = True

class ChecklistItemCreate(ChecklistItemBase):
    care_episode_id: Optional[uuid.UUID] = None

class ChecklistItemResponse(ChecklistItemBase):
    id: uuid.UUID
    patient_id: uuid.UUID
    care_episode_id: Optional[uuid.UUID] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ChecklistLogResponse(BaseModel):
    id: uuid.UUID
    item_id: uuid.UUID
    patient_id: uuid.UUID
    scheduled_for: date
    completed_at: Optional[datetime] = None
    status: str  # PENDING, COMPLETED, MISSED, SKIPPED
    source: str
    item: ChecklistItemResponse

    class Config:
        from_attributes = True

class ChecklistLogUpdate(BaseModel):
    status: str
