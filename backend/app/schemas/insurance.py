from pydantic import BaseModel, ConfigDict
from typing import Optional, Any
from datetime import datetime
from uuid import UUID


class InsuranceQueryCreate(BaseModel):
    query: str
    state: Optional[str] = "Maharashtra"
    diagnosis: Optional[str] = None


class InsuranceQueryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    query_text: str
    procedure_extracted: Optional[str]
    schemes_suggested: Any
    cost_estimate: Any
    documents_checklist: Any
    cashless_guidance: Optional[str]
    questions_to_ask: Any
    created_at: datetime


class InsuranceQuerySummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    query_text: str
    procedure_extracted: Optional[str]
    created_at: datetime