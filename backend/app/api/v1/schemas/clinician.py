from pydantic import BaseModel, EmailStr
from typing import Optional, List

class ClinicianSignupRequest(BaseModel):
    clinician_id: str
    email: EmailStr
    password: str
    name: str
    specialization: Optional[str] = None
    license_number: Optional[str] = None

class ClinicianLoginRequest(BaseModel):
    email: EmailStr
    password: str

class ConsultationDetail(BaseModel):
    consultation_id: str
    user_id: str
    last_updated: str
    status: str
    message_count: int
    first_message: Optional[str] = None
    triage_data: Optional[dict] = None

class ConsultationSummaryRequest(BaseModel):
    override_messages: Optional[List[str]] = None
    triage_summary: Optional[str] = None


class ConsultationSummaryResponse(BaseModel):
    consultation_id: str
    summary: str
    confidence: float
    recommendations: List[str] = []
    generated_at: str

class ClinicianResponse(BaseModel):
    uid: str
    email: str
    name: str
    specialization: Optional[str] = None
    license_number: Optional[str] = None
    status: str = "pending"  # pending, approved, suspended

class ClinicianProfileUpdate(BaseModel):
    name: Optional[str] = None
    specialization: Optional[str] = None
    license_number: Optional[str] = None
