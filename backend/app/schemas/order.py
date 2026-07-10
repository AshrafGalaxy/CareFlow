from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID

class OrderBase(BaseModel):
    medication_name: str
    quantity: str
    price: float
    address: Optional[str] = None
    status: Optional[str] = "processing"

class OrderCreate(OrderBase):
    pass

class OrderUpdate(BaseModel):
    status: Optional[str] = None
    address: Optional[str] = None

class OrderResponse(OrderBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
