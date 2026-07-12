from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.database import Base
import uuid

class ProviderProfile(Base):
    __tablename__ = "provider_profiles"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    nmc_registration_number = Column(String(50), unique=True, index=True)
    medical_council = Column(String(100))
    qualification_degree = Column(String(100))
    specialization = Column(String(100))
    hospital_affiliation = Column(String(200))
    experience_years = Column(Integer)
    contact_number = Column(String(20))
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    user = relationship("User", back_populates="provider_profile")
