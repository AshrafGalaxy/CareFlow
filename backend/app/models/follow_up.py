from sqlalchemy import Column, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.database import Base
import uuid

class FollowUp(Base):
    __tablename__ = "follow_ups"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    doctor_name = Column(String(255))
    specialty = Column(String(100))
    appointment_date = Column(DateTime(timezone=True), nullable=False, index=True)
    notes = Column(Text)
    status = Column(String(20), default="scheduled")
    reminder_sent = Column(Boolean, default=False)
