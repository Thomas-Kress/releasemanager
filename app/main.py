"""FastAPI backend for the dashboard: b4A login status and received packages.

The webhook receiver is a separate app (``app/webhook_app.py``, WEBHOOK_PORT)
that writes into SQLite; this API only reads from that database. The React
frontend (``frontend/``, port 5173) proxies ``/api/*`` calls to this backend
(see ``frontend/vite.config.ts``).
"""

from __future__ import annotations

import os
from contextlib import asynccontextmanager
from datetime import date
from typing import Literal

from fastapi import FastAPI, HTTPException, Request

from pydantic import BaseModel, Field, model_validator

from .b4a_auth import auth_manager
from .b4a_client import B4AError, run_module
from .config import get_settings
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


def _require_b4a() -> None:
    if not get_settings().configured:
        raise HTTPException(status_code=404, detail="The b4A ReST API is not configured.")


@app.get("/api/status")
async def api_status() -> dict:
    return await auth_manager.get_state()


@app.post("/api/refresh")
async def api_refresh() -> dict:
    """Wakes the background login loop so it retries immediately."""
    _require_b4a()
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
    _require_b4a()
    _require_local(request)
    return await auth_manager.login(req.username, req.password)


@app.get("/api/token")
async def api_token(request: Request) -> dict:
    """Returns the current b4A bearer token for use by the dashboard."""
    _require_b4a()
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
    _require_b4a()
    _require_local(request)
    try:
        return await run_module(req.name, req.options)
    except B4AError as exc:
        raise HTTPException(status_code=exc.status_code, detail=str(exc)) from exc



class ReleaseCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    description: str = Field(default="", max_length=2000)
    start_date: date | None = Field(default=None, alias="startDate")
    end_date: date | None = Field(default=None, alias="endDate")

    @model_validator(mode="after")
    def _check_dates(self) -> "ReleaseCreate":
        if self.start_date and self.end_date and self.end_date < self.start_date:
            raise ValueError("endDate must not be before startDate")
        return self


class ReleaseDatesUpdate(BaseModel):
    """Replaces both dates; null clears one."""

    start_date: date | None = Field(default=None, alias="startDate")
    end_date: date | None = Field(default=None, alias="endDate")

    @model_validator(mode="after")
    def _check_dates(self) -> "ReleaseDatesUpdate":
        if self.start_date and self.end_date and self.end_date < self.start_date:
            raise ValueError("endDate must not be before startDate")
        return self


class ReleaseStatusUpdate(BaseModel):
    status: int = Field(description="1 = planned, 2 = active, 3 = closed")


class PackageRelease(BaseModel):
    release_id: int | None = Field(alias="releaseId")


@app.patch("/api/packages/{package_id}/release")
def api_set_package_release(package_id: int, req: PackageRelease, request: Request) -> dict:
    """Moves a package into a release (null = back to unassigned). Closed releases are locked."""
    _require_local(request)
    try:
        return db.set_package_release(package_id, req.release_id)
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc


@app.get("/api/releases")
def api_releases() -> list[dict]:
    return db.list_releases()


@app.post("/api/releases", status_code=201)
def api_create_release(req: ReleaseCreate, request: Request) -> dict:
    _require_local(request)
    return db.create_release(
        req.name.strip(),
        req.description.strip(),
        req.start_date.isoformat() if req.start_date else None,
        req.end_date.isoformat() if req.end_date else None,
    )


@app.patch("/api/releases/{release_id}/status")
def api_set_release_status(release_id: int, req: ReleaseStatusUpdate, request: Request) -> dict:
    _require_local(request)
    if req.status not in db.RELEASE_STATUSES:
        raise HTTPException(status_code=422, detail="status must be 1 (planned), 2 (active) or 3 (closed)")
    release = db.set_release_status(release_id, req.status)
    if release is None:
        raise HTTPException(status_code=404, detail="Release not found")
    return release


@app.patch("/api/releases/{release_id}/dates")
def api_set_release_dates(release_id: int, req: ReleaseDatesUpdate, request: Request) -> dict:
    _require_local(request)
    release = db.set_release_dates(
        release_id,
        req.start_date.isoformat() if req.start_date else None,
        req.end_date.isoformat() if req.end_date else None,
    )
    if release is None:
        raise HTTPException(status_code=404, detail="Release not found")
    return release


class ConnectionCreate(BaseModel):
    environment: Literal["development", "test", "production"]
    name: str = Field(min_length=1, max_length=200)
    description: str = Field(default="", max_length=2000)


@app.get("/api/connections")
def api_connections() -> list[dict]:
    return db.list_connections()


@app.post("/api/connections", status_code=201)
def api_create_connection(req: ConnectionCreate, request: Request) -> dict:
    _require_local(request)
    return db.create_connection(req.environment, req.name.strip(), req.description.strip())


class ReleaseDescriptionUpdate(BaseModel):
    description: str = Field(max_length=2000)


@app.get("/api/releases/{release_id}/log")
def api_release_log(release_id: int) -> list[dict]:
    log = db.list_release_log(release_id)
    if log is None:
        raise HTTPException(status_code=404, detail="Release not found")
    return log


@app.patch("/api/releases/{release_id}/description")
def api_set_release_description(release_id: int, req: ReleaseDescriptionUpdate, request: Request) -> dict:
    """The description stays editable in every status, including closed."""
    _require_local(request)
    release = db.set_release_description(release_id, req.description.strip())
    if release is None:
        raise HTTPException(status_code=404, detail="Release not found")
    return release
