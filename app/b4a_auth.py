"""Keeps a b4A / Automic ReST API bearer token valid in the background.

On startup (and whenever the current token is missing/invalid) this module
logs in via ``POST {B4A_REST_API_URL}/login``, verifies the resulting token
with a smoke check against ``GET /version`` (as recommended by the b4a-login
skill), and schedules the next refresh shortly before the token expires.

The current state can be read at any time via ``auth_manager.get_state()``
and is exposed to the dashboard through the ``/api/status`` endpoint.
"""

from __future__ import annotations

import asyncio
import logging
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Optional

import httpx

from .config import get_settings

logger = logging.getLogger("b4a_auth")

# How long before the token's actual expiry we proactively log in again.
REFRESH_BUFFER = timedelta(minutes=5)
# How long to wait between retries after a failed login attempt.
RETRY_INTERVAL = timedelta(seconds=30)
# Safety bounds for the computed "sleep until next refresh" delay.
MIN_REFRESH_INTERVAL = timedelta(seconds=30)
MAX_REFRESH_INTERVAL = timedelta(hours=1)

REQUEST_TIMEOUT_SECONDS = 30.0


@dataclass
class AuthState:
    status: str = "pending"  # "ok" | "error" | "pending"
    message: str = "Waiting for first login attempt..."
    token: Optional[str] = None
    expires_at: Optional[datetime] = None  # timezone-aware, UTC
    last_checked: Optional[datetime] = None
    username: Optional[str] = None

    def to_public_dict(self) -> dict:
        now = datetime.now(timezone.utc)
        seconds_remaining = None
        if self.expires_at is not None:
            seconds_remaining = max(0, int((self.expires_at - now).total_seconds()))
        return {
            "status": self.status,
            "message": self.message,
            "expires_at": self.expires_at.isoformat() if self.expires_at else None,
            "seconds_remaining": seconds_remaining,
            "last_checked": self.last_checked.isoformat() if self.last_checked else None,
            "username": self.username,
        }


class AuthManager:
    """Background task that keeps logging in and tracks the token state."""

    def __init__(self) -> None:
        self._state = AuthState()
        self._lock = asyncio.Lock()
        self._task: Optional[asyncio.Task] = None
        self._wake_event = asyncio.Event()

    async def start(self) -> None:
        if self._task is None:
            self._task = asyncio.create_task(self._run_forever())

    async def stop(self) -> None:
        if self._task is not None:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
            self._task = None

    async def get_state(self) -> dict:
        async with self._lock:
            return self._state.to_public_dict()

    async def force_refresh(self) -> None:
        """Wake the background loop so it retries immediately."""
        self._wake_event.set()

    async def _set_state(self, **kwargs) -> None:
        async with self._lock:
            for key, value in kwargs.items():
                setattr(self._state, key, value)
            self._state.last_checked = datetime.now(timezone.utc)

    async def _run_forever(self) -> None:
        while True:
            sleep_for = await self._attempt_login()
            self._wake_event.clear()
            try:
                await asyncio.wait_for(self._wake_event.wait(), timeout=sleep_for)
            except asyncio.TimeoutError:
                pass

    async def _attempt_login(self) -> float:
        settings = get_settings()

        if settings.missing:
            message = f"Missing configuration: {', '.join(settings.missing)}"
            logger.error(message)
            await self._set_state(status="error", message=message, token=None, expires_at=None)
            return RETRY_INTERVAL.total_seconds()

        base_url = settings.base_url.rstrip("/")
        login_url = f"{base_url}/login"
        payload = {
            "username": settings.username,
            "password": settings.password,
            "language": "en",
        }

        try:
            async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT_SECONDS) as client:
                response = await client.post(login_url, json=payload)
        except httpx.RequestError as exc:
            message = f"Could not reach {login_url}: {exc}"
            logger.warning(message)
            await self._set_state(status="error", message=message, token=None, expires_at=None)
            return RETRY_INTERVAL.total_seconds()

        if response.status_code != 200:
            message = f"Login failed with HTTP {response.status_code}: {response.text[:300]}"
            logger.warning(message)
            await self._set_state(status="error", message=message, token=None, expires_at=None)
            return RETRY_INTERVAL.total_seconds()

        token = response.headers.get("Authorization")
        if not token:
            message = "Login succeeded but no Authorization header was returned."
            logger.warning(message)
            await self._set_state(status="error", message=message, token=None, expires_at=None)
            return RETRY_INTERVAL.total_seconds()

        if not token.lower().startswith("bearer "):
            token = f"Bearer {token}"

        try:
            body = response.json()
        except ValueError:
            body = {}

        expires_at = self._parse_expires(body.get("expires"))
        username = (body.get("user") or {}).get("username")

        verified, verify_message = await self._verify_token(base_url, token)
        if not verified:
            await self._set_state(status="error", message=verify_message, token=None, expires_at=None)
            return RETRY_INTERVAL.total_seconds()

        await self._set_state(
            status="ok",
            message="Logged in successfully.",
            token=token,
            expires_at=expires_at,
            username=username,
        )

        return self._seconds_until_refresh(expires_at)

    @staticmethod
    async def _verify_token(base_url: str, token: str) -> tuple[bool, str]:
        """Smoke check recommended by the b4a-login skill: confirm the token
        against GET /version before relying on it elsewhere."""
        version_url = f"{base_url}/version"
        try:
            async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT_SECONDS) as client:
                response = await client.get(version_url, headers={"Authorization": token})
        except httpx.RequestError as exc:
            return False, f"Token verification against {version_url} failed: {exc}"

        if response.status_code != 200:
            return False, (
                f"Token verification against {version_url} failed with "
                f"HTTP {response.status_code}."
            )

        return True, "ok"

    @staticmethod
    def _parse_expires(expires_raw: Optional[str]) -> Optional[datetime]:
        if not expires_raw:
            return None
        try:
            normalized = expires_raw.replace("Z", "+00:00")
            parsed = datetime.fromisoformat(normalized)
            if parsed.tzinfo is None:
                parsed = parsed.replace(tzinfo=timezone.utc)
            return parsed.astimezone(timezone.utc)
        except ValueError:
            logger.warning("Could not parse expiration timestamp: %s", expires_raw)
            return None

    @staticmethod
    def _seconds_until_refresh(expires_at: Optional[datetime]) -> float:
        if expires_at is None:
            return RETRY_INTERVAL.total_seconds()

        now = datetime.now(timezone.utc)
        refresh_at = expires_at - REFRESH_BUFFER
        delay = (refresh_at - now).total_seconds()
        delay = max(delay, MIN_REFRESH_INTERVAL.total_seconds())
        delay = min(delay, MAX_REFRESH_INTERVAL.total_seconds())
        return delay


auth_manager = AuthManager()
