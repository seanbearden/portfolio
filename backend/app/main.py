import logging
import os

from fastapi import FastAPI, Request
from langfuse import Langfuse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from .guardrails import (
    check_cost_ceiling,
    contains_pii,
    get_fallback_message,
    get_static_links,
    is_off_topic,
    is_prompt_injection,
    record_call_cost,
)
from .schemas import ChatRequest, ChatResponse

logger = logging.getLogger(__name__)

# Initialize Langfuse
langfuse = Langfuse(
    public_key=os.getenv("LANGFUSE_PUBLIC_KEY"),
    secret_key=os.getenv("LANGFUSE_SECRET_KEY"),
    host=os.getenv("LANGFUSE_HOST", "https://cloud.langfuse.com"),
)

# slowapi rate limiting. Backing storage: Redis if `REDIS_URL` is set,
# otherwise in-memory (per-instance). The in-memory path is fine for low-
# traffic single-instance Cloud Run; once we run with min-instances > 1 or
# expect any meaningful traffic, set REDIS_URL pointing at Memorystore so
# the limit applies across the fleet.
_storage_uri = os.getenv("REDIS_URL") or "memory://"
if _storage_uri == "memory://":
    logger.warning(
        "slowapi rate limiter using in-memory storage — counts are per-instance. "
        "Set REDIS_URL to a Memorystore Redis instance for multi-instance correctness."
    )
limiter = Limiter(key_func=get_remote_address, storage_uri=_storage_uri)
app = FastAPI()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


@app.post("/api/chat", response_model=ChatResponse)
@limiter.limit("20/minute")
async def chat(request: Request, chat_request: ChatRequest):
    # NOTE: The previous in-memory `session_limits` dict was dropped — on
    # Cloud Run it would diverge per instance, and slowapi's `@limiter.limit`
    # above is the same surface (per-IP token bucket). Re-introduce a
    # per-session check only when REDIS_URL is wired so it can be shared.

    # 1. Cost Ceiling — also process-local for now; back with Redis later.
    if check_cost_ceiling():
        return ChatResponse(
            response=get_fallback_message(),
            safety_trigger=True,
            trigger_type="cost_ceiling",
            links=get_static_links()
        )

    # 2. Input Guardrails
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

    # Successful response — record cost so the daily-budget guardrail
    # actually accumulates. Once token usage is wired in (Phase 2 LLM
    # integration), pass the computed dollar cost; until then we use the
    # approximate per-call constant.
    record_call_cost()
    return ChatResponse(response=ai_response)

@app.get("/health")
async def health():
    return {"status": "ok"}
