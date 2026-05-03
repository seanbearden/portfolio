FROM python:3.12-slim

WORKDIR /app

# Build context: repo root (NOT backend/), so this Dockerfile can reach
# `content/` at the repo root for the agent's RAG corpus. Build with:
#   docker build -f backend/Dockerfile -t agent .

# Create unprivileged user up-front so we can chown after install + switch.
RUN adduser --system --no-create-home --group --disabled-password appuser

# Install dependencies first to cache the layer.
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Source code + content (content lives at repo root, shared with frontend).
COPY backend/ backend/
COPY content/ content/
RUN chown -R appuser:appuser /app

USER appuser

ENV PYTHONPATH=/app
EXPOSE 8080

# Cloud Run injects $PORT (defaults to 8080) — honor it.
CMD ["sh", "-c", "uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8080}"]
