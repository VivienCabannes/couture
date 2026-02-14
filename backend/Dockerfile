# ---- builder ----
FROM python:3.11-slim-bookworm AS builder

WORKDIR /app

COPY pyproject.toml .
RUN pip install --no-cache-dir .

# Copy application code
COPY app/ app/

# ---- runtime ----
FROM python:3.11-slim-bookworm

# matplotlib Agg backend runtime deps
RUN apt-get update && \
    apt-get install -y --no-install-recommends libfreetype6 libfontconfig1 && \
    rm -rf /var/lib/apt/lists/*

RUN useradd --create-home appuser
WORKDIR /home/appuser

# Copy installed packages and app from builder
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin/uvicorn /usr/local/bin/uvicorn
COPY --from=builder /app /home/appuser

USER appuser

ENV PORT=8000

EXPOSE ${PORT}

CMD uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 2
