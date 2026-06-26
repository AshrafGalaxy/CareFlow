from sqlalchemy import Column, String, Text, Date, DateTime, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB as PG_JSONB
from sqlalchemy import JSON

# Cross-dialect JSON type
JSONVariant = JSON().with_variant(PG_JSONB, "postgresql")
from sqlalchemy.sql import func
from app.database import Base
import uuid

class Medication(Base):
    __tablename__ = "medications"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    dosage = Column(String(100))
    frequency = Column(String(100))
    times_of_day = Column(JSONVariant, default=list)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date)
    notes = Column(Text)
    is_active = Column(Boolean, default=True, index=True)

class MedicationLog(Base):
    __tablename__ = "medication_logs"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    medication_id = Column(UUID(as_uuid=True), ForeignKey("medications.id", ondelete="CASCADE"), nullable=False, index=True)
    scheduled_time = Column(DateTime(timezone=True), nullable=False, index=True)
    taken_at = Column(DateTime(timezone=True))
    status = Column(String(20))
