from fastapi import APIRouter, HTTPException, Query, Depends
from typing import List, Optional
from datetime import datetime
import uuid
import hashlib

from app.api.v1.schemas.video_call import (
    VideoCallCreate,
    VideoCallResponse,
    VideoCallUpdate,
    VideoCallJoinResponse,
    VideoCallStatus,
)
from app.db.firebase_utils import get_firestore_client
from app.core.security import require_clinician

router = APIRouter(tags=["video-calls"])

# Jitsi Meet configuration
JITSI_DOMAIN = "meet.jit.si"  # Free Jitsi server


def generate_room_id(consultation_request_id: str) -> str:
    """Generate a unique, secure room ID for the video call."""
    # Create a hash-based room ID that's unique but deterministic
    timestamp = datetime.utcnow().isoformat()
    raw = f"medai-{consultation_request_id}-{timestamp}"
    hash_obj = hashlib.sha256(raw.encode())
    room_id = f"medai-{hash_obj.hexdigest()[:16]}"
    return room_id


def generate_room_url(room_id: str) -> str:
    """Generate the full Jitsi Meet URL."""
    return f"https://{JITSI_DOMAIN}/{room_id}"


def _serialize_video_call(doc) -> VideoCallResponse:
    """Serialize Firestore document to VideoCallResponse."""
    data = doc.to_dict()
    return VideoCallResponse(
        call_id=doc.id,
        room_id=data.get("room_id", ""),
        room_url=data.get("room_url", ""),
        consultation_request_id=data.get("consultation_request_id", ""),
        patient_id=data.get("patient_id", ""),
        clinician_id=data.get("clinician_id", ""),
        status=data.get("status", VideoCallStatus.scheduled.value),
        scheduled_time=data.get("scheduled_time", datetime.utcnow()).isoformat(),
        started_at=data.get("started_at").isoformat() if data.get("started_at") else None,
        ended_at=data.get("ended_at").isoformat() if data.get("ended_at") else None,
        duration_minutes=data.get("duration_minutes"),
        patient_joined=data.get("patient_joined", False),
        clinician_joined=data.get("clinician_joined", False),
        recording_enabled=data.get("recording_enabled", False),
        created_at=data.get("created_at", datetime.utcnow()).isoformat(),
        updated_at=data.get("updated_at", datetime.utcnow()).isoformat(),
    )


@router.post("/video-call/create", response_model=VideoCallResponse)
async def create_video_call(payload: VideoCallCreate):
    """
    Create a video call session when an appointment is booked.
    Automatically generates a unique Jitsi room.
    """
    db = get_firestore_client()
    if not db:
        raise HTTPException(status_code=500, detail="Database not available")

    try:
        # Generate unique room ID and URL
        room_id = generate_room_id(payload.consultation_request_id)
        room_url = generate_room_url(room_id)
        
        now = datetime.utcnow()
        
        # Create video call record
        video_call_data = {
            "room_id": room_id,
            "room_url": room_url,
            "consultation_request_id": payload.consultation_request_id,
            "patient_id": payload.patient_id,
            "clinician_id": payload.clinician_id,
            "status": VideoCallStatus.scheduled.value,
            "scheduled_time": payload.scheduled_time,
            "patient_joined": False,
            "clinician_joined": False,
            "recording_enabled": payload.recording_enabled,
            "created_at": now,
            "updated_at": now,
        }
        
        # Save to Firestore
        doc_ref = db.collection("video_calls").add(video_call_data)[0]
        
        # Update consultation request with video call info
        db.collection("consultation_requests").document(payload.consultation_request_id).update({
            "video_room_id": room_id,
            "video_room_url": room_url,
            "appointment_date": payload.scheduled_time,
            "updated_at": now,
        })
        
        # Retrieve and return the created document
        created_doc = doc_ref.get()
        return _serialize_video_call(created_doc)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create video call: {e}")


@router.get("/video-call/{call_id}", response_model=VideoCallResponse)
async def get_video_call(call_id: str):
    """Get video call details by call ID."""
    db = get_firestore_client()
    if not db:
        raise HTTPException(status_code=500, detail="Database not available")

    try:
        doc = db.collection("video_calls").document(call_id).get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Video call not found")
        
        return _serialize_video_call(doc)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch video call: {e}")


@router.get("/video-call/request/{request_id}", response_model=Optional[VideoCallResponse])
async def get_video_call_by_request(request_id: str):
    """Get video call details by consultation request ID."""
    db = get_firestore_client()
    if not db:
        raise HTTPException(status_code=500, detail="Database not available")

    try:
        query = db.collection("video_calls").where("consultation_request_id", "==", request_id).limit(1)
        docs = list(query.stream())
        
        if not docs:
            return None
        
        return _serialize_video_call(docs[0])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch video call: {e}")


