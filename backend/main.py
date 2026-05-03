import logging
import os
from contextlib import asynccontextmanager
from typing import Optional

import httpx
from fastapi import FastAPI, HTTPException, Request, Response
from langchain_core.messages import HumanMessage
from pydantic import BaseModel

from .agent import app as agent_app
from .history import get_history, save_history
from .otel import init_telemetry, instrument_fastapi, shutdown_telemetry

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    # Init OTEL on startup so it's available for FastAPI auto-instrumentation
    # below. Shutdown flushes any buffered spans on container exit (the
    # MEDIUM finding from the previous OTEL PR's review).
    init_telemetry(service_name="portfolio-agent")
    yield
    shutdown_telemetry()


app = FastAPI(title="Sean Bearden Portfolio Agent API", lifespan=lifespan)
instrument_fastapi(app)

# Frontend OTLP proxy. Resolved once on first proxy request — this is a
# best-effort path; if the env vars aren't set, the endpoint just 503s.
_OTLP_FORWARD_ENDPOINT = os.getenv("OTEL_EXPORTER_OTLP_ENDPOINT")
_OTLP_FORWARD_HEADERS = {
    pair.split("=", 1)[0].strip(): pair.split("=", 1)[1].strip()
    for pair in (os.getenv("OTEL_EXPORTER_OTLP_HEADERS") or "").split(",")
    if "=" in pair
}


class QueryRequest(BaseModel):
    query: str
    session_id: Optional[str] = "anonymous"


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/chat")
async def chat(request: QueryRequest):
    try:
        history = get_history(request.session_id)
        current_messages = history + [HumanMessage(content=request.query)]
        state = {"messages": current_messages}
        result = agent_app.invoke(state)
        last_message = result["messages"][-1]
        save_history(request.session_id, result["messages"])
        return {
            "response": last_message.content,
            "session_id": request.session_id,
        }
    except Exception:
        # Log full traceback server-side; return generic message to client so
        # we don't leak file paths, env config, or stack frames.
        logger.exception("chat endpoint failed for session %s", request.session_id)
        raise HTTPException(status_code=500, detail="An internal error occurred.")


@app.post("/otlp/v1/traces")
async def otlp_proxy(request: Request) -> Response:
    """Proxy frontend-originated OTLP trace exports to the configured
    collector. Frontend posts protobuf bodies here; we forward with the
    backend's credentialed headers so the API key never ships in the
    browser bundle. Returns 503 when OTEL isn't configured server-side."""
    if not _OTLP_FORWARD_ENDPOINT:
        return Response(status_code=503, content=b"otlp proxy not configured")

    body = await request.body()
    upstream = f"{_OTLP_FORWARD_ENDPOINT.rstrip('/')}/v1/traces"
    headers = {
        "Content-Type": request.headers.get("Content-Type", "application/x-protobuf"),
        **_OTLP_FORWARD_HEADERS,
    }
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.post(upstream, content=body, headers=headers)
        return Response(content=r.content, status_code=r.status_code)
    except Exception:
        logger.exception("OTLP proxy upstream error")
        return Response(status_code=502, content=b"otlp upstream error")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
