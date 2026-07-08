from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.database import Base
import uuid

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    action = Column(String(255), nullable=False)
    resource_type = Column(String(100), nullable=False, index=True)
    ip_address = Column(String(50))
    user_agent = Column(String(255))
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)
