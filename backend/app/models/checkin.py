from sqlalchemy import Column, String, Text, Date, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.database import Base
import uuid

class DailyCheckIn(Base):
    __tablename__ = "daily_checkins"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)
    wellness_status = Column(String(20), nullable=False)  # GOOD, OKAY, NOT_WELL, NEEDS_HELP
    mood = Column(String(50), nullable=True)
    notes = Column(Text, nullable=True)
    source = Column(String(50), default="manual")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        UniqueConstraint('patient_id', 'date', name='uq_patient_daily_checkin'),
    )
