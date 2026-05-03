/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock the OpenTelemetry SDK + instrumentation modules so the tests
// never touch a real exporter. We assert that initTelemetry wires up
// the right pieces (or short-circuits when disabled) rather than
// validating the SDK itself.
const registerMock = vi.fn();
const addSpanProcessorMock = vi.fn();
const registerInstrumentationsMock = vi.fn();
const exporterCtorMock = vi.fn();
const fetchInstrumentationCtorMock = vi.fn();
const documentLoadInstrumentationCtorMock = vi.fn();
const startSpanMock = vi.fn(() => ({
  setAttribute: vi.fn(),
  end: vi.fn(),
}));

vi.mock("@opentelemetry/sdk-trace-web", () => ({
  WebTracerProvider: class {
    register = registerMock;
    addSpanProcessor = addSpanProcessorMock;
  },
  BatchSpanProcessor: class {
    // Explicit field + assignment in body (parameter properties like
    // `constructor(public exporter)` are banned by tsconfig's
    // `erasableSyntaxOnly`).
    exporter: unknown;
    constructor(exporter: unknown) {
      this.exporter = exporter;
    }
  },
}));

vi.mock("@opentelemetry/exporter-trace-otlp-http", () => ({
  OTLPTraceExporter: class {
    url: unknown;
    constructor(opts: { url?: string } = {}) {
      exporterCtorMock(opts);
      this.url = opts?.url;
    }
  },
}));

vi.mock("@opentelemetry/instrumentation", () => ({
  registerInstrumentations: registerInstrumentationsMock,
}));

vi.mock("@opentelemetry/instrumentation-fetch", () => ({
  FetchInstrumentation: class {
    constructor(opts: unknown) {
      fetchInstrumentationCtorMock(opts);
    }
  },
}));

vi.mock("@opentelemetry/instrumentation-document-load", () => ({
  DocumentLoadInstrumentation: class {
    constructor() {
      documentLoadInstrumentationCtorMock();
    }
  },
}));

vi.mock("@opentelemetry/resources", () => ({
  Resource: class {
    attrs: unknown;
    constructor(attrs: unknown) {
      this.attrs = attrs;
    }
  },
}));

vi.mock("@opentelemetry/semantic-conventions", () => ({
  ATTR_SERVICE_NAME: "service.name",
  ATTR_SERVICE_VERSION: "service.version",
}));

vi.mock("@opentelemetry/api", () => ({
  context: { active: vi.fn(() => ({})) },
  trace: {
    getTracer: vi.fn(() => ({ startSpan: startSpanMock })),
  },
}));

// Web Vitals — call back synchronously with a representative payload.
const onCLSMock = vi.fn();
const onFCPMock = vi.fn();
const onINPMock = vi.fn();
const onLCPMock = vi.fn();
const onTTFBMock = vi.fn();
vi.mock("web-vitals", () => ({
  onCLS: (cb: any) => onCLSMock(cb),
  onFCP: (cb: any) => onFCPMock(cb),
  onINP: (cb: any) => onINPMock(cb),
  onLCP: (cb: any) => onLCPMock(cb),
  onTTFB: (cb: any) => onTTFBMock(cb),
}));

