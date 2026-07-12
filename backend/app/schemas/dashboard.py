from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class NextAppointment(BaseModel):
    id: str
    doctor_name: str
    specialty: Optional[str] = None
    appointment_date: datetime
    status: str

class NextMedication(BaseModel):
    id: str
    name: str
    scheduled_time: datetime
    status: str

class ActionItem(BaseModel):
    title: str
    description: str
    type: str  # "urgent", "warning", "info"
    action_url: Optional[str] = None
    action_label: Optional[str] = None

class LatestMemo(BaseModel):
    id: str
    doctor_name: str
    content: str
    created_at: datetime

class DashboardKPIsResponse(BaseModel):
    medications_today_total: int
    medications_today_taken: int
    health_score: int
    action_items: list[ActionItem]
    next_medication: Optional[NextMedication] = None
    next_appointment: Optional[NextAppointment] = None
    latest_memo: Optional[LatestMemo] = None
