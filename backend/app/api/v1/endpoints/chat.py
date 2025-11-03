from fastapi import APIRouter, HTTPException
from app.api.v1.schemas.chat import ChatRequest, ChatResponse
from app.services import ai_service

router = APIRouter(tags=["chat"])


@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(payload: ChatRequest):
    if not payload or not payload.message:
        raise HTTPException(status_code=400, detail="Message required")
    try:
        out = ai_service.process_chat(payload.message, triage=(payload.triage.dict() if payload.triage else None), consultation_id=payload.consultation_id)
        return ChatResponse(reply=out.get("reply", ""), ai_recommend_doctor=out.get("ai_recommend_doctor", False), confidence=out.get("confidence", 0.0))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
