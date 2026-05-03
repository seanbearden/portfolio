FROM python:3.12-slim

WORKDIR /app

# Create unprivileged user up-front so we can chown after install and switch.
RUN adduser --system --no-create-home --group --disabled-password appuser

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
RUN chown -R appuser:appuser /app

USER appuser

EXPOSE 8080

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
