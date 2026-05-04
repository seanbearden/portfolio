import os
import time
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from langfuse import Langfuse
from .schemas import ChatRequest, ChatResponse
from .guardrails import (
    is_prompt_injection,
    contains_pii,
    is_off_topic,
    check_cost_ceiling,
    get_fallback_message,
    get_static_links
)

# Initialize Langfuse
langfuse = Langfuse(
    public_key=os.getenv("LANGFUSE_PUBLIC_KEY"),
    secret_key=os.getenv("LANGFUSE_SECRET_KEY"),
    host=os.getenv("LANGFUSE_HOST", "https://cloud.langfuse.com")
)

limiter = Limiter(key_func=get_remote_address)
app = FastAPI()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Simple in-memory session rate limiting (for demo/Phase 2)
# In production, use Redis
session_limits = {}

def check_session_limit(session_id: str):
    now = time.time()
    if session_id not in session_limits:
        session_limits[session_id] = []

    # Filter for last 60 seconds
    session_limits[session_id] = [t for t in session_limits[session_id] if now - t < 60]

    if len(session_limits[session_id]) >= 10: # 10 requests per minute per session
        return False

    session_limits[session_id].append(now)
    return True

@app.post("/api/chat", response_model=ChatResponse)
@limiter.limit("20/minute")
async def chat(request: Request, chat_request: ChatRequest):
    # 1. Cost Ceiling
    if check_cost_ceiling():
        return ChatResponse(
            response=get_fallback_message(),
            safety_trigger=True,
            trigger_type="cost_ceiling",
            links=get_static_links()
        )

    # 2. Per-session Rate Limit
    if not check_session_limit(chat_request.session_id):
        raise HTTPException(status_code=429, detail="Session rate limit exceeded")

    # 3. Input Guardrails
    # Note: Langfuse Python SDK uses create_event/create_trace or decorators.
    # For this simplified implementation, we'll use create_event for firings.

    # Prompt Injection
    if is_prompt_injection(chat_request.message):
        try:
            langfuse.create_event(
                name="guardrail_firing",
                input=chat_request.message,
                metadata={"type": "prompt_injection", "session_id": chat_request.session_id},
                tags=["adversarial"]
            )
        except Exception:
            pass
        return ChatResponse(
            response="this looks like a prompt injection — can you rephrase?",
            safety_trigger=True,
            trigger_type="prompt_injection"
        )

    # PII Check
    if contains_pii(chat_request.message):
        try:
            langfuse.create_event(
                name="guardrail_firing",
                input=chat_request.message,
                metadata={"type": "pii_leak", "session_id": chat_request.session_id},
                tags=["adversarial"]
            )
        except Exception:
            pass
        return ChatResponse(
            response="I detected potential personal information in your message. For your safety, please don't share PII.",
            safety_trigger=True,
            trigger_type="pii_detection"
        )

    # Off-topic Check
    if is_off_topic(chat_request.message):
        return ChatResponse(
            response="I'm here to talk about Sean Bearden's professional background, resume, and projects. Can we stick to those topics?",
            safety_trigger=True,
            trigger_type="off_topic"
        )

    # 4. Mock LLM Response (for now)
    # In Phase 2, this will call Claude/Gemini
    ai_response = f"I've received your message about '{chat_request.message}'. I'm currently being updated to provide better answers!"

    # 5. Output Guardrails (PII leak and Off-topic detection on AI response)
    if contains_pii(ai_response):
        try:
            langfuse.create_event(
                name="guardrail_firing_output",
                input=ai_response,
                metadata={"type": "pii_leak_output", "session_id": chat_request.session_id},
                tags=["adversarial"]
            )
        except Exception:
            pass
        return ChatResponse(
            response="I apologize, but my response was filtered because it may have contained sensitive information.",
            safety_trigger=True,
            trigger_type="pii_detection_output"
        )

    if is_off_topic(ai_response):
        return ChatResponse(
            response="I apologize, but my response was filtered because it was off-topic.",
            safety_trigger=True,
            trigger_type="off_topic_output"
        )

    return ChatResponse(response=ai_response)

@app.get("/health")
async def health():
    return {"status": "ok"}
