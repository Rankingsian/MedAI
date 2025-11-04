from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class ConsultationUrgency(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"


class ConsultationStatus(str, Enum):
    pending = "pending"
    assigned = "assigned"
    in_progress = "in_progress"
    completed = "completed"
    cancelled = "cancelled"


class ConsultationRequestCreate(BaseModel):
    user_id: str
    consultation_id: Optional[str] = None
    summary: str = Field(..., description="Short description of the patient's concern")
    details: Optional[str] = Field(None, description="Additional context or questions for the doctor")
    urgency: ConsultationUrgency = ConsultationUrgency.medium


class ConsultationRequestResponse(BaseModel):
    request_id: str
    user_id: str
    clinician_id: Optional[str] = None
    consultation_id: Optional[str] = None
    summary: str
    details: Optional[str]
    urgency: ConsultationUrgency
    status: ConsultationStatus
    created_at: str
    updated_at: str


class ConsultationRequestUpdate(BaseModel):
    status: Optional[ConsultationStatus] = None
    clinician_id: Optional[str] = None
    notes: Optional[str] = None
