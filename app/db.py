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


# Release status codes: 1 = planned, 2 = active, 3 = closed
RELEASE_STATUSES = (1, 2, 3)


def _ensure_releases(conn: sqlite3.Connection) -> None:
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS releases (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            name        TEXT NOT NULL,
            description TEXT NOT NULL DEFAULT '',
            start_date  TEXT,
            end_date    TEXT,
            status      INTEGER NOT NULL DEFAULT 1 CHECK (status IN (1, 2, 3))
        )
        """
    )
    # Earlier versions required both dates; rebuild the table so they are optional.
    cols = {r["name"]: r for r in conn.execute("PRAGMA table_info(releases)")}
    if cols["start_date"]["notnull"] or cols["end_date"]["notnull"]:
        conn.executescript(
            """
            ALTER TABLE releases RENAME TO releases_old;
            CREATE TABLE releases (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                name        TEXT NOT NULL,
                description TEXT NOT NULL DEFAULT '',
                start_date  TEXT,
                end_date    TEXT,
                status      INTEGER NOT NULL DEFAULT 1 CHECK (status IN (1, 2, 3))
            );
            INSERT INTO releases SELECT id, name, description, start_date, end_date, status FROM releases_old;
            DROP TABLE releases_old;
            """
        )


def _release_row(r: sqlite3.Row) -> dict:
    return {
        "id": r["id"],
        "name": r["name"],
        "description": r["description"],
        "startDate": r["start_date"],
        "endDate": r["end_date"],
        "status": r["status"],
    }


def list_releases() -> list[dict]:
    with connect() as conn:
        _ensure_releases(conn)
        rows = conn.execute("SELECT * FROM releases ORDER BY id DESC").fetchall()
    return [_release_row(r) for r in rows]


def create_release(name: str, description: str, start_date: str | None, end_date: str | None) -> dict:
    with connect() as conn:
        _ensure_releases(conn)
        cur = conn.execute(
            "INSERT INTO releases (name, description, start_date, end_date, status) VALUES (?, ?, ?, ?, 1)",
            (name, description, start_date, end_date),
        )
        row = conn.execute("SELECT * FROM releases WHERE id = ?", (cur.lastrowid,)).fetchone()
    return _release_row(row)


def set_release_status(release_id: int, status: int) -> dict | None:
    with connect() as conn:
        _ensure_releases(conn)
        conn.execute("UPDATE releases SET status = ? WHERE id = ?", (status, release_id))
        row = conn.execute("SELECT * FROM releases WHERE id = ?", (release_id,)).fetchone()
    return _release_row(row) if row else None


def set_release_dates(release_id: int, start_date: str | None, end_date: str | None) -> dict | None:
    with connect() as conn:
        _ensure_releases(conn)
        conn.execute(
            "UPDATE releases SET start_date = ?, end_date = ? WHERE id = ?",
            (start_date, end_date, release_id),
        )
        row = conn.execute("SELECT * FROM releases WHERE id = ?", (release_id,)).fetchone()
    return _release_row(row) if row else None
