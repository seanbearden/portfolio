FROM python:3.12-slim

WORKDIR /app

# Build context: repository root (NOT portfolio-agent/), so this Dockerfile
# can reach `content/` at the repo root. Build with:
#   docker build -t agent -f portfolio-agent/Dockerfile .
# (The portfolio-agent/.dockerignore controls what enters the build context.)

# Install dependencies first to cache the layer.
COPY portfolio-agent/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Source code + content (content lives at repo root, shared with frontend).
COPY portfolio-agent/main.py .
COPY content/ /app/content/

ENV CONTENT_DIR=/app/content
ENV PORT=8081

EXPOSE 8081

CMD ["python", "main.py"]
