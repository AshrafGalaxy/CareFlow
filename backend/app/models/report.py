from sqlalchemy import Column, String, Text, Date, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from app.database import Base
import uuid

class Report(Base):
    __tablename__ = "reports"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    file_url = Column(Text, nullable=False)
    file_type = Column(String(50), nullable=False)
    original_filename = Column(String(255))
    ocr_text = Column(Text)
    ai_summary = Column(Text)
    ai_highlights = Column(JSONB, default=list)
    abnormal_values = Column(JSONB, default=list)
    questions_for_doctor = Column(JSONB, default=list)
    report_date = Column(Date)
    processing_status = Column(String(20), default="pending")
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
