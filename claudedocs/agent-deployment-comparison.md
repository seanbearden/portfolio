# Agent Deployment Comparison: Cloud Run vs. Vertex AI Agent Engine

This document compares the two deployment targets used for the portfolio's LangGraph resume chatbot.

## Overview

The resume chatbot is implemented using **LangGraph** and **Gemini 1.5 Flash**. It is deployed to two distinct GCP environments to demonstrate fluency with both self-hosted and managed agent runtime patterns.

1.  **Cloud Run**: A containerized FastAPI service hosting the LangGraph agent.
2.  **Vertex AI Agent Engine (Reasoning Engine)**: A managed runtime specifically designed for LangChain/LangGraph agents.

## Comparison Table

| Feature | Cloud Run (Self-Hosted) | Vertex AI Agent Engine (Managed) |
| :--- | :--- | :--- |
| **Abstraction Level** | Low (Container/Web Framework) | High (Managed Agent Runtime) |
| **Deployment Artifact** | Docker Image | Python Package / Class Instance |
| **Portability** | High (Any OCI runtime) | Moderate (Vertex AI specific wrapper) |
| **Cold Start** | Configurable (Min instances) | Managed by Vertex AI |
| **Cost Model** | Pay-per-request / CPU-seconds | Resource-based (Higher floor cost) |
| **Observability** | Standard Cloud Logging/Trace | Integrated with Vertex AI Evaluation |
| **Scaling** | Horizontal (Instance-based) | Managed (Agent-based) |

## Trade-offs

### Cloud Run
- **Pros**: Ultimate flexibility. Use any language, library, or system dependency. Lower cost for low-traffic personal projects. Standard MLOps/DevOps practices apply.
- **Cons**: Requires managing the web server (FastAPI), Dockerfile, and API contracts manually. No built-in agent-specific evaluation tools.

### Vertex AI Agent Engine
- **Pros**: F500-ready "Managed AI" pattern. Direct integration with Vertex AI's evaluation and reasoning tools. Simplifies the path from development to production for agentic workflows.
- **Cons**: Higher cost floor. Requires specific SDK versions and structure. Harder to move to other cloud providers without refactoring the deployment wrapper.

## When to Use Which?

- **Use Cloud Run** when you need a custom API, want to minimize costs for a hobby project, or require specific system-level dependencies not available in managed runtimes.
- **Use Agent Engine** for enterprise-scale agents where built-in evaluation, safety filters, and the "Managed AI" narrative are prioritized over infrastructure control and cost.
