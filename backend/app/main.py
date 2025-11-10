from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.endpoints import (
    chat,
    upload,
    summarize,
    review,
    recommendations,
    extract_meds,
    history,
    clinician,
    consultation_requests,
    video_calls,
)

app = FastAPI(title="MedAI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router, prefix="/api")
app.include_router(upload.router, prefix="/api")
app.include_router(summarize.router, prefix="/api")
app.include_router(review.router, prefix="/api")
app.include_router(recommendations.router, prefix="/api")
app.include_router(extract_meds.router, prefix="/api")
app.include_router(history.router, prefix="/api")
app.include_router(clinician.router, prefix="/api")
app.include_router(consultation_requests.router, prefix="/api")
app.include_router(video_calls.router, prefix="/api")

@app.get("/")
def health():
    return {"status": "ok"}
