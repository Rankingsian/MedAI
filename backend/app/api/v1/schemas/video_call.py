from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum
from datetime import datetime


class VideoCallStatus(str, Enum):
    scheduled = "scheduled"
    active = "active"
    completed = "completed"
    cancelled = "cancelled"


class VideoCallCreate(BaseModel):
    consultation_request_id: str
    patient_id: str
    clinician_id: str
    scheduled_time: datetime
    recording_enabled: bool = False


class VideoCallResponse(BaseModel):
    call_id: str
    room_id: str
    room_url: str
    consultation_request_id: str
    patient_id: str
    clinician_id: str
    status: VideoCallStatus
    scheduled_time: str
    started_at: Optional[str] = None
    ended_at: Optional[str] = None
    duration_minutes: Optional[int] = None
    patient_joined: bool = False
    clinician_joined: bool = False
    recording_enabled: bool = False
    created_at: str
    updated_at: str


class VideoCallUpdate(BaseModel):
    status: Optional[VideoCallStatus] = None
    patient_joined: Optional[bool] = None
    clinician_joined: Optional[bool] = None
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None


class VideoCallJoinResponse(BaseModel):
    room_url: str
    room_id: str
    display_name: str
    user_role: str  # "patient" or "clinician"