@router.get("/video-call/patient/{patient_id}", response_model=List[VideoCallResponse])
async def get_patient_video_calls(patient_id: str):
    """Get all video calls for a patient."""
    db = get_firestore_client()
    if not db:
        raise HTTPException(status_code=500, detail="Database not available")

    try:
        query = (
            db.collection("video_calls")
            .where("patient_id", "==", patient_id)
            .order_by("scheduled_time", direction="DESCENDING")
        )
        docs = query.stream()
        return [_serialize_video_call(doc) for doc in docs]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch video calls: {e}")


@router.get("/video-call/clinician/{clinician_id}", response_model=List[VideoCallResponse])
async def get_clinician_video_calls(clinician_id: str):
    """Get all video calls for a clinician."""
    db = get_firestore_client()
    if not db:
        raise HTTPException(status_code=500, detail="Database not available")

    try:
        query = (
            db.collection("video_calls")
            .where("clinician_id", "==", clinician_id)
            .order_by("scheduled_time", direction="DESCENDING")
        )
        docs = query.stream()
        return [_serialize_video_call(doc) for doc in docs]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch video calls: {e}")


@router.post("/video-call/{call_id}/join", response_model=VideoCallJoinResponse)
async def join_video_call(
    call_id: str,
    user_id: str = Query(..., description="User ID joining the call"),
    user_role: str = Query(..., description="Role: patient or clinician")
):
    """
    Join a video call. Returns the room URL and updates join status.
    """
    db = get_firestore_client()
    if not db:
        raise HTTPException(status_code=500, detail="Database not available")

    try:
        doc_ref = db.collection("video_calls").document(call_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Video call not found")
        
        data = doc.to_dict()
        
        # Verify user is authorized to join
        if user_role == "patient" and data.get("patient_id") != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to join this call")
        elif user_role == "clinician" and data.get("clinician_id") != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to join this call")
        
        # Update join status
        updates = {"updated_at": datetime.utcnow()}
        
        if user_role == "patient":
            updates["patient_joined"] = True
        elif user_role == "clinician":
            updates["clinician_joined"] = True
        
        # If this is the first person joining, mark call as active
        if data.get("status") == VideoCallStatus.scheduled.value:
            updates["status"] = VideoCallStatus.active.value
            updates["started_at"] = datetime.utcnow()
        
        doc_ref.update(updates)
        
        # Get user's display name
        if user_role == "patient":
            user_doc = db.collection("users").document(user_id).get()
        else:
            user_doc = db.collection("clinicians").document(user_id).get()
        
        display_name = user_doc.to_dict().get("name", "User") if user_doc.exists else "User"
        
        return VideoCallJoinResponse(
            room_url=data.get("room_url"),
            room_id=data.get("room_id"),
            display_name=display_name,
            user_role=user_role,
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to join video call: {e}")


@router.post("/video-call/{call_id}/end", response_model=VideoCallResponse)
async def end_video_call(call_id: str):
    """End a video call and calculate duration."""
    db = get_firestore_client()
    if not db:
        raise HTTPException(status_code=500, detail="Database not available")

    try:
        doc_ref = db.collection("video_calls").document(call_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Video call not found")
        
        data = doc.to_dict()
        now = datetime.utcnow()
        
        # Calculate duration if call was started
        duration_minutes = None
        if data.get("started_at"):
            started = data.get("started_at")
            duration_seconds = (now - started).total_seconds()
            duration_minutes = int(duration_seconds / 60)
        
        # Update call status
        doc_ref.update({
            "status": VideoCallStatus.completed.value,
            "ended_at": now,
            "duration_minutes": duration_minutes,
            "updated_at": now,
        })
        
        # Update consultation request status
        db.collection("consultation_requests").document(data.get("consultation_request_id")).update({
            "status": "completed",
            "updated_at": now,
        })
        
        updated_doc = doc_ref.get()
        return _serialize_video_call(updated_doc)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to end video call: {e}")


@router.delete("/video-call/{call_id}")
async def cancel_video_call(call_id: str):
    """Cancel a scheduled video call."""
    db = get_firestore_client()
    if not db:
        raise HTTPException(status_code=500, detail="Database not available")

    try:
        doc_ref = db.collection("video_calls").document(call_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Video call not found")
        
        data = doc.to_dict()
        
        # Update status to cancelled
        doc_ref.update({
            "status": VideoCallStatus.cancelled.value,
            "updated_at": datetime.utcnow(),
        })
        
        # Update consultation request
        db.collection("consultation_requests").document(data.get("consultation_request_id")).update({
            "status": "cancelled",
            "updated_at": datetime.utcnow(),
        })
        
        return {"message": "Video call cancelled successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to cancel video call: {e}")
