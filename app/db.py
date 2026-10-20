"""SQLite store shared by the webhook app (writer) and the dashboard API (reader)."""

from __future__ import annotations

import os
import sqlite3
from contextlib import contextmanager
from pathlib import Path
from typing import Iterator

DB_FILE = Path(os.environ.get("RELEASEMANAGER_DB", "")) if os.environ.get("RELEASEMANAGER_DB") else (
    Path(__file__).resolve().parent.parent / "data" / "releasemanager.db"
)

_SCHEMA = """
CREATE TABLE IF NOT EXISTS packages (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    received_at  TEXT NOT NULL,
    package_name TEXT NOT NULL,
    source       TEXT NOT NULL,
    version      TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_packages_received_at ON packages (received_at);
"""


@contextmanager
def connect() -> Iterator[sqlite3.Connection]:
    DB_FILE.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_FILE, timeout=10)
    conn.row_factory = sqlite3.Row
    try:
        conn.execute("PRAGMA journal_mode=WAL")  # lets the API read while the webhook writes
        conn.executescript(_SCHEMA)
        yield conn
        conn.commit()
    finally:
        conn.close()


def insert_package(received_at: str, package_name: str, source: str, version: str) -> None:
    with connect() as conn:
        conn.execute(
            "INSERT INTO packages (received_at, package_name, source, version) VALUES (?, ?, ?, ?)",
            (received_at, package_name, source, version),
        )


def list_packages() -> list[dict]:
    """All received packages, newest first, in the shape the frontend expects."""
    with connect() as conn:
        rows = conn.execute(
            "SELECT received_at, package_name, source, version FROM packages ORDER BY id DESC"
        ).fetchall()
    return [
        {
            "receivedAt": r["received_at"],
            "packageName": r["package_name"],
            "source": r["source"],
            "version": r["version"],
        }
        for r in rows
    ]


def count_packages() -> int:
    with connect() as conn:
        return conn.execute("SELECT COUNT(*) FROM packages").fetchone()[0]
