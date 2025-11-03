from typing import List
import re

try:
    from transformers import AutoTokenizer, AutoModelForTokenClassification, pipeline
    _HF_AVAILABLE = True
except Exception:
    _HF_AVAILABLE = False


_RE_PATTERNS = [
    # simple regex fallbacks for common PII
    (re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}"), "[EMAIL]"),
    (re.compile(r"\b\d{3}[-.]?\d{3}[-.]?\d{4}\b"), "[PHONE]"),
    (re.compile(r"\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b"), "[DATE]"),
]


class Deidentifier:
    def __init__(self):
        self._use_hf = False
        if _HF_AVAILABLE:
            try:
                # Attempt to load a token classification model for de-id; this is optional and may be heavy.
                self.tokenizer = AutoTokenizer.from_pretrained("obi/deid_bert_i2b2")
                self.model = AutoModelForTokenClassification.from_pretrained("obi/deid_bert_i2b2")
                self.pipe = pipeline("ner", model=self.model, tokenizer=self.tokenizer, aggregation_strategy="simple")
                self._use_hf = True
            except Exception:
                self._use_hf = False

    def deidentify(self, text: str) -> str:
        if not text:
            return text
        result = text
        if self._use_hf:
            try:
                entities = self.pipe(text)
                # Replace entities with their labels
                # Iterate from end to avoid offset shifts
                for ent in sorted(entities, key=lambda e: e["start"], reverse=True):
                    label = ent.get("entity_group") or ent.get("entity")
                    start, end = ent["start"], ent["end"]
                    result = result[:start] + f"[{label}]" + result[end:]
                return result
            except Exception:
                # fallback to regex
                pass

        # simple regex-based masking fallback
        for pattern, repl in _RE_PATTERNS:
            result = pattern.sub(repl, result)

        # mask common name-like tokens (very heuristic): sequences of capitalized words
        result = re.sub(r"\b([A-Z][a-z]{1,}\s(?:[A-Z][a-z]{1,}\s?)*)\b", "[NAME]", result)

        return result


_deid_singleton: Deidentifier | None = None


def deidentify(text: str) -> str:
    global _deid_singleton
    if _deid_singleton is None:
        _deid_singleton = Deidentifier()
    return _deid_singleton.deidentify(text)
