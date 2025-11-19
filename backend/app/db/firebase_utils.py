from typing import Optional
import logging
import os
import json

logger = logging.getLogger(__name__)


def _init_firebase_app_if_needed():
    """Initialize firebase_admin.App if not already initialized.

    This function supports two init flows:
    - If GOOGLE_APPLICATION_CREDENTIALS is set and points to a file in the environment, call default init.
    - If FIREBASE_SERVICE_ACCOUNT_JSON is set (the full JSON as an env var), initialize from that JSON. This
      is convenient for managed platforms (Render) where uploading a file isn't practical.
    """
    try:
        import firebase_admin
        from firebase_admin import credentials

        if firebase_admin._apps:
            return True

        # Prefer explicit service account JSON provided via env var (recommended on Render)
        sa_json = os.environ.get("FIREBASE_SERVICE_ACCOUNT_JSON")
        if sa_json:
            try:
                sa_data = json.loads(sa_json)
            except Exception:
                # If the env var contains base64, attempt to decode
                try:
                    import base64

                    sa_decoded = base64.b64decode(sa_json)
                    sa_data = json.loads(sa_decoded)
                except Exception as e:
                    logger.exception("Invalid FIREBASE_SERVICE_ACCOUNT_JSON: %s", e)
                    return False

            cred = credentials.Certificate(sa_data)
            firebase_admin.initialize_app(cred)
            logger.info("Initialized Firebase app from FIREBASE_SERVICE_ACCOUNT_JSON env var")
            return True

        # Fall back to default initialization (uses GOOGLE_APPLICATION_CREDENTIALS or metadata)
        firebase_admin.initialize_app()
        logger.info("Initialized Firebase app using default credentials (GOOGLE_APPLICATION_CREDENTIALS or metadata)")
        return True
    except Exception as e:
        logger.exception("Failed to initialize firebase_admin: %s", e)
        return False


def get_firestore_client():
    try:
        from firebase_admin import firestore

        ok = _init_firebase_app_if_needed()
        if not ok:
            return None

        return firestore.client()
    except Exception as e:
        # Log the underlying exception so it's visible in server logs for easier debugging
        logger.exception("Failed to get Firestore client: %s", e)
        return None


def get_storage_bucket() -> Optional[object]:
    try:
        import firebase_admin
        from firebase_admin import storage

        ok = _init_firebase_app_if_needed()
        if not ok:
            return None

        return storage.bucket()
    except Exception as e:
        logger.exception("Failed to initialize Firebase storage bucket: %s", e)
        return None


def save_consultation_record(record: dict) -> Optional[str]:
    """Best-effort helper to save a consultation record to Firestore and return the new doc id."""
    try:
        client = get_firestore_client()
        if not client:
            logger.warning("save_consultation_record: Firestore client unavailable")
            return None
        ref = client.collection("consultations").add(record)
        # ref is (DocumentReference, write_result)
        doc_ref = ref[0]
        return getattr(doc_ref, "id", None)
    except Exception as e:
        logger.exception("Failed to save consultation record: %s", e)
        return None


def save_lab_record(record: dict) -> Optional[str]:
    try:
        client = get_firestore_client()
        if not client:
            logger.warning("save_lab_record: Firestore client unavailable")
            return None
        ref = client.collection("lab_reports").add(record)
        doc_ref = ref[0]
        return getattr(doc_ref, "id", None)
    except Exception as e:
        logger.exception("Failed to save lab record: %s", e)
        return None
