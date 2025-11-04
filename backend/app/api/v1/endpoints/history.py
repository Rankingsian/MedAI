from fastapi import APIRouter, HTTPException, Query, Depends
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from app.db.firebase_utils import get_firestore_client
from datetime import datetime
from typing import Dict, Any
from app.core.security import require_clinician, get_current_user

router = APIRouter(tags=["history"])


class Message(BaseModel):
    role: str
    content: str
    timestamp: Optional[str] = None
    confidence: Optional[float] = None
    model: Optional[str] = None


class Consultation(BaseModel):
    consultation_id: str
    last_updated: str
    status: str
    message_count: int
    first_message: Optional[str] = None


@router.get("/history/{user_id}", response_model=List[Consultation])
async def get_user_history(user_id: str):
    """Get all consultations for a user"""
    try:
        db = get_firestore_client()
        if not db:
            # Firestore not configured; return empty history gracefully
            return []
        
        # Query consultations for this user
        consultations_ref = db.collection("consultations").where("user_id", "==", user_id).order_by("last_updated", direction="DESCENDING")
        consultations = consultations_ref.stream()
        
        result = []
        for consultation in consultations:
            consultation_data = consultation.to_dict()
            consultation_id = consultation.id
            
            # Get message count
            messages_ref = db.collection("consultations").document(consultation_id).collection("messages")
            messages = list(messages_ref.stream())
            
            # Get first user message
            first_message = None
            for msg in messages:
                msg_data = msg.to_dict()
                if msg_data.get("role") == "user":
                    first_message = msg_data.get("content", "")
                    break
            
            result.append(Consultation(
                consultation_id=consultation_id,
                last_updated=consultation_data.get("last_updated", datetime.utcnow()).isoformat(),
                status=consultation_data.get("status", "active"),
                message_count=len(messages),
                first_message=first_message
            ))
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch history: {str(e)}")


@router.get("/consultation/{consultation_id}", response_model=List[Message])
async def get_consultation_messages(consultation_id: str):
    """Get all messages for a specific consultation"""
    try:
        db = get_firestore_client()
        if not db:
            # Firestore not configured (e.g., local dev without credentials)
            return []
        
        # Get messages ordered by timestamp
        messages_ref = db.collection("consultations").document(consultation_id).collection("messages").order_by("timestamp")
        messages = messages_ref.stream()
        
        result = []
        for msg in messages:
            msg_data = msg.to_dict()
            result.append(Message(
                role=msg_data.get("role", ""),
                content=msg_data.get("content", ""),
                timestamp=msg_data.get("timestamp", datetime.utcnow()).isoformat() if msg_data.get("timestamp") else None,
                confidence=msg_data.get("confidence"),
                model=msg_data.get("model")
            ))
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch messages: {str(e)}")


