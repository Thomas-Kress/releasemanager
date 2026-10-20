"""FastAPI backend exposing a login-status API for the b4A ReST API.

The dashboard UI itself is a separate React + Material UI app (see
``frontend/``). In development, run it with ``npm run dev`` in that folder;
its Vite dev server proxies ``/api/*`` calls to this backend (see
``frontend/vite.config.ts``). In production, run ``npm run build`` in
``frontend/`` and this app will serve the built ``frontend/dist`` folder
directly, so a single ``uvicorn app.main:app`` process serves both the API
and the UI.
"""

from __future__ import annotations

from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from .b4a_auth import auth_manager
from .webhook import router as webhook_router

PROJECT_ROOT = Path(__file__).resolve().parent.parent
FRONTEND_DIST = PROJECT_ROOT / "frontend" / "dist"


@asynccontextmanager
async def lifespan(app: FastAPI):
    await auth_manager.start()
    yield
    await auth_manager.stop()


app = FastAPI(title="Automic Release Manager", lifespan=lifespan)
app.include_router(webhook_router)


@app.get("/api/status")
async def api_status() -> dict:
    return await auth_manager.get_state()


@app.post("/api/refresh")
async def api_refresh() -> dict:
    """Wakes the background login loop so it retries immediately."""
    await auth_manager.force_refresh()
    return {"triggered": True}


# Serve the built React app (if present) for every other path. This must be
# mounted last so the /api routes above take precedence.
if FRONTEND_DIST.is_dir():
    app.mount("/", StaticFiles(directory=str(FRONTEND_DIST), html=True), name="frontend")
