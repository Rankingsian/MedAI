from fastapi import APIRouter
from app.services import ai_service

router = APIRouter(tags=["health"])


@router.get("/health/ai")
async def ai_health_check():
    """Check AI service health and configuration status."""
    
    groq_status = {
        "available": ai_service.groq_client is not None,
        "error": ai_service.groq_initialization_error
    }
    
    if groq_status["available"]:
        status_message = "✅ AI service operational (Groq Llama 3.3-70b)"
        mode = "groq"
    else:
        status_message = f"⚠️  Groq unavailable: {groq_status['error']}. Using template responses."
        mode = "template"
    
    return {
        "status": "operational" if groq_status["available"] else "degraded",
        "message": status_message,
        "mode": mode,
        "groq": groq_status,
        "models": {
            "primary": "Llama 3.3-70b (Groq)" if groq_status["available"] else None,
            "fallback": "Template-based responses"
        }
    }
