from fastapi import APIRouter, HTTPException
from app.api.v1.schemas.chat import ChatRequest, ChatResponse
from app.services import ai_service
from app.db.firebase_utils import get_firestore_client
from datetime import datetime
import uuid

router = APIRouter(tags=["chat"])


@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(payload: ChatRequest):
    if not payload or not payload.message:
        raise HTTPException(status_code=400, detail="Message required")
    try:
        # Process AI response
        out = await ai_service.process_chat(
            payload.message, 
            triage=(payload.triage.dict() if payload.triage else None), 
            consultation_id=payload.consultation_id
        )
        
        # Save to Firestore if user_id provided
        if payload.user_id:
            try:
                db = get_firestore_client()
                if db:
                    # Generate consultation_id if not provided
                    consultation_id = payload.consultation_id or str(uuid.uuid4())
                    
                    # Save user message
                    db.collection("consultations").document(consultation_id).collection("messages").add({
                        "user_id": payload.user_id,
                        "role": "user",
                        "content": payload.message,
                        "timestamp": datetime.utcnow(),
                        "consultation_id": consultation_id
                    })
                    
                    # Save AI response
                    db.collection("consultations").document(consultation_id).collection("messages").add({
                        "user_id": payload.user_id,
                        "role": "ai",
                        "content": out.get("reply", ""),
                        "confidence": out.get("confidence", 0.0),
                        "model": "Groq Llama 3.3" if out.get("confidence", 0) >= 0.9 else "MedAI Templates",
                        "timestamp": datetime.utcnow(),
                        "consultation_id": consultation_id,
                        "recommend_doctor": out.get("ai_recommend_doctor", False)
                    })
                    
                    # Update consultation metadata
                    db.collection("consultations").document(consultation_id).set({
                        "user_id": payload.user_id,
                        "last_updated": datetime.utcnow(),
                        "status": "active",
                        "triage_data": payload.triage.dict() if payload.triage else None
                    }, merge=True)
            except Exception as e:
                # Log error but don't fail the request
                print(f"Failed to save chat history: {e}")
        
        return ChatResponse(
            reply=out.get("reply", ""), 
            ai_recommend_doctor=out.get("ai_recommend_doctor", False), 
            confidence=out.get("confidence", 0.0)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
