from sqlalchemy import Column, String, Boolean, Date, DateTime
from sqlalchemy.dialects.postgresql import UUID, JSONB as PG_JSONB
from sqlalchemy.sql import func
from sqlalchemy import JSON
from app.database import Base
import uuid

JSONVariant = JSON().with_variant(PG_JSONB, "postgresql")

class User(Base):
    __tablename__ = "users"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    phone = Column(String(20))
    date_of_birth = Column(Date)
    abha_id = Column(String(20), unique=True, index=True)
    state_residence = Column(String(100))
    preferred_locale = Column(String(10), default="en")
    blood_group = Column(String(5))
    emergency_contact_name = Column(String(255))
    emergency_contact_phone = Column(String(20))
    is_active = Column(Boolean, default=True)
    push_subscription = Column(JSONVariant, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
