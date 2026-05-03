import functools
import logging
import os
import re

import torch
from presidio_analyzer import AnalyzerEngine
from transformers import pipeline

logger = logging.getLogger(__name__)

# Lazy-init Presidio analyzer (cheap to construct, but defer until first use
# so /health and other endpoints don't pay the cost during import).
@functools.lru_cache(maxsize=1)
def _analyzer() -> AnalyzerEngine:
    return AnalyzerEngine()

# Lazy-init prompt injection classifier. Loading
# `deberta-v3-base-prompt-injection-v2` at module import time would push
# Cloud Run cold start from ~2s to ~15-30s. Loading on first call shifts
# the cost to the first chat request (which is unavoidable anyway). The
# model is then cached for the process lifetime.
@functools.lru_cache(maxsize=1)
def _injection_classifier():
    try:
        return pipeline(
            "text-classification",
            model="ProtectAI/deberta-v3-base-prompt-injection-v2",
            device="cuda" if torch.cuda.is_available() else "cpu",
        )
    except Exception as exc:
        logger.warning("Prompt-injection classifier failed to load; falling back to regex: %s", exc)
        return None

def is_prompt_injection(text: str) -> bool:
    classifier = _injection_classifier()
    if classifier:
        results = classifier(text)
        # Typically returns [{'label': 'INJECTION', 'score': 0.99}]
        for res in results:
            if res["label"] == "INJECTION" and res["score"] > 0.5:
                return True

    # Regex fallback
    injection_patterns = [
        r"ignore (all )?previous instructions",
        r"system prompt",
        r"you are now",
        r"new rule",
        r"^ignore\b",
        r"^forget\b",
    ]
    for pattern in injection_patterns:
        if re.search(pattern, text, re.IGNORECASE):
            return True

    return False

def contains_pii(text: str) -> bool:
    # Use standard Presidio analyzer
    results = _analyzer().analyze(text=text, entities=[], language='en')
    # Filter for high confidence PII
    for res in results:
        if res.score > 0.4: # Lowered threshold for testing/sensitivity
            return True

    # Regex fallback for common patterns that Presidio might miss in minimal setup
    pii_patterns = [
        r"\b\d{3}[-.]?\d{3}[-.]?\d{4}\b", # Phone
        r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b", # Email
    ]
    for pattern in pii_patterns:
        if re.search(pattern, text):
            return True

    return False

_KEYWORDS = (
    "sean", "bearden", "resume", "cv", "physics", "data science",
    "phd", "portfolio", "projects", "blog", "publications",
    "experience", "education", "skills",
)
# Greetings + simple acknowledgements that aren't off-topic but also don't
# match the keyword list. Any short message NOT in this set falls through
# to the off-topic check rather than being blanket-allowed (which previously
# let "ignore rules" / "forget that" / arbitrary 2-word inputs through).
_GREETINGS = frozenset({
    "hi", "hello", "hey", "yo", "sup", "howdy", "greetings",
    "hi there", "hello there", "good morning", "good afternoon", "good evening",
    "thanks", "thank you", "ok", "okay", "cool", "nice",
})

def is_off_topic(text: str) -> bool:
    text_lower = text.lower().strip().rstrip("!.?")
    if any(kw in text_lower for kw in _KEYWORDS):
        return False

    # Allow exact-match greetings only. Previously any message <3 words was
    # treated as on-topic — that bypassed the check for inputs like
    # "ignore rules" or "forget previous". Whitelisting to known phrases
    # closes the bypass while still letting "Hi", "Thanks" through.
    if text_lower in _GREETINGS:
        return False

    return True

# Daily-budget cost ceiling. Tracked process-locally; on Cloud Run with
# >1 instance the counter will diverge per-instance. For now this is best-
# effort; production deployments should back this with Memorystore / Redis
# (set DAILY_BUDGET via env, store the running total in a shared store).
DAILY_BUDGET = float(os.getenv("DAILY_BUDGET_USD", "5.0"))
# Approximate cost per chat call until token-aware accounting is wired up.
# Gemini 2.5 Pro pricing (~Q1 2026): $0.0005/1k input + $0.002/1k output.
# A typical chat round trip with retrieval is ~3000 input + ~800 output ≈ $0.003.
APPROX_COST_PER_CALL_USD = float(os.getenv("APPROX_COST_PER_CALL_USD", "0.003"))
current_spend = 0.0

def check_cost_ceiling() -> bool:
    return current_spend > DAILY_BUDGET

def record_call_cost(usd: float | None = None) -> None:
    """Increment running spend after a successful LLM call. Pass an actual
    cost when token usage is available (preferred); otherwise the
    approximate per-call constant is used so the counter at least moves."""
    global current_spend
    increment = usd if usd is not None else APPROX_COST_PER_CALL_USD
    current_spend += increment

def get_fallback_message() -> str:
    return "Agent unavailable due to budget limits. Please try again later."

def get_static_links() -> list:
    # These URLs should point to the GCS bucket assets
    assets_base = os.getenv("VITE_ASSETS_BASE_URL", "https://storage.googleapis.com/seanbearden-assets")
    return [
        {"name": "Resume", "url": f"{assets_base}/pdfs/Bearden_Resume_Online.pdf"},
        {"name": "CV", "url": f"{assets_base}/pdfs/Bearden_CV.pdf"}
    ]
