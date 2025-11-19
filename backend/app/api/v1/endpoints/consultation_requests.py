from fastapi import APIRouter, HTTPException, Query, Depends
from typing import Dict, List, Optional
from datetime import datetime
from threading import Lock
from uuid import uuid4

from app.api.v1.schemas.consultation_request import (
    ConsultationRequestCreate,
    ConsultationRequestResponse,
    ConsultationRequestUpdate,
    ConsultationStatus,
)
from app.db.firebase_utils import get_firestore_client
from app.core.security import require_clinician

router = APIRouter(tags=["consultation-requests"])


def _serialize_request(doc) -> ConsultationRequestResponse:
    data = doc.to_dict()
    return _serialize_request_from_data(doc.id, data)


def _serialize_request_from_data(request_id: str, data: Dict) -> ConsultationRequestResponse:
    created_at = data.get("created_at") or datetime.utcnow()
    updated_at = data.get("updated_at") or created_at

    if isinstance(created_at, datetime):
        created_at_iso = created_at.isoformat()
    else:
        created_at_iso = str(created_at)

    if isinstance(updated_at, datetime):
        updated_at_iso = updated_at.isoformat()
    else:
        updated_at_iso = str(updated_at)

    return ConsultationRequestResponse(
        request_id=request_id,
        user_id=data.get("user_id", ""),
        clinician_id=data.get("clinician_id"),
        consultation_id=data.get("consultation_id"),
        summary=data.get("summary", ""),
        details=data.get("details"),
        urgency=data.get("urgency", "medium"),
        status=data.get("status", "pending"),
        created_at=created_at_iso,
        updated_at=updated_at_iso,
    )


_fallback_requests: Dict[str, Dict] = {}
_fallback_lock = Lock()


@router.post("/consultation/request", response_model=ConsultationRequestResponse)
async def create_consultation_request(payload: ConsultationRequestCreate):
    """Create a consultation request from a user."""
    db = get_firestore_client()

    try:
        now = datetime.utcnow()
        data = {
            "user_id": payload.user_id,
            "consultation_id": payload.consultation_id,
            "summary": payload.summary,
            "details": payload.details,
            "urgency": payload.urgency.value,
            "status": ConsultationStatus.pending.value,
            "created_at": now,
            "updated_at": now,
        }

        if db:
            doc_ref = db.collection("consultation_requests").add(data)[0]
            created_doc = doc_ref.get()
            return _serialize_request(created_doc)

        # Fallback to in-memory storage when Firestore is unavailable (local dev)
        with _fallback_lock:
            request_id = uuid4().hex
            _fallback_requests[request_id] = data
        return _serialize_request_from_data(request_id, data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create request: {e}")


@router.get("/consultation/request/user/{user_id}", response_model=List[ConsultationRequestResponse])
async def get_user_requests(user_id: str):
    """Fetch consultation requests created by a user."""
    db = get_firestore_client()

    try:
        if db:
            query = (
                db.collection("consultation_requests")
                .where("user_id", "==", user_id)
                .order_by("created_at", direction="DESCENDING")
            )
            docs = query.stream()
            return [_serialize_request(doc) for doc in docs]

        with _fallback_lock:
            requests = [
                _serialize_request_from_data(request_id, data)
                for request_id, data in _fallback_requests.items()
                if data.get("user_id") == user_id
            ]

        # Sort by created_at descending (ISO strings sort lexicographically when same format)
        requests.sort(key=lambda r: r.created_at, reverse=True)
        return requests
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch requests: {e}")


@router.get("/consultation/requests", response_model=List[ConsultationRequestResponse])
async def list_consultation_requests(
    status: Optional[ConsultationStatus] = Query(None, description="Filter by status"),
    clinician_id: Optional[str] = Query(None, description="Filter by assigned clinician"),
    clinician=Depends(require_clinician)
):
    """List consultation requests for clinicians."""
    db = get_firestore_client()
    if not db:
        raise HTTPException(status_code=500, detail="Database not available")

    try:
        collection = db.collection("consultation_requests")
        if status:
            collection = collection.where("status", "==", status.value)
        if clinician_id:
            collection = collection.where("clinician_id", "==", clinician_id)

        docs = collection.order_by("created_at", direction="DESCENDING").stream()
        return [_serialize_request(doc) for doc in docs]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list requests: {e}")


@router.post("/consultation/request/{request_id}/assign", response_model=ConsultationRequestResponse)
async def assign_request(request_id: str, clinician_id: str = Query(...), clinician=Depends(require_clinician)):
    """Assign a consultation request to a clinician."""
    db = get_firestore_client()
    if not db:
        raise HTTPException(status_code=500, detail="Database not available")

    try:
        doc_ref = db.collection("consultation_requests").document(request_id)
        if not doc_ref.get().exists:
            raise HTTPException(status_code=404, detail="Request not found")

        doc_ref.update({
            "clinician_id": clinician_id,
            "status": ConsultationStatus.assigned.value,
            "updated_at": datetime.utcnow(),
        })

        updated = doc_ref.get()
        return _serialize_request(updated)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to assign request: {e}")


@router.post("/consultation/request/{request_id}/status", response_model=ConsultationRequestResponse)
async def update_request_status(request_id: str, payload: ConsultationRequestUpdate, clinician=Depends(require_clinician)):
    """Update consultation request status or notes."""
    db = get_firestore_client()
    if not db:
        raise HTTPException(status_code=500, detail="Database not available")

    try:
        doc_ref = db.collection("consultation_requests").document(request_id)
        doc_snapshot = doc_ref.get()
        if not doc_snapshot.exists:
            raise HTTPException(status_code=404, detail="Request not found")

        updates = {"updated_at": datetime.utcnow()}
        if payload.status:
            updates["status"] = payload.status.value
        if payload.clinician_id:
            updates["clinician_id"] = payload.clinician_id
        if payload.notes:
            # store notes in subcollection for history
            doc_ref.collection("notes").add({
                "note": payload.notes,
                "timestamp": datetime.utcnow(),
                "clinician_id": payload.clinician_id,
            })

        if len(updates) > 1:  # besides updated_at
            doc_ref.update(updates)

        updated_doc = doc_ref.get()
        return _serialize_request(updated_doc)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update request: {e}")
