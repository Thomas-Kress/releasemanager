"""Webhook endpoint that external systems call to announce package versions."""

from __future__ import annotations

import hmac
import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel, ConfigDict, Field

from . import db
from .config import get_webhook_token

logger = logging.getLogger("releasemanager.webhook")

router = APIRouter()


class PackageEvent(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    package_name: str = Field(alias="packageName", min_length=1)
    source: str = Field(min_length=1, description="Source system-client, e.g. 'PROD-100'")
    version: str = Field(min_length=1)


def _check_token(authorization: str | None, x_webhook_token: str | None) -> None:
    expected = get_webhook_token()
    if not expected:
        return  # authentication not configured
    provided = x_webhook_token or ""
    if authorization and authorization.lower().startswith("bearer "):
        provided = authorization[7:]
    if not hmac.compare_digest(provided, expected):
        raise HTTPException(status_code=401, detail="Invalid or missing webhook token")


@router.post("/webhook/packages", status_code=202)
def receive_package(
    event: PackageEvent,
    authorization: str | None = Header(default=None),
    x_webhook_token: str | None = Header(default=None),
) -> dict:
    _check_token(authorization, x_webhook_token)
    received_at = datetime.now(timezone.utc).isoformat()
    db.insert_package(received_at, event.package_name, event.source, event.version)
    logger.info("Package received: %s %s from %s", event.package_name, event.version, event.source)
    return {
        "accepted": True,
        "receivedAt": received_at,
        "packageName": event.package_name,
        "source": event.source,
        "version": event.version,
    }
