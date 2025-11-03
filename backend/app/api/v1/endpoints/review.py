from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(tags=["review"])

class ReviewItem(BaseModel):
    consultation_id: str
    ai_summary: str
    status: str

class ReviewUpdate(BaseModel):
    consultation_id: str
    status: str
    review_notes: Optional[str] = None

@router.get("/doctor/review", response_model=List[ReviewItem])
async def list_pending_reviews():
    return []

@router.post("/doctor/review", response_model=ReviewItem)
async def update_review(payload: ReviewUpdate):
    return ReviewItem(consultation_id=payload.consultation_id, ai_summary="", status=payload.status)
