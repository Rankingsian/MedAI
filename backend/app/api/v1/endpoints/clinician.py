from fastapi import APIRouter, HTTPException, Query, Depends
from typing import List, Optional
from pydantic import BaseModel
from app.api.v1.schemas.clinician import (
    ClinicianSignupRequest, 
    ClinicianLoginRequest,
    ClinicianResponse,
    ClinicianProfileUpdate,
    ConsultationSummaryRequest,
    ConsultationSummaryResponse,
)
from app.services import ai_service
from app.db.firebase_utils import get_firestore_client
from datetime import datetime
import logging
from app.core.security import require_clinician

router = APIRouter(tags=["clinician"])
log = logging.getLogger(__name__)


class PatientSummary(BaseModel):
    user_id: str
    last_consultation: str
    total_consultations: int
    last_message: Optional[str] = None


class ConsultationDetail(BaseModel):
    consultation_id: str
    user_id: str
    last_updated: str
    status: str
    message_count: int
    first_message: Optional[str] = None
    triage_data: Optional[dict] = None


@router.post("/clinician/signup")
async def clinician_signup(payload: ClinicianSignupRequest):
    """Register a new clinician - Firebase Auth is handled on frontend"""
    try:
        db = get_firestore_client()
        if not db:
            raise HTTPException(status_code=500, detail="Database not available")
        
        # Note: Actual Firebase Auth user creation happens on frontend
        # This endpoint just stores additional clinician profile data
        # In production, you'd verify the Firebase Auth token here
        
        return {
            "message": "Clinician profile created. Complete signup on frontend with Firebase Auth.",
            "email": payload.email
        }
    except Exception as e:
        log.error(f"Clinician signup error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/clinician/profile")
async def create_clinician_profile(payload: ClinicianSignupRequest):
    """Create clinician profile after Firebase Auth signup"""
    try:
        db = get_firestore_client()
        if not db:
            raise HTTPException(status_code=500, detail="Database not available")
        
        # Store clinician profile
        db.collection("clinicians").document(payload.clinician_id).set({
            "uid": payload.clinician_id,
            "email": payload.email,
            "name": payload.name,
            "specialization": payload.specialization,
            "license_number": payload.license_number,
            "status": "pending",  # Requires admin approval
            "created_at": datetime.utcnow(),
            "role": "clinician"
        })
        
        return {
            "message": "Clinician profile created successfully",
            "status": "pending"
        }
    except Exception as e:
        log.error(f"Profile creation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/clinician/profile/{clinician_id}", response_model=ClinicianResponse)
async def get_clinician_profile(clinician_id: str):
    """Get clinician profile"""
    try:
        db = get_firestore_client()
        if not db:
            raise HTTPException(status_code=500, detail="Database not available")
        
        doc = db.collection("clinicians").document(clinician_id).get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Clinician not found")
        
        data = doc.to_dict()
        return ClinicianResponse(
            uid=data.get("uid", ""),
            email=data.get("email", ""),
            name=data.get("name", ""),
            specialization=data.get("specialization"),
            license_number=data.get("license_number"),
            status=data.get("status", "pending")
        )
    except HTTPException:
        raise
    except Exception as e:
        log.error(f"Get profile error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/clinician/patients", response_model=List[PatientSummary])
async def get_patients(clinician_id: str = Query(..., description="Clinician ID"), clinician=Depends(require_clinician)):
    """Get list of all patients who have had consultations"""
    try:
        db = get_firestore_client()
        if not db:
            raise HTTPException(status_code=500, detail="Database not available")
        
        # Get all consultations
        consultations_ref = db.collection("consultations")
        consultations = consultations_ref.stream()
        
        # Group by user_id
        patients = {}
        for consultation in consultations:
            data = consultation.to_dict()
            user_id = data.get("user_id")
            if not user_id:
                continue
            
            if user_id not in patients:
                patients[user_id] = {
                    "user_id": user_id,
                    "last_consultation": data.get("last_updated", datetime.utcnow()),
                    "total_consultations": 0,
                    "last_message": None
                }
            
            patients[user_id]["total_consultations"] += 1
            
            # Get first message for preview
            if not patients[user_id]["last_message"]:
                messages = db.collection("consultations").document(consultation.id).collection("messages").limit(1).stream()
                for msg in messages:
                    msg_data = msg.to_dict()
                    if msg_data.get("role") == "user":
                        patients[user_id]["last_message"] = msg_data.get("content", "")
        
        # Convert to list and sort by last consultation
        result = []
        for patient_data in patients.values():
            result.append(PatientSummary(
                user_id=patient_data["user_id"],
                last_consultation=patient_data["last_consultation"].isoformat() if isinstance(patient_data["last_consultation"], datetime) else patient_data["last_consultation"],
                total_consultations=patient_data["total_consultations"],
                last_message=patient_data["last_message"]
            ))
        
        # Sort by last consultation date (most recent first)
        result.sort(key=lambda x: x.last_consultation, reverse=True)
        
        return result
    except Exception as e:
        log.error(f"Get patients error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/clinician/patient/{user_id}/consultations", response_model=List[ConsultationDetail])
