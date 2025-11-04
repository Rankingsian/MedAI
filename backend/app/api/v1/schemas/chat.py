from pydantic import BaseModel
from typing import Optional, List

class TriageData(BaseModel):
    age: Optional[int] = None
    age_group: Optional[str] = None
    gender: Optional[str] = None
    primary_symptoms: Optional[str] = None
    symptom_duration: Optional[str] = None
    temperature: Optional[str] = None
    blood_pressure: Optional[str] = None
    heart_rate: Optional[str] = None
    current_medications: Optional[List[str]] = None

class ChatRequest(BaseModel):
    message: str
    user_id: Optional[str] = None  # Firebase UID of the user
    consultation_id: Optional[str] = None
    triage: Optional[TriageData] = None

class ChatResponse(BaseModel):
    reply: str
    ai_recommend_doctor: bool
    confidence: Optional[float] = None
