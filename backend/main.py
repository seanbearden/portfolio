from fastapi import FastAPI, Request
from pydantic import BaseModel
from .otel import setup_otel
from opentelemetry import trace
import time
import random

app = FastAPI()
tracer = setup_otel(app)

class ChatRequest(BaseModel):
    message: str

@app.post("/api/chat")
async def chat(request: ChatRequest):
    with tracer.start_as_current_span("agent_flow") as span:
        # Mocking an agent flow with manual spans and GenAI attributes

        # 1. Vector Store Query
        with tracer.start_as_current_span("vector_store_query") as vs_span:
            time.sleep(0.1)
            vs_span.set_attribute("db.system", "chroma")
            vs_span.set_attribute("db.operation", "search")

        # 2. LLM Call (GenAI Semantic Conventions)
        with tracer.start_as_current_span("llm_call") as llm_span:
            # mid-2025 GenAI semantic conventions
            llm_span.set_attribute("gen_ai.system", "anthropic")
            llm_span.set_attribute("gen_ai.request.model", "claude-3-5-sonnet-20241022")
            llm_span.set_attribute("gen_ai.operation.name", "chat")

            time.sleep(0.5) # Simulate latency

            input_tokens = len(request.message.split()) * 2
            output_tokens = random.randint(50, 200)

            llm_span.set_attribute("gen_ai.usage.input_tokens", input_tokens)
            llm_span.set_attribute("gen_ai.usage.output_tokens", output_tokens)

        # 3. Tool Call
        with tracer.start_as_current_span("tool_call") as tool_span:
            tool_span.set_attribute("gen_ai.tool.name", "search_publications")
            time.sleep(0.2)

        return {
            "response": f"Echo: {request.message}. (Traced with GenAI OTEL conventions)",
            "usage": {
                "input_tokens": input_tokens,
                "output_tokens": output_tokens
            }
        }

@app.get("/health")
async def health():
    return {"status": "ok"}
