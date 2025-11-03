from typing import Optional

def get_firestore_client():
    try:
        import firebase_admin
        from firebase_admin import firestore
        if not firebase_admin._apps:
            firebase_admin.initialize_app()
        return firestore.client()
    except Exception:
        return None

def get_storage_bucket() -> Optional[object]:
    try:
        import firebase_admin
        from firebase_admin import storage
        if not firebase_admin._apps:
            firebase_admin.initialize_app()
        return storage.bucket()
    except Exception:
        return None


def save_consultation_record(record: dict) -> Optional[str]:
    """Best-effort helper to save a consultation record to Firestore and return the new doc id."""
    try:
        client = get_firestore_client()
        if not client:
            return None
        ref = client.collection("consultations").add(record)
        # ref is (DocumentReference, write_result)
        doc_ref = ref[0]
        return getattr(doc_ref, "id", None)
    except Exception:
        return None


def save_lab_record(record: dict) -> Optional[str]:
    try:
        client = get_firestore_client()
        if not client:
            return None
        ref = client.collection("lab_reports").add(record)
        doc_ref = ref[0]
        return getattr(doc_ref, "id", None)
    except Exception:
        return None
