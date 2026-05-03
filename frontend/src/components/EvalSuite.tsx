import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchLatestEval, fetchEvalHistory } from "@/utils/content";
import type { EvalResult, EvalMetrics } from "@/types/evals";
import { Sparkline } from "@/components/ui/sparkline";
import { ExternalLink, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export function EvalSuite() {
  const [latest, setLatest] = useState<EvalResult | null>(null);
  const [history, setHistory] = useState<EvalResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [l, h] = await Promise.all([fetchLatestEval(), fetchEvalHistory()]);
      setLatest(l);
      setHistory(h);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className="animate-pulse h-48 bg-muted rounded-lg" />;
  if (!latest) return null;

  const metrics: { key: keyof EvalMetrics; label: string; format: (v: number) => string; inverse?: boolean }[] = [
    { key: "hallucination_rate", label: "Hallucination Rate", format: (v) => `${(v * 100).toFixed(1)}%`, inverse: true },
    { key: "retrieval_precision", label: "Retrieval Precision@5", format: (v) => `${(v * 100).toFixed(1)}%` },
    { key: "refusal_correctness", label: "Refusal Correctness", format: (v) => `${(v * 100).toFixed(1)}%` },
    { key: "citation_validity", label: "Citation Validity", format: (v) => `${(v * 100).toFixed(1)}%` },
    { key: "latency_p50", label: "Latency (p50)", format: (v) => `${v.toFixed(2)}s`, inverse: true },
    { key: "latency_p95", label: "Latency (p95)", format: (v) => `${v.toFixed(2)}s`, inverse: true },
    { key: "avg_cost", label: "Cost / Query", format: (v) => `$${v.toFixed(4)}`, inverse: true },
  ];

  return (
    <section className="mt-12">
      <div className="flex items-center gap-2 mb-6">
        <h2 className="text-2xl font-semibold">LLM Evaluation Suite</h2>
        <div className="group relative">
          <Info className="h-4 w-4 text-muted-foreground cursor-help" />
          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-2 bg-popover text-popover-foreground text-xs rounded border shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Nightly evals via Langfuse. Evaluates grounding, safety, and accuracy across 75+ test cases.
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((m) => {
          const historyData = history.map((h) => h.metrics[m.key]).filter((v) => v !== undefined);
          const currentVal = latest.metrics[m.key];

          return (
            <Card key={m.key} className="overflow-hidden">
              <CardHeader className="pb-2 space-y-0">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {m.label}
                </p>
                <div className="flex items-baseline justify-between">
                  <CardTitle className="text-2xl font-bold">
                    {m.format(currentVal)}
                  </CardTitle>
                  <Sparkline
                    data={historyData}
                    color={m.inverse ? (currentVal > 0.1 ? "#ef4444" : "#10b981") : (currentVal > 0.8 ? "#10b981" : "#f59e0b")}
                  />
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {latest.samples && (
        <div className="mt-6 flex flex-wrap gap-4 text-sm">
          <a
            href={latest.samples.good}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ExternalLink className="h-3 w-3" /> View Trace: Successful Q&A
          </a>
          <a
            href={latest.samples.refusal}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ExternalLink className="h-3 w-3" /> View Trace: Correct Refusal
          </a>
        </div>
      )}

      <p className="mt-4 text-xs text-muted-foreground italic">
        Last updated: {new Date(latest.date).toLocaleDateString()} &middot; Powered by Langfuse
      </p>
    </section>
  );
}