describe("initTelemetry", () => {
  beforeEach(() => {
    vi.resetModules();
    registerMock.mockClear();
    addSpanProcessorMock.mockClear();
    registerInstrumentationsMock.mockClear();
    exporterCtorMock.mockClear();
    fetchInstrumentationCtorMock.mockClear();
    documentLoadInstrumentationCtorMock.mockClear();
    startSpanMock.mockClear();
    onCLSMock.mockClear();
    onFCPMock.mockClear();
    onINPMock.mockClear();
    onLCPMock.mockClear();
    onTTFBMock.mockClear();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("registers a tracer provider with OTLP exporter pointed at the configured endpoint", async () => {
    vi.stubEnv("VITE_OTLP_ENDPOINT", "/api/otlp");
    const { initTelemetry } = await import("./otel");

    initTelemetry();

    expect(exporterCtorMock).toHaveBeenCalledWith({ url: "/api/otlp/v1/traces" });
    expect(addSpanProcessorMock).toHaveBeenCalled();
    expect(registerMock).toHaveBeenCalled();
  });

  it("strips trailing slash from VITE_OTLP_ENDPOINT before composing the traces URL", async () => {
    vi.stubEnv("VITE_OTLP_ENDPOINT", "https://collector.example.com/");
    const { initTelemetry } = await import("./otel");

    initTelemetry();

    expect(exporterCtorMock).toHaveBeenCalledWith({
      url: "https://collector.example.com/v1/traces",
    });
  });

  it("registers DocumentLoad and Fetch instrumentations with same-origin-only trace propagation", async () => {
    vi.stubEnv("VITE_OTLP_ENDPOINT", "/api/otlp");
    const { initTelemetry } = await import("./otel");

    initTelemetry();

    expect(documentLoadInstrumentationCtorMock).toHaveBeenCalled();
    // FetchInstrumentation should be called with a regex that matches
    // requests to the same origin only — never `/.*/` which would leak
    // traceparent to third-party domains.
    expect(fetchInstrumentationCtorMock).toHaveBeenCalledTimes(1);
    const fetchCallArgs = fetchInstrumentationCtorMock.mock.calls[0][0] as {
      propagateTraceHeaderCorsUrls: RegExp[];
    };
    expect(fetchCallArgs.propagateTraceHeaderCorsUrls).toHaveLength(1);
    const re = fetchCallArgs.propagateTraceHeaderCorsUrls[0];
    expect(re).toBeInstanceOf(RegExp);
    // Same-origin URLs match.
    expect(re.test(`${window.location.origin}/api/chat`)).toBe(true);
    // Third-party origins do NOT match.
    expect(re.test("https://evil.example.com/api")).toBe(false);
    expect(registerInstrumentationsMock).toHaveBeenCalled();
  });

  it("subscribes to all five Core Web Vitals when telemetry is enabled", async () => {
    vi.stubEnv("VITE_OTLP_ENDPOINT", "/api/otlp");
    const { initTelemetry } = await import("./otel");

    initTelemetry();

    expect(onCLSMock).toHaveBeenCalledTimes(1);
    expect(onFCPMock).toHaveBeenCalledTimes(1);
    expect(onINPMock).toHaveBeenCalledTimes(1);
    expect(onLCPMock).toHaveBeenCalledTimes(1);
    expect(onTTFBMock).toHaveBeenCalledTimes(1);
  });

  it("emits a span per Web Vitals callback with the right attributes", async () => {
    vi.stubEnv("VITE_OTLP_ENDPOINT", "/api/otlp");
    const { initTelemetry } = await import("./otel");

    initTelemetry();

    // Capture the registered CLS callback and invoke it.
    const clsCallback = onCLSMock.mock.calls[0][0] as (m: any) => void;
    const setAttributeMock = vi.fn();
    const endMock = vi.fn();
    startSpanMock.mockReturnValueOnce({ setAttribute: setAttributeMock, end: endMock });

    clsCallback({ value: 0.05, rating: "good" });

    expect(startSpanMock).toHaveBeenCalledWith("web-vital.CLS", undefined, expect.anything());
    expect(setAttributeMock).toHaveBeenCalledWith("web_vital.name", "CLS");
    expect(setAttributeMock).toHaveBeenCalledWith("web_vital.value", 0.05);
    expect(setAttributeMock).toHaveBeenCalledWith("web_vital.rating", "good");
    expect(endMock).toHaveBeenCalled();
  });

  it("is a no-op when VITE_OTLP_ENDPOINT is empty", async () => {
    vi.stubEnv("VITE_OTLP_ENDPOINT", "");
    const { initTelemetry } = await import("./otel");

    initTelemetry();

    expect(registerMock).not.toHaveBeenCalled();
    expect(exporterCtorMock).not.toHaveBeenCalled();
    expect(registerInstrumentationsMock).not.toHaveBeenCalled();
    expect(onCLSMock).not.toHaveBeenCalled();
  });

  it("is idempotent — second call is a no-op", async () => {
    vi.stubEnv("VITE_OTLP_ENDPOINT", "/api/otlp");
    const { initTelemetry } = await import("./otel");

    initTelemetry();
    initTelemetry();

    expect(registerMock).toHaveBeenCalledTimes(1);
    expect(onCLSMock).toHaveBeenCalledTimes(1);
  });
});
