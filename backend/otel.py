import os
from opentelemetry import trace
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor

def setup_otel(app, service_name="portfolio-backend"):
    resource = Resource.create({"service.name": service_name})

    # Use OTLP exporter (default for Honeycomb/Grafana Cloud)
    # Environment variables like OTEL_EXPORTER_OTLP_ENDPOINT and
    # OTEL_EXPORTER_OTLP_HEADERS (for Honeycomb API key) should be set.
    exporter = OTLPSpanExporter()

    span_processor = BatchSpanProcessor(exporter)
    provider = TracerProvider(resource=resource)
    provider.add_span_processor(span_processor)
    trace.set_tracer_provider(provider)

    # Automatic instrumentation for FastAPI
    FastAPIInstrumentor.instrument_app(app)

    return trace.get_tracer(__name__)
