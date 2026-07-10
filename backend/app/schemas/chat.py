from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime


class ChatSessionCreate(BaseModel):
    title: Optional[str] = "New Conversation"


class ChatSessionResponse(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    created_at: datetime

    class Config:
        from_attributes = True


class MessageRequest(BaseModel):
    content: str
    image_base64: Optional[str] = None


class ChatMessageResponse(BaseModel):
    id: UUID
    session_id: UUID
    role: str
    content: str
    image_url: Optional[str] = None
    metadata: Optional[dict] = None
    tokens_used: Optional[int] = None
    timestamp: datetime

    class Config:
        from_attributes = True
