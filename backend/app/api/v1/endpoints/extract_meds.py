from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

router = APIRouter(tags=["nlp"])

class ExtractMedsRequest(BaseModel):
    text: str

class ExtractMedsResponse(BaseModel):
    medications: List[str]

@router.post("/extract-meds", response_model=ExtractMedsResponse)
async def extract_meds_endpoint(payload: ExtractMedsRequest):
    return ExtractMedsResponse(medications=[])