@router.get("/consultation/{consultation_id}/metadata")
async def get_consultation_metadata(consultation_id: str, clinician=Depends(require_clinician)) -> Dict[str, Any]:
    """Return consultation document metadata and stored AI summary (if present).

    Protected: requires clinician authentication.
    """
    try:
        db = get_firestore_client()
        if not db:
            raise HTTPException(status_code=503, detail="Database not available")

        doc_ref = db.collection("consultations").document(consultation_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Consultation not found")

        data = doc.to_dict() or {}

        # Convert any datetime fields to isoformat strings for JSON
        for k, v in list(data.items()):
            if hasattr(v, "isoformat"):
                try:
                    data[k] = v.isoformat()
                except Exception:
                    pass

        # Pull ai_summary if stored under the document
        ai_summary = data.get("ai_summary")
        if ai_summary and isinstance(ai_summary, dict):
            # normalize generated_at if present
            if isinstance(ai_summary.get("generated_at"), datetime):
                ai_summary["generated_at"] = ai_summary["generated_at"].isoformat()

        return {
            "consultation_id": consultation_id,
            "consultation": data,
            "ai_summary": ai_summary,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch consultation metadata: {e}")


@router.get("/consultation/{consultation_id}/full")
async def get_consultation_full(consultation_id: str, clinician=Depends(require_clinician)) -> Dict[str, Any]:
    """Return consultation document, messages, clinical notes, and stored AI summary in one call.

    Protected: requires clinician authentication.
    """
    try:
        db = get_firestore_client()
        if not db:
            raise HTTPException(status_code=503, detail="Database not available")

        doc_ref = db.collection("consultations").document(consultation_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Consultation not found")

        consultation_data = doc.to_dict() or {}

        # Messages ordered by timestamp
        messages_ref = doc_ref.collection("messages").order_by("timestamp")
        messages = []
        for m in messages_ref.stream():
            md = m.to_dict() or {}
            # normalize timestamp
            if md.get("timestamp"):
                try:
                    md["timestamp"] = md["timestamp"].isoformat()
                except Exception:
                    pass
            messages.append(md)

        # Clinical notes ordered by timestamp
        notes_ref = doc_ref.collection("clinical_notes").order_by("timestamp")
        notes = []
        for n in notes_ref.stream():
            nd = n.to_dict() or {}
            if nd.get("timestamp"):
                try:
                    nd["timestamp"] = nd["timestamp"].isoformat()
                except Exception:
                    pass
            notes.append(nd)

        ai_summary = consultation_data.get("ai_summary")
        if ai_summary and isinstance(ai_summary.get("generated_at"), datetime):
            try:
                ai_summary["generated_at"] = ai_summary["generated_at"].isoformat()
            except Exception:
                pass

        # Normalize top-level datetimes
        for k, v in list(consultation_data.items()):
            if hasattr(v, "isoformat"):
                try:
                    consultation_data[k] = v.isoformat()
                except Exception:
                    pass

        return {
            "consultation_id": consultation_id,
            "consultation": consultation_data,
            "messages": messages,
            "clinical_notes": notes,
            "ai_summary": ai_summary,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch consultation full data: {e}")


@router.get("/consultation/{consultation_id}/full/me")
async def get_consultation_full_for_owner(
    consultation_id: str,
    include_notes: Optional[bool] = Query(False, description="Include clinical notes in response"),
    current_user: dict = Depends(get_current_user),
) -> Dict[str, Any]:
    """Return consultation document, messages, and ai_summary for the authenticated owner.

    Optionally include clinical notes if `include_notes=true`.
    """
    try:
        uid = current_user.get("uid") or current_user.get("user_id") or current_user.get("sub")
        if not uid:
            raise HTTPException(status_code=401, detail="Invalid user token")

        db = get_firestore_client()
        if not db:
            raise HTTPException(status_code=503, detail="Database not available")

        doc_ref = db.collection("consultations").document(consultation_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Consultation not found")

        consultation_data = doc.to_dict() or {}

        # Ensure the requesting user is the consultation owner
        if consultation_data.get("user_id") != uid:
            raise HTTPException(status_code=403, detail="Not authorized to view this consultation")

        # Messages ordered by timestamp
        messages_ref = doc_ref.collection("messages").order_by("timestamp")
        messages = []
        for m in messages_ref.stream():
            md = m.to_dict() or {}
            if md.get("timestamp"):
                try:
                    md["timestamp"] = md["timestamp"].isoformat()
                except Exception:
                    pass
            messages.append(md)

        ai_summary = consultation_data.get("ai_summary")
        if ai_summary and isinstance(ai_summary.get("generated_at"), datetime):
            try:
                ai_summary["generated_at"] = ai_summary["generated_at"].isoformat()
            except Exception:
                pass

        # Normalize top-level datetimes
        for k, v in list(consultation_data.items()):
            if hasattr(v, "isoformat"):
                try:
                    consultation_data[k] = v.isoformat()
                except Exception:
                    pass

        result = {
            "consultation_id": consultation_id,
            "consultation": consultation_data,
            "messages": messages,
            "ai_summary": ai_summary,
        }

        if include_notes:
            notes_ref = doc_ref.collection("clinical_notes").order_by("timestamp")
            notes = []
            for n in notes_ref.stream():
                nd = n.to_dict() or {}
                if nd.get("timestamp"):
                    try:
                        nd["timestamp"] = nd["timestamp"].isoformat()
                    except Exception:
                        pass
                notes.append(nd)
            result["clinical_notes"] = notes

        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch consultation for owner: {e}")
