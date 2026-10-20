"""Client for running b4A modules (POST /module -> poll -> report) with the
token kept fresh by ``auth_manager``. Used by the backend to send actions to
the b4A ReST API."""

from __future__ import annotations

import asyncio
import os
from typing import Any

import httpx

from .b4a_auth import auth_manager
from .config import get_settings

POLL_INTERVAL_SECONDS = 1.0
REQUEST_TIMEOUT_SECONDS = 30.0


class B4AError(Exception):
    def __init__(self, message: str, status_code: int = 502) -> None:
        super().__init__(message)
        self.status_code = status_code


async def run_module(
    name: str,
    options: dict[str, Any] | None = None,
    *,
    timeout: float = 120.0,
) -> dict:
    """Starts a b4A module, waits for it to finish and returns its result
    (``module`` job info plus the ``report`` text)."""
    token = await auth_manager.get_token()
    if not token:
        raise B4AError("Not logged in to the b4A ReST API (see /api/status).", 503)

    settings = get_settings()
    base_url = (settings.base_url or "").rstrip("/")
    opts = dict(options or {})
    if "connection" not in opts:
        connection = os.environ.get("B4A_REST_DEFAULT_CONNECTION") or os.environ.get(
            "B4A_DEFAULT_CONNECTION"
        )
        if not connection:
            raise B4AError("No connection given and B4A_REST_DEFAULT_CONNECTION is not set.", 400)
        opts["connection"] = connection

    headers = {"Authorization": token}
    try:
        async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT_SECONDS, headers=headers) as client:
            resp = await client.post(f"{base_url}/module", json={"name": name, "options": opts})
            if resp.status_code not in (200, 201, 202):
                raise B4AError(f"Start of module {name} failed: HTTP {resp.status_code} {resp.text[:300]}")
            job = resp.json()
            module_url = f"{base_url}/module/{job['id']}"

            loop = asyncio.get_running_loop()
            deadline = loop.time() + timeout
            while job.get("status") == "INITIATED":
                if loop.time() > deadline:
                    raise B4AError(f"Module {name} (id {job['id']}) did not finish in {timeout:.0f}s", 504)
                await asyncio.sleep(POLL_INTERVAL_SECONDS)
                poll = await client.get(module_url)
                if poll.status_code != 200:
                    raise B4AError(f"Polling module {job['id']} failed: HTTP {poll.status_code}")
                job = poll.json()

            report = ""
            for _ in range(3):  # report can be empty right after COMPLETED
                rep = await client.get(f"{module_url}/report")
                report = rep.text if rep.status_code == 200 else ""
                if report:
                    break
                await asyncio.sleep(POLL_INTERVAL_SECONDS)
    except httpx.RequestError as exc:
        raise B4AError(f"Could not reach the b4A ReST API: {exc}") from exc

    return {"module": job, "report": report}
