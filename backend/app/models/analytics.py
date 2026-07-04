from sqlalchemy import Column, Float, Integer, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.database import Base

class PatientAnalytics(Base):
    __tablename__ = "patient_analytics"

    patient_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    adherence_rate_30d = Column(Float, default=0.0)
    pending_follow_ups_count = Column(Integer, default=0)
    missed_follow_ups_count = Column(Integer, default=0)
    last_calculated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
