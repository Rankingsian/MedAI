from typing import List

_MODEL = None

def _load_model():
    global _MODEL
    if _MODEL is not None:
        return _MODEL
    try:
        from sentence_transformers import SentenceTransformer
        _MODEL = SentenceTransformer('sentence-transformers/all-mpnet-base-v2')
    except Exception:
        _MODEL = None
    return _MODEL


def embed(text: str) -> List[float]:
    """Return vector embedding for text. If sentence-transformers is not installed, returns empty list.

    This wrapper allows the rest of the codebase to call embed() safely in dev environments.
    """
    if not text:
        return []
    model = _load_model()
    if model is None:
        return []
    vec = model.encode(text)
    return vec.tolist() if hasattr(vec, "tolist") else list(vec)
