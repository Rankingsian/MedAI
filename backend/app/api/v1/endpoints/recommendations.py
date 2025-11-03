from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(tags=["recommendations"])

class RecommendEvent(BaseModel):
    consultation_id: str
    reason: str

class RecommendResponse(BaseModel):
    ok: bool

@router.post("/recommend-doctor", response_model=RecommendResponse)
async def recommend_doctor(payload: RecommendEvent):
    return RecommendResponse(ok=True)
