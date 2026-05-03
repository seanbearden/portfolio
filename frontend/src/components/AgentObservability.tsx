/**
 * Public observability dashboard tile for /about.
 *
 * Renders the Honeycomb / Grafana Cloud public board configured via
 * VITE_OBSERVABILITY_DASHBOARD_URL. When unset, the tile shows a
 * placeholder explaining the OTEL setup so the SEO/copy benefit lands
 * even before the live dashboard is provisioned.
 */
import { LineChart, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const DASHBOARD_URL = import.meta.env.VITE_OBSERVABILITY_DASHBOARD_URL as string | undefined;

export function AgentObservability() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <LineChart className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Agent Observability</h3>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Every chat request is traced end-to-end with OpenTelemetry, using the{" "}
          <a
            href="https://opentelemetry.io/docs/specs/semconv/gen-ai/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            GenAI semantic conventions
          </a>{" "}
          (ratified mid-2025). Spans cover the agent step, each tool call,
          the LLM call (with token usage + cost), and Core Web Vitals from
          the browser. Real-user telemetry, not synthetic.
        </p>

        {DASHBOARD_URL ? (
          <div className="mt-4">
            <iframe
              src={DASHBOARD_URL}
              title="Agent observability dashboard"
              className="w-full aspect-[16/9] rounded-md border bg-muted"
              loading="lazy"
            />
            <a
              href={DASHBOARD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              Open in new tab <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        ) : (
          <div className="mt-4 rounded-md border border-dashed border-muted-foreground/30 p-4 bg-muted/30">
            <p className="text-xs text-muted-foreground">
              Live dashboard pending. Set <code className="font-mono">VITE_OBSERVABILITY_DASHBOARD_URL</code> at build time
              to embed a Honeycomb / Grafana Cloud public board here.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
