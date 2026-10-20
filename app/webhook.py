"""Webhook endpoint that external systems call to announce package versions."""

from __future__ import annotations

import hmac
import json
import logging
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel, ConfigDict, Field

from .config import get_webhook_token

logger = logging.getLogger("releasemanager.webhook")

DATA_FILE = Path(__file__).resolve().parent.parent / "data" / "packages.jsonl"

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
async def receive_package(
    event: PackageEvent,
    authorization: str | None = Header(default=None),
    x_webhook_token: str | None = Header(default=None),
) -> dict:
    _check_token(authorization, x_webhook_token)
    record = {
        "receivedAt": datetime.now(timezone.utc).isoformat(),
        "packageName": event.package_name,
        "source": event.source,
        "version": event.version,
    }
    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    with DATA_FILE.open("a", encoding="utf-8") as fh:
        fh.write(json.dumps(record) + "\n")
    logger.info("Package received: %s", record)
    return {"accepted": True, **record}


@router.get("/api/packages")
async def list_packages() -> list[dict]:
    """Returns all received package records, newest first."""
    if not DATA_FILE.is_file():
        return []
    records: list[dict] = []
    with DATA_FILE.open(encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if line:
                try:
                    records.append(json.loads(line))
                except json.JSONDecodeError:
                    logger.warning("Skipping corrupt line in %s", DATA_FILE)
    records.reverse()
    return records
