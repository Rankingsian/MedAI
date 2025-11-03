from fastapi import Depends, HTTPException
from app.api.v1.deps import get_settings

def require_role(role: str, settings=Depends(get_settings)):
    return True
