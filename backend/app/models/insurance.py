from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from app.database import Base
import uuid

class InsuranceQuery(Base):
    __tablename__ = "insurance_queries"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    query_text = Column(Text, nullable=False)
    procedure_extracted = Column(String(255))
    schemes_suggested = Column(JSONB, default=list)
    cost_estimate = Column(JSONB, default=dict)
    documents_checklist = Column(JSONB, default=list)
    cashless_guidance = Column(Text)
    questions_to_ask = Column(JSONB, default=list)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
