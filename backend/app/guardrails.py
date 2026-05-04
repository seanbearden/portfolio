import os
import re
from presidio_analyzer import AnalyzerEngine
from transformers import pipeline
import torch

# Initialize Presidio
analyzer = AnalyzerEngine()

# Initialize Prompt Injection Classifier
# Use a smaller model if needed, but the requested one is usually best for accuracy
try:
    injection_classifier = pipeline(
        "text-classification",
        model="ProtectAI/deberta-v3-base-prompt-injection-v2",
        device="cuda" if torch.cuda.is_available() else "cpu"
    )
except Exception:
    injection_classifier = None

def is_prompt_injection(text: str) -> bool:
    if injection_classifier:
        results = injection_classifier(text)
        # Typically returns [{'label': 'INJECTION', 'score': 0.99}]
        for res in results:
            if res['label'] == 'INJECTION' and res['score'] > 0.5:
                return True

    # Simple regex fallback
    injection_patterns = [
        r"ignore all previous instructions",
        r"system prompt",
        r"you are now",
        r"new rule"
    ]
    for pattern in injection_patterns:
        if re.search(pattern, text, re.IGNORECASE):
            return True

    return False

def contains_pii(text: str) -> bool:
    # Use standard Presidio analyzer
    results = analyzer.analyze(text=text, entities=[], language='en')
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

def is_off_topic(text: str) -> bool:
    # Basic keyword check for Phase 2: focus on Sean Bearden, Resume, Physics, Data Science
    keywords = [
        "sean", "bearden", "resume", "cv", "physics", "data science",
        "phd", "portfolio", "projects", "blog", "publications"
    ]
    text_lower = text.lower()
    if any(kw in text_lower for kw in keywords):
        return False

    # If the message is very short, it might not have keywords but be on topic (e.g. "Hi")
    if len(text.split()) < 3:
        return False

    return True

# Simple mock for cost ceiling
DAILY_BUDGET = 5.0  # USD
current_spend = 0.0

def check_cost_ceiling() -> bool:
    global current_spend
    # In a real app, this would query a database or cache (Redis)
    return current_spend > DAILY_BUDGET

def get_fallback_message() -> str:
    return "Agent unavailable due to budget limits. Please try again later."

def get_static_links() -> list:
    # These URLs should point to the GCS bucket assets
    assets_base = os.getenv("VITE_ASSETS_BASE_URL", "https://storage.googleapis.com/seanbearden-assets")
    return [
        {"name": "Resume", "url": f"{assets_base}/pdfs/Bearden_Resume_Online.pdf"},
        {"name": "CV", "url": f"{assets_base}/pdfs/Bearden_CV.pdf"}
    ]
