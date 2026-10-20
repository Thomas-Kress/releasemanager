"""Starts the webhook receiver (port from WEBHOOK_PORT in .env, default 8080)."""

import uvicorn

from app.config import get_webhook_port

if __name__ == "__main__":
    uvicorn.run("app.webhook_app:app", host="0.0.0.0", port=get_webhook_port())