async def get_patient_consultations(user_id: str, clinician=Depends(require_clinician)):
    """Get all consultations for a specific patient"""
    try:
        db = get_firestore_client()
        if not db:
            raise HTTPException(status_code=500, detail="Database not available")
        
        # Get consultations for this user
        consultations_ref = db.collection("consultations").where("user_id", "==", user_id).order_by("last_updated", direction="DESCENDING")
        consultations = consultations_ref.stream()
        
        result = []
        for consultation in consultations:
            data = consultation.to_dict()
            consultation_id = consultation.id
            
            # Get message count
            messages_ref = db.collection("consultations").document(consultation_id).collection("messages")
            messages = list(messages_ref.stream())
            
            # Get first message
            first_message = None
            for msg in messages:
                msg_data = msg.to_dict()
                if msg_data.get("role") == "user":
                    first_message = msg_data.get("content", "")
                    break
            
            result.append(ConsultationDetail(
                consultation_id=consultation_id,
                user_id=user_id,
                last_updated=data.get("last_updated", datetime.utcnow()).isoformat(),
                status=data.get("status", "active"),
                message_count=len(messages),
                first_message=first_message,
                triage_data=data.get("triage_data")
            ))
        
        return result
    except Exception as e:
        log.error(f"Get patient consultations error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/clinician/consultation/{consultation_id}/summary", response_model=ConsultationSummaryResponse)
async def generate_consultation_summary(consultation_id: str, payload: ConsultationSummaryRequest, clinician=Depends(require_clinician)):
    """Generate an AI summary for a consultation (requires Firestore)."""
    db = get_firestore_client()
    if not db:
        raise HTTPException(status_code=503, detail="Consultation summaries require Firestore configuration")

    try:
        # Load consultation messages
        messages_ref = db.collection("consultations").document(consultation_id).collection("messages").order_by("timestamp")
        messages = list(messages_ref.stream())
        if not messages and not payload.override_messages:
            raise HTTPException(status_code=404, detail="No messages found for this consultation")

        conversation_parts = []
        for msg in messages:
            data = msg.to_dict()
            role = data.get("role", "user")
            content = data.get("content", "")
            conversation_parts.append(f"{role.upper()}: {content}")

        if payload.override_messages:
            conversation_parts.extend(payload.override_messages)

        conversation_text = "\n".join(conversation_parts)
        triage_summary = payload.triage_summary or ""
        prompt = (
            "Summarize the following patient consultation for a clinician. "
            "Highlight key symptoms, risk factors, and recommended next steps."
        )
        prompt += "\n\nPatient Consultation:\n" + conversation_text
        if triage_summary:
            prompt += "\n\nTriage Summary:\n" + triage_summary

        prompt += "\n\nProvide:\n1. Brief summary\n2. Key concerns\n3. Suggested follow-up actions"

        # Use AI service to generate summary
        try:
            ai_result = await ai_service.process_chat(
                prompt,
                triage=None,
                consultation_id=None
            )
            summary_text = ai_result.get("reply", "Summary unavailable")
            confidence = ai_result.get("confidence", 0.6)
        except Exception as e:
            log.error(f"AI summary generation failed: {e}")
            summary_text = "Unable to generate AI summary at this time."
            confidence = 0.0

        # Basic recommendation extraction (bullets or numbered list)
        recommendations = []
        for line in summary_text.splitlines():
            cleaned = line.strip("-• ")
            if cleaned.lower().startswith("recommend") or cleaned.lower().startswith("follow"):
                recommendations.append(cleaned)

        # Persist summary in Firestore
        summary_doc = {
            "summary": summary_text,
            "confidence": confidence,
            "recommendations": recommendations,
            "generated_at": datetime.utcnow(),
        }
        db.collection("consultations").document(consultation_id).set({
            "ai_summary": summary_doc
        }, merge=True)

        return ConsultationSummaryResponse(
            consultation_id=consultation_id,
            summary=summary_text,
            confidence=confidence,
            recommendations=recommendations,
            generated_at=summary_doc["generated_at"].isoformat(),
        )
    except HTTPException:
        raise
    except Exception as e:
        log.error(f"Failed to summarize consultation {consultation_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate consultation summary")


@router.post("/clinician/consultation/{consultation_id}/note")
async def add_clinical_note(
    consultation_id: str,
    clinician_id: str = Query(...),
    note: str = Query(...),
    clinician=Depends(require_clinician)
):
    """Add a clinical note to a consultation"""
    try:
        db = get_firestore_client()
        if not db:
            raise HTTPException(status_code=500, detail="Database not available")
        
        # Add note to clinical_notes subcollection
        db.collection("consultations").document(consultation_id).collection("clinical_notes").add({
            "clinician_id": clinician_id,
            "note": note,
            "timestamp": datetime.utcnow()
        })
        
        return {"message": "Note added successfully"}
    except Exception as e:
        log.error(f"Add note error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/clinician/consultation/{consultation_id}/notes")
async def get_clinical_notes(consultation_id: str, clinician=Depends(require_clinician)):
    """Get all clinical notes for a consultation"""
    try:
        db = get_firestore_client()
        if not db:
            raise HTTPException(status_code=500, detail="Database not available")
        
        notes_ref = db.collection("consultations").document(consultation_id).collection("clinical_notes").order_by("timestamp")
        notes = notes_ref.stream()
        
        result = []
        for note in notes:
            note_data = note.to_dict()
            result.append({
                "clinician_id": note_data.get("clinician_id"),
                "note": note_data.get("note"),
                "timestamp": note_data.get("timestamp", datetime.utcnow()).isoformat()
            })
        
        return result
    except Exception as e:
        log.error(f"Get notes error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
