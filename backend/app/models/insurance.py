from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB as PG_JSONB
from sqlalchemy import JSON

# Cross-dialect JSON type
JSONVariant = JSON().with_variant(PG_JSONB, "postgresql")
from sqlalchemy.sql import func
from app.database import Base
import uuid

class InsuranceQuery(Base):
    __tablename__ = "insurance_queries"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    query_text = Column(Text, nullable=False)
    procedure_extracted = Column(String(255))
    schemes_suggested = Column(JSONVariant, default=list)
    cost_estimate = Column(JSONVariant, default=dict)
    documents_checklist = Column(JSONVariant, default=list)
    cashless_guidance = Column(Text)
    questions_to_ask = Column(JSONVariant, default=list)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
