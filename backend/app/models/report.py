from sqlalchemy import Column, String, Text, Date, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB as PG_JSONB
from sqlalchemy import JSON

# Cross-dialect JSON type
JSONVariant = JSON().with_variant(PG_JSONB, "postgresql")
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
    ai_highlights = Column(JSONVariant, default=list)
    abnormal_values = Column(JSONVariant, default=list)
    questions_for_doctor = Column(JSONVariant, default=list)
    report_date = Column(Date)
    processing_status = Column(String(20), default="pending")
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
