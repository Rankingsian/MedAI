from fastapi import APIRouter, File, UploadFile, HTTPException
from pydantic import BaseModel
from app.services.ocr_service import extract_text_from_upload
from app.services import ai_service

router = APIRouter(tags=["upload"])


class UploadResponse(BaseModel):
    parsed_text: str
    ai_notes: str = ""


@router.post("/upload-lab", response_model=UploadResponse)
async def upload_lab(file: UploadFile = File(...)):
    if not file:
        raise HTTPException(status_code=400, detail="File required")
    text = await extract_text_from_upload(file)
    # run lab summarization pipeline
    analysis = ai_service.summarize_lab_text(text)
    return UploadResponse(parsed_text=analysis.get("parsed_text", ""), ai_notes=analysis.get("summary", ""))
