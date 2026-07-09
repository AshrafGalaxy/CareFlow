from sqlalchemy import Column, Boolean, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.database import Base
import uuid


class ProviderPatient(Base):
    """
    Maps to the existing 'doctor_patients' table.
    This is an alias model that uses 'provider_id' as the field name
    instead of 'doctor_id' to match the provider dashboard terminology
    introduced in the provider-dashboard-enhancements PR.
    
    The underlying DB column is still 'doctor_id' — we use column(name=...)
    to map it transparently so no migration is required.
    """
    __tablename__ = "doctor_patients"

    # Prevent SQLAlchemy from trying to re-create the table
    # since DoctorPatient in doctor.py already manages it.
    __table_args__ = (
        UniqueConstraint('doctor_id', 'patient_id', name='uq_doctor_patient'),
        {'extend_existing': True}
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    # provider_id maps to the DB column 'doctor_id'
    provider_id = Column('doctor_id', UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    assigned_at = Column(DateTime(timezone=True), server_default=func.now())
    is_active = Column(Boolean, default=True)
