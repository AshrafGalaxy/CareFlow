import os

os.makedirs('backend/app/models', exist_ok=True)
os.makedirs('backend/app/schemas', exist_ok=True)
os.makedirs('backend/app/routers', exist_ok=True)

models_code = {
    'user.py': '''from sqlalchemy import Column, String, Boolean, Date, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.database import Base
import uuid

class User(Base):
    __tablename__ = "users"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    phone = Column(String(20))
    date_of_birth = Column(Date)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
''',
    'report.py': '''from sqlalchemy import Column, String, Text, Date, DateTime, ForeignKey
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
''',
    'chat.py': '''from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.database import Base
import uuid

class ChatSession(Base):
    __tablename__ = "chat_sessions"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), default="New Conversation")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey("chat_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String(20), nullable=False)
    content = Column(Text, nullable=False)
    tokens_used = Column(Integer)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)
''',
    'medication.py': '''from sqlalchemy import Column, String, Text, Date, DateTime, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from app.database import Base
import uuid

class Medication(Base):
    __tablename__ = "medications"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    dosage = Column(String(100))
    frequency = Column(String(100))
    times_of_day = Column(JSONB, default=list)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date)
    notes = Column(Text)
    is_active = Column(Boolean, default=True, index=True)

class MedicationLog(Base):
    __tablename__ = "medication_logs"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    medication_id = Column(UUID(as_uuid=True), ForeignKey("medications.id", ondelete="CASCADE"), nullable=False, index=True)
    scheduled_time = Column(DateTime(timezone=True), nullable=False, index=True)
    taken_at = Column(DateTime(timezone=True))
    status = Column(String(20))
''',
    'follow_up.py': '''from sqlalchemy import Column, String, Text, DateTime, Boolean, ForeignKey
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
''',
    'insurance.py': '''from sqlalchemy import Column, String, Text, DateTime, ForeignKey
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
''',
    'timeline.py': '''from sqlalchemy import Column, String, Text, Date, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.database import Base
import uuid

class HealthTimelineEvent(Base):
    __tablename__ = "health_timeline_events"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    event_type = Column(String(50), nullable=False)
    event_date = Column(Date, nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    reference_id = Column(UUID(as_uuid=True))
    reference_table = Column(String(50))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
''',
    'provider.py': '''from sqlalchemy import Column, Boolean, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.database import Base
import uuid

class ProviderPatient(Base):
    __tablename__ = "provider_patients"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    provider_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    assigned_at = Column(DateTime(timezone=True), server_default=func.now())
    is_active = Column(Boolean, default=True)

    __table_args__ = (
        UniqueConstraint('provider_id', 'patient_id', name='uq_provider_patient'),
    )
''',
    '__init__.py': '''from .user import User
from .report import Report
from .chat import ChatSession, ChatMessage
from .medication import Medication, MedicationLog
from .follow_up import FollowUp
from .insurance import InsuranceQuery
from .timeline import HealthTimelineEvent
from .provider import ProviderPatient
'''
}

schemas_code = {
    'user.py': '''from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID
from datetime import date, datetime

class UserBase(BaseModel):
    email: EmailStr
    name: str
    phone: Optional[str] = None
    date_of_birth: Optional[date] = None

class UserCreate(UserBase):
    password: str
    role: str

class UserResponse(UserBase):
    id: UUID
    role: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str

class TokenPayload(BaseModel):
    sub: str
    role: str
    exp: int
''',
    'report.py': '''from pydantic import BaseModel
from typing import Optional, List, Any
from uuid import UUID
from datetime import date, datetime

class ReportBase(BaseModel):
    file_type: str
    original_filename: Optional[str] = None

class ReportCreate(ReportBase):
    user_id: UUID
    file_url: str
    processing_status: str = "pending"

class ReportResponse(ReportBase):
    id: UUID
    user_id: UUID
    file_url: str
    ocr_text: Optional[str] = None
    ai_summary: Optional[str] = None
    ai_highlights: List[Any] = []
    abnormal_values: List[Any] = []
    questions_for_doctor: List[Any] = []
    report_date: Optional[date] = None
    processing_status: str
    uploaded_at: datetime

    class Config:
        from_attributes = True
''',
    '__init__.py': '''from .user import UserCreate, UserResponse, Token, TokenPayload
from .report import ReportCreate, ReportResponse
'''
}

routers_code = {
    'auth.py': '''from fastapi import APIRouter
router = APIRouter()
''',
    'reports.py': '''from fastapi import APIRouter
router = APIRouter()
''',
    'chat.py': '''from fastapi import APIRouter
router = APIRouter()
''',
    'medications.py': '''from fastapi import APIRouter
router = APIRouter()
''',
    'follow_ups.py': '''from fastapi import APIRouter
router = APIRouter()
''',
    'insurance.py': '''from fastapi import APIRouter
router = APIRouter()
''',
    'timeline.py': '''from fastapi import APIRouter
router = APIRouter()
''',
    'dashboard.py': '''from fastapi import APIRouter
router = APIRouter()
''',
    '__init__.py': ''''''
}

for filename, content in models_code.items():
    with open(f'backend/app/models/{filename}', 'w') as f:
        f.write(content)

for filename, content in schemas_code.items():
    with open(f'backend/app/schemas/{filename}', 'w') as f:
        f.write(content)

for filename, content in routers_code.items():
    with open(f'backend/app/routers/{filename}', 'w') as f:
        f.write(content)

print("Created all models, schemas, and router stubs.")
