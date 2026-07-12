from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID
from datetime import date, datetime

class UserBase(BaseModel):
    email: EmailStr
    name: str
    phone: Optional[str] = None
    date_of_birth: Optional[date] = None
    abha_id: Optional[str] = None
    state_residence: Optional[str] = None
    preferred_locale: Optional[str] = None
    blood_group: Optional[str] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None

class UserCreate(UserBase):
    password: str
    role: str
    
    # Doctor specific fields
    nmc_registration_number: Optional[str] = None
    medical_council: Optional[str] = None
    qualification_degree: Optional[str] = None

class ProviderProfileResponse(BaseModel):
    nmc_registration_number: Optional[str] = None
    medical_council: Optional[str] = None
    qualification_degree: Optional[str] = None
    is_verified: bool

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    date_of_birth: Optional[date] = None
    abha_id: Optional[str] = None
    state_residence: Optional[str] = None
    preferred_locale: Optional[str] = None
    blood_group: Optional[str] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    # Doctor specific fields
    nmc_registration_number: Optional[str] = None
    medical_council: Optional[str] = None
    qualification_degree: Optional[str] = None

class UserResponse(UserBase):
    id: UUID
    role: str
    is_active: bool
    provider_profile: Optional[ProviderProfileResponse] = None
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
