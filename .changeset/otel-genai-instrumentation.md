---
"portfolio": minor
---

Add OpenTelemetry GenAI semantic-convention instrumentation to the portfolio agent — backend traces every chat turn (agent step, tool calls, LLM call with token-usage attributes), frontend traces page load + Core Web Vitals + outbound `/api/chat` fetches with traceparent propagation. Frontend exports route through the backend so collector API keys never ship in the browser. New "Agent Observability" tile on /about renders the public dashboard when configured.
