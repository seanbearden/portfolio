import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { onCLS, onLCP, onFCP, onTTFB, type Metric } from 'web-vitals';
import { trace } from '@opentelemetry/api';

export function initOTEL() {
  const exporter = new OTLPTraceExporter({
    url: (import.meta.env.VITE_OTLP_EXPORTER_URL as string) || 'http://localhost:4318/v1/traces',
    headers: import.meta.env.VITE_OTLP_HEADERS ? JSON.parse(import.meta.env.VITE_OTLP_HEADERS as string) : {},
  });

  const provider = new WebTracerProvider({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: 'portfolio-frontend',
    }),
  });

  // @ts-ignore
  provider.addSpanProcessor(new BatchSpanProcessor(exporter));
  provider.register();

  registerInstrumentations({
    instrumentations: [
      new FetchInstrumentation({
        propagateTraceHeaderCorsUrls: [
          /.*\/api\/.*/,
        ],
      }),
      new DocumentLoadInstrumentation(),
    ],
  });

  const tracer = trace.getTracer('web-vitals');

  const recordMetric = ({ name, value, id }: Metric) => {
    const span = tracer.startSpan(`web-vital-${name.toLowerCase()}`, {
      attributes: {
        'web_vital.name': name,
        'web_vital.value': value,
        'web_vital.id': id,
      },
    });
    span.end();
  };

  onCLS(recordMetric);
  onLCP(recordMetric);
  onFCP(recordMetric);
  onTTFB(recordMetric);
}
