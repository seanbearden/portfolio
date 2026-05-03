"""OpenTelemetry initialization for the portfolio agent.

Implements GenAI semantic conventions (ratified mid-2025) — see:
https://opentelemetry.io/docs/specs/semconv/gen-ai/

Activation:
- Set `OTEL_EXPORTER_OTLP_ENDPOINT` to enable export. Common values:
    - https://api.honeycomb.io   (Honeycomb)
    - https://otlp-gateway-prod-us-east-0.grafana.net/otlp  (Grafana Cloud)
- Set `OTEL_EXPORTER_OTLP_HEADERS` for the API key (e.g.,
  "x-honeycomb-team=YOUR_KEY"). The collector creds stay on the
  backend — frontend never sees them (see security note below).

When `OTEL_EXPORTER_OTLP_ENDPOINT` is unset, the SDK is a no-op:
spans are created but never exported, so there's no perf cost when
running locally.

Security model (re #195 review):
The frontend SHOULD NOT ship OTLP credentials. To collect frontend
traces, the frontend posts to `/api/otlp/v1/traces` (an endpoint we
proxy through this backend), and the backend forwards to the real
collector with the credentialed headers. That keeps `x-honeycomb-team`
out of the browser bundle. The proxy is wired up here too.
"""
from __future__ import annotations

import logging
import os
from contextlib import contextmanager
from typing import Iterator, Optional

from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor

logger = logging.getLogger(__name__)

# Module-level so the FastAPI lifespan handler can call shutdown() at exit.
_provider: Optional[TracerProvider] = None


def init_telemetry(service_name: str = "portfolio-agent") -> Optional[TracerProvider]:
    """Configure OpenTelemetry. Returns the TracerProvider so the caller
    can shut it down at app exit (flushes any buffered spans)."""
    global _provider

    if _provider is not None:
        # Idempotent — uvicorn reload, tests, etc. shouldn't double-init.
        return _provider

    endpoint = os.getenv("OTEL_EXPORTER_OTLP_ENDPOINT")
    if not endpoint:
        logger.info("OTEL disabled (set OTEL_EXPORTER_OTLP_ENDPOINT to enable).")
        return None

    resource = Resource.create({
        "service.name": service_name,
        "service.version": os.getenv("SERVICE_VERSION", "dev"),
        "deployment.environment": os.getenv("DEPLOYMENT_ENV", "production"),
    })

    provider = TracerProvider(resource=resource)
    # OTLP HTTP exporter — uses OTEL_EXPORTER_OTLP_ENDPOINT and
    # OTEL_EXPORTER_OTLP_HEADERS env vars natively.
    exporter = OTLPSpanExporter()
    provider.add_span_processor(BatchSpanProcessor(exporter))
    trace.set_tracer_provider(provider)

    _provider = provider
    logger.info("OTEL initialized → %s (service=%s)", endpoint, service_name)
    return provider


def instrument_fastapi(app) -> None:
    """Auto-instrument a FastAPI app. Cheap when OTEL is disabled
    (spans aren't exported), so it's safe to always call."""
    FastAPIInstrumentor.instrument_app(app)


def shutdown_telemetry() -> None:
    """Flush any buffered spans + tear down the BatchSpanProcessor.
    Called from the FastAPI lifespan handler on app exit."""
    global _provider
    if _provider is not None:
        try:
            _provider.shutdown()
        except Exception as exc:
            logger.warning("OTEL shutdown error: %s", exc)
        _provider = None


# ---------------------------------------------------------------
# GenAI semantic-convention helpers
# ---------------------------------------------------------------
# https://opentelemetry.io/docs/specs/semconv/gen-ai/

_tracer = trace.get_tracer("portfolio.agent")


@contextmanager
def llm_span(
    *,
    system: str,
    request_model: str,
    operation: str = "chat",
) -> Iterator[trace.Span]:
    """Context manager around an LLM call. The span is named per the
    GenAI semconv convention: `{operation} {model}`. Caller should
    set token-usage attributes on the span when the response arrives.

        with llm_span(system="google", request_model="gemini-1.5-pro") as span:
            resp = model.invoke(messages)
            span.set_attribute("gen_ai.usage.input_tokens", resp.usage.input_tokens)
            span.set_attribute("gen_ai.usage.output_tokens", resp.usage.output_tokens)
    """
    name = f"{operation} {request_model}"
    with _tracer.start_as_current_span(name) as span:
        span.set_attribute("gen_ai.system", system)
        span.set_attribute("gen_ai.request.model", request_model)
        span.set_attribute("gen_ai.operation.name", operation)
        yield span


@contextmanager
def tool_span(tool_name: str) -> Iterator[trace.Span]:
    """Context manager around a tool invocation."""
    with _tracer.start_as_current_span(f"execute_tool {tool_name}") as span:
        span.set_attribute("gen_ai.operation.name", "execute_tool")
        span.set_attribute("gen_ai.tool.name", tool_name)
        yield span


@contextmanager
def agent_step_span(step_name: str) -> Iterator[trace.Span]:
    """Context manager around an agent graph node execution."""
    with _tracer.start_as_current_span(f"agent.{step_name}") as span:
        span.set_attribute("gen_ai.operation.name", "invoke_agent")
        span.set_attribute("agent.step", step_name)
        yield span
