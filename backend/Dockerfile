FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt && \
    python -m spacy download en_core_web_lg && \
    python -c "from transformers import pipeline; pipeline('text-classification', model='ProtectAI/deberta-v3-base-prompt-injection-v2')"

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
