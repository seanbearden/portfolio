"""Tests for backend.otel — GenAI semconv span helpers + lifecycle.

These tests don't touch a real OTLP collector. We use the SDK's
in-memory span exporter so we can assert spans were emitted with the
right attributes, and a minimal lifecycle test so the init/shutdown
contract is enforced.
"""
import os
from unittest.mock import patch

import pytest
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import SimpleSpanProcessor
from opentelemetry.sdk.trace.export.in_memory_span_exporter import InMemorySpanExporter

# Always import after the OTEL SDK so the module-level state is fresh.
from backend import otel as otel_mod


@pytest.fixture(autouse=True)
def reset_otel_state():
    """Each test starts with a fresh tracer provider and a clean
    module-level _provider in backend.otel."""
    # Tear down any provider from a prior test.
    otel_mod._provider = None
    # Install our in-memory exporter so spans created by helpers are
    # captured for assertion.
    exporter = InMemorySpanExporter()
    provider = TracerProvider()
    provider.add_span_processor(SimpleSpanProcessor(exporter))
    trace.set_tracer_provider(provider)
    # Refresh the module's tracer to point at the new provider.
    otel_mod._tracer = trace.get_tracer("portfolio.agent")
    yield exporter
    otel_mod._provider = None


class TestInitTelemetry:
    def test_returns_none_when_endpoint_unset(self, monkeypatch):
        monkeypatch.delenv("OTEL_EXPORTER_OTLP_ENDPOINT", raising=False)
        result = otel_mod.init_telemetry()
        assert result is None

    def test_creates_provider_when_endpoint_set(self, monkeypatch):
        monkeypatch.setenv("OTEL_EXPORTER_OTLP_ENDPOINT", "https://example.com")
        with patch("backend.otel.OTLPSpanExporter") as exporter_cls:
            result = otel_mod.init_telemetry(service_name="test-svc")
        assert result is not None
        assert isinstance(result, TracerProvider)
        # Service name attribute applied on the resource.
        attrs = result.resource.attributes
        assert attrs.get("service.name") == "test-svc"
        exporter_cls.assert_called_once()

    def test_is_idempotent(self, monkeypatch):
        monkeypatch.setenv("OTEL_EXPORTER_OTLP_ENDPOINT", "https://example.com")
        with patch("backend.otel.OTLPSpanExporter"):
            first = otel_mod.init_telemetry()
            second = otel_mod.init_telemetry()
        assert first is second

    def test_shutdown_clears_module_state(self, monkeypatch):
        monkeypatch.setenv("OTEL_EXPORTER_OTLP_ENDPOINT", "https://example.com")
        with patch("backend.otel.OTLPSpanExporter"):
            otel_mod.init_telemetry()
        assert otel_mod._provider is not None
        otel_mod.shutdown_telemetry()
        assert otel_mod._provider is None

    def test_shutdown_is_safe_when_never_initialized(self):
        # Should not raise.
        otel_mod._provider = None
        otel_mod.shutdown_telemetry()


class TestSpanHelpers:
    def test_llm_span_sets_genai_request_attributes(self, reset_otel_state):
        exporter = reset_otel_state
        with otel_mod.llm_span(system="google", request_model="gemini-1.5-pro") as span:
            span.set_attribute("gen_ai.usage.input_tokens", 42)

        spans = exporter.get_finished_spans()
        assert len(spans) == 1
        s = spans[0]
        assert s.name == "chat gemini-1.5-pro"
        assert s.attributes["gen_ai.system"] == "google"
        assert s.attributes["gen_ai.request.model"] == "gemini-1.5-pro"
        assert s.attributes["gen_ai.operation.name"] == "chat"
        assert s.attributes["gen_ai.usage.input_tokens"] == 42

    def test_llm_span_honors_custom_operation(self, reset_otel_state):
        exporter = reset_otel_state
        with otel_mod.llm_span(
            system="anthropic",
            request_model="claude-3-5-sonnet",
            operation="text_completion",
        ):
            pass

        spans = exporter.get_finished_spans()
        assert spans[0].name == "text_completion claude-3-5-sonnet"
        assert spans[0].attributes["gen_ai.operation.name"] == "text_completion"

    def test_tool_span_uses_execute_tool_name(self, reset_otel_state):
        exporter = reset_otel_state
        with otel_mod.tool_span("search_blog"):
            pass

        spans = exporter.get_finished_spans()
        assert spans[0].name == "execute_tool search_blog"
        assert spans[0].attributes["gen_ai.operation.name"] == "execute_tool"
        assert spans[0].attributes["gen_ai.tool.name"] == "search_blog"

    def test_agent_step_span_carries_step_name(self, reset_otel_state):
        exporter = reset_otel_state
        with otel_mod.agent_step_span("call_model"):
            pass

        spans = exporter.get_finished_spans()
        assert spans[0].name == "agent.call_model"
        assert spans[0].attributes["gen_ai.operation.name"] == "invoke_agent"
        assert spans[0].attributes["agent.step"] == "call_model"

    def test_nested_spans_form_parent_child(self, reset_otel_state):
        exporter = reset_otel_state
        with otel_mod.agent_step_span("call_model"):
            with otel_mod.llm_span(system="google", request_model="gemini-1.5-pro"):
                pass

        spans = exporter.get_finished_spans()
        assert len(spans) == 2
        # Children finish before parents in the SimpleSpanProcessor flush order.
        llm, agent = spans
        assert agent.name == "agent.call_model"
        assert llm.name == "chat gemini-1.5-pro"
        # Parent-child relationship via span context.
        assert llm.parent is not None
        assert llm.parent.span_id == agent.context.span_id
