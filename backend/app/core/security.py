from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import firebase_admin
from firebase_admin import auth as firebase_auth
from app.db.firebase_utils import get_firestore_client

bearer = HTTPBearer(auto_error=False)


async def get_current_user(token: HTTPAuthorizationCredentials = Depends(bearer)):
    """Verify Firebase ID token from the Authorization header and return decoded token."""
    if not token or not token.credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        # Ensure firebase app is initialized
        if not firebase_admin._apps:
            try:
                firebase_admin.initialize_app()
            except Exception:
                # initialization may require credentials in some environments; allow verify to fail gracefully
                pass

        decoded = firebase_auth.verify_id_token(token.credentials)
        return decoded
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid auth token: {e}")


async def require_clinician(decoded: dict = Depends(get_current_user)):
    """Dependency to ensure the authenticated user is an approved clinician.

    Checks the `clinicians` collection in Firestore for profile and status.
    Returns a small dict with uid and profile on success.
    """
    uid = decoded.get("uid") or decoded.get("user_id") or decoded.get("sub")
    if not uid:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    db = get_firestore_client()
    if not db:
        raise HTTPException(status_code=503, detail="Database not available")

    try:
        doc = db.collection("clinicians").document(uid).get()
        if not doc.exists:
            raise HTTPException(status_code=403, detail="Clinician profile not found")

        profile = doc.to_dict() or {}
        # Expect role and status fields on clinician profile
        if profile.get("role") != "clinician":
            raise HTTPException(status_code=403, detail="User is not a clinician")

        # You can relax this check to allow pending accounts if desired
        if profile.get("status") != "approved":
            raise HTTPException(status_code=403, detail="Clinician account not approved")

        return {"uid": uid, "profile": profile}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to validate clinician: {e}")
