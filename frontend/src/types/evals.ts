export interface EvalMetrics {
  hallucination_rate: number;
  retrieval_precision: number;
  refusal_correctness: number;
  citation_validity: number;
  latency_p50: number;
  latency_p95: number;
  avg_cost: number;
}

export interface EvalResult {
  date: string;
  metrics: EvalMetrics;
  samples?: {
    good: string;
    refusal: string;
  };
}
