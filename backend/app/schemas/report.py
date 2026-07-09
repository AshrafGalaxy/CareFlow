from pydantic import BaseModel
from typing import Optional, List, Any
from uuid import UUID
from datetime import date, datetime

class ReportBase(BaseModel):
    file_type: str
    original_filename: Optional[str] = None

class ReportCreate(ReportBase):
    user_id: UUID
    file_url: str
    processing_status: str = "pending"

class ReportResponse(ReportBase):
    id: UUID
    user_id: UUID
    file_url: str
    ocr_text: Optional[str] = None
    ai_summary: Optional[str] = None
    ai_highlights: Optional[List[Any]] = []
    actionable_insights: Optional[List[Any]] = []
    abnormal_values: Optional[List[Any]] = []
    questions_for_doctor: Optional[List[Any]] = []
    report_date: Optional[date] = None
    processing_status: str
    processing_progress: str | None = None
    uploaded_at: datetime

    class Config:
        from_attributes = True
