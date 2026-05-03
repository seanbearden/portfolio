FROM python:3.12-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code and content
COPY main.py .
COPY content/ /app/content/

# Set environment variables
ENV CONTENT_DIR=/app/content
ENV PORT=8081

# Expose the port
EXPOSE 8081

# Run the server
CMD ["python", "main.py"]
