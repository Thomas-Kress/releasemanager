"""Starts the webhook receiver on port 8080."""

import uvicorn

if __name__ == "__main__":
    uvicorn.run("app.webhook_app:app", host="0.0.0.0", port=8080)
