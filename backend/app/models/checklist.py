from sqlalchemy import Column, String, Text, Date, DateTime, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.database import Base
import uuid

class DailyChecklistItem(Base):
    __tablename__ = "daily_checklist_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    care_episode_id = Column(UUID(as_uuid=True), nullable=True)
    title = Column(String(255), nullable=False)
    category = Column(String(50), default="custom")
    scheduled_time = Column(String(50), nullable=True)
    recurrence = Column(String(50), default="daily")
    priority = Column(String(20), default="normal")
    active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class ChecklistLog(Base):
    __tablename__ = "checklist_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    item_id = Column(UUID(as_uuid=True), ForeignKey("daily_checklist_items.id", ondelete="CASCADE"), nullable=False, index=True)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    scheduled_for = Column(Date, nullable=False, index=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    status = Column(String(20), default="PENDING", index=True)  # PENDING, COMPLETED, MISSED, SKIPPED
    source = Column(String(50), default="manual")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
