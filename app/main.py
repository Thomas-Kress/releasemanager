"""FastAPI backend for the dashboard: b4A login status and received packages.

The webhook receiver is a separate app (``app/webhook_app.py``, port 8080)
that writes into SQLite; this API only reads from that database. The React
frontend (``frontend/``, port 5173) proxies ``/api/*`` calls to this backend
(see ``frontend/vite.config.ts``).
"""

from __future__ import annotations

import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request

from pydantic import BaseModel, Field

from .b4a_auth import auth_manager
from .b4a_client import B4AError, run_module
from . import db


@asynccontextmanager
async def lifespan(app: FastAPI):
    await auth_manager.start()
    yield
    await auth_manager.stop()


app = FastAPI(title="Automic Release Manager", lifespan=lifespan)


@app.get("/api/packages")
def api_packages() -> list[dict]:
    """Returns all package records received by the webhook, newest first."""
    return db.list_packages()


@app.get("/api/status")
async def api_status() -> dict:
    return await auth_manager.get_state()


@app.post("/api/refresh")
async def api_refresh() -> dict:
    """Wakes the background login loop so it retries immediately."""
    await auth_manager.force_refresh()
    return {"triggered": True}


def _require_local(request: Request) -> None:
    """Token-bearing endpoints are only for the machine running the dashboard
    unless B4A_ALLOW_REMOTE_TOKEN=true; the webhook port may be internet-facing."""
    host = request.client.host if request.client else ""
    if host in ("127.0.0.1", "::1", "localhost"):
        return
    if os.environ.get("B4A_ALLOW_REMOTE_TOKEN", "").lower() in ("1", "true", "yes"):
        return
    raise HTTPException(status_code=403, detail="Token access is restricted to local clients.")


class LoginRequest(BaseModel):
    username: str = Field(min_length=1)
    password: str = Field(min_length=1)


@app.post("/api/login")
async def api_login(req: LoginRequest, request: Request) -> dict:
    """Logs in to Automic through b4A with the given credentials."""
    _require_local(request)
    return await auth_manager.login(req.username, req.password)


@app.get("/api/token")
async def api_token(request: Request) -> dict:
    """Returns the current b4A bearer token for use by the dashboard."""
    _require_local(request)
    token = await auth_manager.get_token()
    if not token:
        raise HTTPException(status_code=401, detail="Not logged in to the b4A ReST API.")
    state = await auth_manager.get_state()
    return {"token": token, "expires_at": state["expires_at"], "username": state["username"]}


class ModuleRequest(BaseModel):
    name: str = Field(min_length=1, description="b4A module name, e.g. 'info.Search'")
    options: dict = Field(default_factory=dict)


@app.post("/api/b4a/module")
async def api_b4a_module(req: ModuleRequest, request: Request) -> dict:
    """Runs a b4A module with the backend's login token and returns job + report."""
    _require_local(request)
    try:
        return await run_module(req.name, req.options)
    except B4AError as exc:
        raise HTTPException(status_code=exc.status_code, detail=str(exc)) from exc

