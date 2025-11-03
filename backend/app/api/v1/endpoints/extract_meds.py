from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from app.services import ai_service
import re

router = APIRouter(tags=["nlp"])

class ExtractMedsRequest(BaseModel):
    text: str

class ExtractMedsResponse(BaseModel):
    medications: List[str]
    confidence: float = 0.0

@router.post("/extract-meds", response_model=ExtractMedsResponse)
async def extract_meds_endpoint(payload: ExtractMedsRequest):
    """Extract medication names from medical text using BioBERT."""
    if not payload.text:
        raise HTTPException(status_code=400, detail="Text required")
    
    # Use BioBERT to extract medications
    prompt = f"Extract all medication names from the following text:\n{payload.text}\n\nMedications:"
    result = await ai_service.query_biobert(prompt)
    
    # Parse the output to extract medication list
    output_text = result.get("output", "")
    
    # Try to extract medication names from the response
    # Simple parsing: look for comma-separated list or line breaks
    medications = []
    if output_text:
        # Split by common separators
        raw_meds = re.split(r'[,\n;]', output_text)
        medications = [
            med.strip().strip('-').strip('*').strip() 
            for med in raw_meds 
            if med.strip() and len(med.strip()) > 2
        ]
    
    return ExtractMedsResponse(
        medications=medications[:10],  # Limit to 10 medications
        confidence=result.get("confidence", 0.0)
    )
