from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

router = APIRouter(tags=["summarize"])

class SummarizeRequest(BaseModel):
    messages: List[str]

class SummarizeResponse(BaseModel):
    summary: str

@router.post("/summarize", response_model=SummarizeResponse)
async def summarize_endpoint(payload: SummarizeRequest):
    return SummarizeResponse(summary="Summary placeholder.")
