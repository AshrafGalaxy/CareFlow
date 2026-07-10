from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import date, datetime


class TimelineEventResponse(BaseModel):
    id: UUID
    user_id: UUID
    event_type: str
    event_date: date
    title: str
    description: Optional[str] = None
    reference_id: Optional[UUID] = None
    reference_table: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class TimelineListResponse(BaseModel):
    events: list[TimelineEventResponse]
    total: int


class TimelineSummaryResponse(BaseModel):
    summary: str
    last_updated: Optional[datetime] = None
