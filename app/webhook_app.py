"""Standalone webhook receiver (port 8080). Stores events in SQLite only."""

import time
from datetime import datetime, timezone

from fastapi import FastAPI
from fastapi.responses import JSONResponse

from . import db
from .webhook import router

app = FastAPI(title="Release Manager Webhook")
app.include_router(router)

_STARTED = time.monotonic()


@app.get("/webhook/health")
@app.get("/health")
def health() -> JSONResponse:
    """Health check: 200 if the webhook is up and its SQLite DB is usable, else 503."""
    try:
        packages = db.count_packages()
        db_status = "ok"
    except Exception as exc:  # any DB failure means we cannot store events
        packages = None
        db_status = f"error: {exc}"
    ok = db_status == "ok"
    return JSONResponse(
        status_code=200 if ok else 503,
        content={
            "status": "ok" if ok else "degraded",
            "database": db_status,
            "packages": packages,
            "uptimeSeconds": round(time.monotonic() - _STARTED),
            "time": datetime.now(timezone.utc).isoformat(),
        },
    )
