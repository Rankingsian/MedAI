from typing import List, Tuple, Optional
from app.utils import deid as deid_utils
from app.utils import embeddings as embed_utils
from app.db.firebase_utils import get_firestore_client

import logging

log = logging.getLogger(__name__)


def _safe_text_generation(prompt: str, model_name: Optional[str] = None) -> Tuple[str, float]:
    """Try to generate text using a local HF model if available; fallback to simple template.

    Returns tuple (response_text, confidence_score)
    """
    if not prompt:
        return ("", 0.0)
    try:
        from transformers import pipeline, AutoTokenizer, AutoModelForCausalLM
        # prefer BioGPT if available
        model_to_try = model_name or "microsoft/BioGPT-Large"
        gen = pipeline("text-generation", model=model_to_try, device=0 if __import__('torch').cuda.is_available() else -1)
        res = gen(prompt, max_length=512, do_sample=False)
        text = res[0]["generated_text"] if isinstance(res, list) and res else str(res)
        # naive confidence estimate: based on presence of certain keywords (placeholder)
        confidence = 0.6
        return (text, confidence)
    except Exception as exc:
        log.debug("HF generation not available or failed: %s", exc)
        # fallback: simple echoing template
        fallback = "Based on the information provided, here are some possible considerations: " + (prompt[:400] + "...")
        return (fallback, 0.4)


def process_chat(message: str, triage: Optional[dict] = None, consultation_id: Optional[str] = None) -> dict:
    """Main pipeline for handling a chat message.

    Steps:
    - de-identify message + triage
    - compute embeddings (if available)
    - generate response via HF model (if available)
    - determine whether to recommend doctor (heuristic)
    - persist de-identified record to Firestore (best-effort)
    """
    # build a text context
    triage_text = "" if not triage else " | ".join(f"{k}: {v}" for k, v in triage.items() if v)
    combined = f"Triage: {triage_text}\nMessage: {message}"

    deid_text = deid_utils.deidentify(combined)

    embedding = embed_utils.embed(deid_text)

    response_text, confidence = _safe_text_generation(deid_text)

    # simple heuristics to flag doctor recommendation
    recommend_doctor = False
    red_flags = ["severe", "chest pain", "shortness of breath", "unconscious", "bleeding heavily", "suicidal"]
    lower = (message or "").lower()
    if any(flag in lower for flag in red_flags) or (confidence < 0.35):
        recommend_doctor = True

    # persist to firestore (best-effort)
    try:
        client = get_firestore_client()
        if client:
            doc = {
                "consultation_id": consultation_id,
                "deidentified_text": deid_text,
                "raw_message": None,  # don't store raw PII
                "response": response_text,
                "confidence": float(confidence),
                "recommend_doctor": bool(recommend_doctor),
            }
            client.collection("consultations").add(doc)
    except Exception as e:
        log.debug("Failed to persist consultation: %s", e)

    return {
        "reply": response_text,
        "confidence": float(confidence),
        "ai_recommend_doctor": bool(recommend_doctor),
        "deidentified_input": deid_text,
        "embedding": embedding,
    }


def summarize_lab_text(parsed_text: str) -> dict:
    """Run de-id, optional NER, then generate a plain-language summary of lab findings."""
    deid_text = deid_utils.deidentify(parsed_text)
    # attempt to extract medications/entities using med7 if available
    entities = []
    try:
        import spacy
        try:
            nlp = spacy.load("en_core_med7_lg")
        except Exception:
            nlp = None
        if nlp:
            doc = nlp(deid_text)
            for ent in doc.ents:
                entities.append({"text": ent.text, "label": ent.label_})
    except Exception:
        entities = []

    summary, confidence = _safe_text_generation("Summarize these lab results in plain language:\n" + deid_text)

    # persist lab analysis
    try:
        client = get_firestore_client()
        if client:
            client.collection("lab_reports").add({
                "deidentified_text": deid_text,
                "summary": summary,
                "entities": entities,
            })
    except Exception:
        pass

    return {"parsed_text": deid_text, "summary": summary, "entities": entities, "confidence": float(confidence)}

