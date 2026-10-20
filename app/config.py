"""Configuration loaded from the .env file in the project root."""

from __future__ import annotations

import os
from dataclasses import dataclass, field

from dotenv import load_dotenv

load_dotenv()


@dataclass(frozen=True)
class Settings:
    base_url: str | None
    username: str | None
    password: str | None

    @property
    def configured(self) -> bool:
        """False when none of the b4A ReST API settings are present; login and
        token handling are then switched off entirely."""
        return bool(self.base_url or self.username or self.password)

    @property
    def missing(self) -> list[str]:
        missing: list[str] = []
        if not self.base_url:
            missing.append("B4A_REST_API_URL")
        if not self.username:
            missing.append("B4A_REST_API_USERNAME")
        if not self.password:
            missing.append("B4A_REST_API_PASSWORD")
        return missing


def get_webhook_token() -> str | None:
    """Optional shared secret; if set, webhook calls must present it."""
    return os.environ.get("WEBHOOK_TOKEN") or None


def get_settings() -> Settings:
    """Re-reads the environment on every call so an updated .env (after a
    reload) is picked up without restarting the process entirely."""
    return Settings(
        base_url=os.environ.get("B4A_REST_API_URL"),
        username=os.environ.get("B4A_REST_API_USERNAME"),
        password=os.environ.get("B4A_REST_API_PASSWORD"),
    )


def get_webhook_port() -> int:
    """Port the webhook receiver listens on (WEBHOOK_PORT, default 8080)."""
    raw = os.environ.get("WEBHOOK_PORT", "").strip()
    return int(raw) if raw else 8080
