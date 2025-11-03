from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from app.services import ai_service

router = APIRouter(tags=["summarize"])

class SummarizeRequest(BaseModel):
    messages: List[str]

class SummarizeResponse(BaseModel):
    summary: str
    confidence: float = 0.0

@router.post("/summarize", response_model=SummarizeResponse)
async def summarize_endpoint(payload: SummarizeRequest):
    """Summarize a conversation history using BioGPT."""
    if not payload.messages:
        raise HTTPException(status_code=400, detail="Messages required")
    
    # Combine messages into a conversation context
    conversation = "\n".join([f"- {msg}" for msg in payload.messages])
    prompt = f"Summarize the following medical conversation:\n{conversation}\n\nSummary:"
    
    # Use BioGPT for summarization
    result = await ai_service.query_biogpt(prompt)
    
    return SummarizeResponse(
        summary=result.get("output", "Unable to generate summary"),
        confidence=result.get("confidence", 0.0)
    )
