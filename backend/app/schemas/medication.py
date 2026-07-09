from pydantic import BaseModel
from typing import Optional, List, Any
from uuid import UUID
from datetime import date, datetime


class MedicationCreate(BaseModel):
    name: str
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    times_of_day: List[str] = []
    start_date: date
    end_date: Optional[date] = None
    notes: Optional[str] = None

    hospital_notes: Optional[str] = None
    previous_dosage: Optional[str] = None

    patient_id: Optional[UUID] = None



class MedicationUpdate(BaseModel):
    name: Optional[str] = None
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    times_of_day: Optional[List[str]] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    notes: Optional[str] = None
    hospital_notes: Optional[str] = None
    previous_dosage: Optional[str] = None
    is_active: Optional[bool] = None


class MedicationResponse(BaseModel):
    id: UUID
    user_id: UUID
    name: str
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    times_of_day: List[Any] = []
    start_date: date
    end_date: Optional[date] = None
    notes: Optional[str] = None
    hospital_notes: Optional[str] = None
    previous_dosage: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True


class MedicationLogCreate(BaseModel):
    status: str  # "taken" | "missed" | "skipped"
    taken_at: Optional[datetime] = None


class MedicationLogUpdate(BaseModel):
    status: str
    taken_at: Optional[datetime] = None


class MedicationLogResponse(BaseModel):
    id: UUID
    medication_id: UUID
    scheduled_time: datetime
    taken_at: Optional[datetime] = None
    status: str

    class Config:
        from_attributes = True


class AdherenceByMedication(BaseModel):
    medication_id: str
    medication_name: str
    total: int
    taken: int
    missed: int
    skipped: int
    adherence_rate: float


class AdherenceResponse(BaseModel):
    total_doses: int
    taken: int
    missed: int
    skipped: int
    adherence_rate: float
    by_medication: List[AdherenceByMedication] = []
