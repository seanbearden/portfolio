/**
 * Frontend OpenTelemetry initialization.
 *
 * Critical security note: this module never ships collector credentials
 * to the browser. The OTLP exporter posts to `/api/otlp/v1/traces`, a
 * same-origin path proxied by the backend (see backend/main.py
 * otlp_proxy). The backend forwards to the real collector with the
 * `OTEL_EXPORTER_OTLP_HEADERS` API key kept server-side. Closes the
 * security-HIGH finding from PR #195's Gemini review.
 *
 * Activation: setting `VITE_OTLP_ENDPOINT="/api/otlp"` (default below)
 * enables export. Set to empty string to disable. The whole module is
 * a no-op when init() isn't called.
 *
 * Auto-instruments:
 * - Document load timings (≈ Core Web Vitals, plus span structure)
 * - Outbound fetch (so /api/chat round-trips appear as spans, with
 *   traceparent headers propagated to the backend for end-to-end traces)
 *
 * Web Vitals (CLS / INP / LCP / FCP / TTFB) are reported as separate
 * spans via the web-vitals library — see initWebVitals() below.
 */
import { context, trace } from "@opentelemetry/api";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { DocumentLoadInstrumentation } from "@opentelemetry/instrumentation-document-load";
import { FetchInstrumentation } from "@opentelemetry/instrumentation-fetch";
import { Resource } from "@opentelemetry/resources";
import { WebTracerProvider, BatchSpanProcessor } from "@opentelemetry/sdk-trace-web";
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from "@opentelemetry/semantic-conventions";
import { onCLS, onFCP, onINP, onLCP, onTTFB } from "web-vitals";

const SERVICE_NAME = "portfolio-frontend";
const SERVICE_VERSION = (import.meta.env.VITE_SERVICE_VERSION as string) || "dev";
// Defaults to the same-origin backend proxy. Can be overridden to a
// direct collector URL via VITE_OTLP_ENDPOINT, but only do that for
// public-by-design collectors (no credentialed headers in browser).
const OTLP_ENDPOINT =
  (import.meta.env.VITE_OTLP_ENDPOINT as string | undefined) ?? "/api/otlp";

let _initialized = false;

/** Regex-escape a string so it can be safely embedded in a RegExp.
 *  Used to anchor propagateTraceHeaderCorsUrls to window.location.origin
 *  without letting any URL-special chars in the origin (rare but
 *  possible — IPv6 has colons, ports may have dots) get interpreted
 *  as regex metacharacters. */
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function initTelemetry(): void {
  if (_initialized) return;
  if (!OTLP_ENDPOINT) return; // disabled

  const resource = new Resource({
    [ATTR_SERVICE_NAME]: SERVICE_NAME,
    [ATTR_SERVICE_VERSION]: SERVICE_VERSION,
  });

  const provider = new WebTracerProvider({ resource });
  const exporter = new OTLPTraceExporter({
    url: `${OTLP_ENDPOINT.replace(/\/$/, "")}/v1/traces`,
  });
  provider.addSpanProcessor(new BatchSpanProcessor(exporter));
  provider.register();

  registerInstrumentations({
    instrumentations: [
      new DocumentLoadInstrumentation(),
      // Propagate traceparent ONLY to same-origin requests — the
      // backend's /chat (and /api/otlp) span links into the frontend's
      // fetch span, but we don't leak trace context to third-party
      // domains. `/.*/` would have shipped traceparent on every fetch.
      new FetchInstrumentation({
        propagateTraceHeaderCorsUrls: [
          new RegExp("^" + escapeRegExp(window.location.origin)),
        ],
      }),
    ],
  });

  _initialized = true;
  initWebVitals();
}

/** Emit one span per Core Web Vitals metric so the backend dashboard
 *  shows real-user CLS/INP/LCP alongside server latency. */
function initWebVitals(): void {
  const tracer = trace.getTracer("portfolio.web-vitals");

  function recordVital(name: string, value: number, rating?: string) {
    // Brief synthetic span — start, set attrs, end. Honors current trace
    // context so the metric ties to the page-load root span.
    const span = tracer.startSpan(`web-vital.${name}`, undefined, context.active());
    span.setAttribute("web_vital.name", name);
    span.setAttribute("web_vital.value", value);
    if (rating) span.setAttribute("web_vital.rating", rating);
    span.end();
  }

  onCLS((m) => recordVital("CLS", m.value, m.rating));
  onFCP((m) => recordVital("FCP", m.value, m.rating));
  onINP((m) => recordVital("INP", m.value, m.rating));
  onLCP((m) => recordVital("LCP", m.value, m.rating));
  onTTFB((m) => recordVital("TTFB", m.value, m.rating));
}
