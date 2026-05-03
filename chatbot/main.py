import logging
import os
import sys

import structlog
from fastapi import FastAPI
from pydantic import BaseModel

# Configure structured logging
structlog.configure(
    processors=[
        structlog.contextvars.merge_contextvars,
        structlog.processors.add_log_level,
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer(),
    ],
    logger_factory=structlog.PrintLoggerFactory(),
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()

# Set up standard logging to redirect to structlog if needed
logging.basicConfig(
    format="%(message)s",
    stream=sys.stdout,
    level=logging.INFO,
)

app = FastAPI(title="Portfolio Agent API")


class HealthResponse(BaseModel):
    status: str


@app.get("/api/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    logger.info("health_check_triggered")
    return HealthResponse(status="ok")


if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", 8080))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
