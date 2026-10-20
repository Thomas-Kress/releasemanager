"""SQLite store shared by the webhook app (writer) and the dashboard API (reader)."""

from __future__ import annotations

import os
import sqlite3
from contextlib import contextmanager
from datetime import date, datetime, timezone
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


def _ensure_package_release_column(conn: sqlite3.Connection) -> None:
    """Packages can be assigned to a release (NULL = unassigned)."""
    cols = {r["name"] for r in conn.execute("PRAGMA table_info(packages)")}
    if "release_id" not in cols:
        try:
            conn.execute("ALTER TABLE packages ADD COLUMN release_id INTEGER REFERENCES releases(id)")
        except sqlite3.OperationalError:  # the other process added it first
            pass


@contextmanager
def connect() -> Iterator[sqlite3.Connection]:
    DB_FILE.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_FILE, timeout=10)
    conn.row_factory = sqlite3.Row
    try:
        conn.execute("PRAGMA journal_mode=WAL")  # lets the API read while the webhook writes
        conn.executescript(_SCHEMA)
        _ensure_package_release_column(conn)
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
            "SELECT id, received_at, package_name, source, version, release_id FROM packages ORDER BY id DESC"
        ).fetchall()
    return [
        {
            "id": r["id"],
            "releaseId": r["release_id"],
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


STATUS_LABELS = {1: "Planned", 2: "Active", 3: "Closed"}


def _log(conn: sqlite3.Connection, release_id: int, event: str, message: str) -> None:
    """Appends to the persistent activity log of a release (same transaction as the change)."""
    conn.execute(
        "INSERT INTO release_log (release_id, logged_at, event, message) VALUES (?, ?, ?, ?)",
        (release_id, datetime.now(timezone.utc).isoformat(), event, message),
    )


def _shown(value: str | None) -> str:
    return value if value else "(none)"


def _ensure_releases(conn: sqlite3.Connection) -> None:
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS release_log (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            release_id INTEGER NOT NULL REFERENCES releases(id),
            logged_at  TEXT NOT NULL,
            event      TEXT NOT NULL,
            message    TEXT NOT NULL
        )
        """
    )
    conn.execute("CREATE INDEX IF NOT EXISTS idx_release_log_release ON release_log (release_id, id)")
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
        _log(conn, cur.lastrowid, "created", f"Release '{name}' created")
        row = conn.execute("SELECT * FROM releases WHERE id = ?", (cur.lastrowid,)).fetchone()
    return _release_row(row)


def set_release_status(release_id: int, status: int) -> dict | None:
    with connect() as conn:
        _ensure_releases(conn)
        old = conn.execute("SELECT status, start_date FROM releases WHERE id = ?", (release_id,)).fetchone()
        if old is None:
            return None
        conn.execute("UPDATE releases SET status = ? WHERE id = ?", (status, release_id))
        if old["status"] != status:
            _log(
                conn, release_id, "status",
                f"Status changed from {STATUS_LABELS[old['status']]} to {STATUS_LABELS[status]}",
            )
        if status == 2:
            # Going active stamps today as the start date, unless one is already set
            # or the end date is already past (that would make end < start).
            today = date.today().isoformat()
            conn.execute(
                "UPDATE releases SET start_date = ? WHERE id = ? AND start_date IS NULL"
                " AND (end_date IS NULL OR end_date >= ?)",
                (today, release_id, today),
            )
            if old["start_date"] is None and conn.execute(
                "SELECT start_date FROM releases WHERE id = ?", (release_id,)
            ).fetchone()["start_date"]:
                _log(conn, release_id, "dates", f"Start date set to {today} (release became active)")
        row = conn.execute("SELECT * FROM releases WHERE id = ?", (release_id,)).fetchone()
    return _release_row(row) if row else None


def set_release_dates(release_id: int, start_date: str | None, end_date: str | None) -> dict | None:
    with connect() as conn:
        _ensure_releases(conn)
        old = conn.execute("SELECT start_date, end_date FROM releases WHERE id = ?", (release_id,)).fetchone()
        if old is None:
            return None
        conn.execute(
            "UPDATE releases SET start_date = ?, end_date = ? WHERE id = ?",
            (start_date, end_date, release_id),
        )
        if old["start_date"] != start_date:
            _log(conn, release_id, "dates",
                 f"Start date changed from {_shown(old['start_date'])} to {_shown(start_date)}")
        if old["end_date"] != end_date:
            _log(conn, release_id, "dates",
                 f"End date changed from {_shown(old['end_date'])} to {_shown(end_date)}")
        row = conn.execute("SELECT * FROM releases WHERE id = ?", (release_id,)).fetchone()
    return _release_row(row) if row else None


def set_package_release(package_id: int, release_id: int | None) -> dict:
    """Moves a package into a release (or back to unassigned with None).

    Raises LookupError if the package/release does not exist and ValueError if
    the release the package is moving into or out of is closed (status 3).
    """
    with connect() as conn:
        _ensure_releases(conn)
        pkg = conn.execute(
            "SELECT release_id, package_name, version, source FROM packages WHERE id = ?", (package_id,)
        ).fetchone()
        if pkg is None:
            raise LookupError("Package not found")
        for rid in (pkg["release_id"], release_id):
            if rid is None:
                continue
            rel = conn.execute("SELECT name, status FROM releases WHERE id = ?", (rid,)).fetchone()
            if rel is None:
                raise LookupError("Release not found")
            if rel["status"] == 3:
                raise ValueError(f"Release '{rel['name']}' is closed")
        conn.execute("UPDATE packages SET release_id = ? WHERE id = ?", (release_id, package_id))
        if pkg["release_id"] != release_id:
            label = f"Package {pkg['package_name']} {pkg['version']} ({pkg['source']})"
            if pkg["release_id"] is not None:
                _log(conn, pkg["release_id"], "package", f"{label} removed")
            if release_id is not None:
                _log(conn, release_id, "package", f"{label} added")
    return {"id": package_id, "releaseId": release_id}


ENVIRONMENTS = ("development", "test", "production")


def _ensure_connections(conn: sqlite3.Connection) -> None:
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS connections (
            id            INTEGER PRIMARY KEY AUTOINCREMENT,
            environment   TEXT NOT NULL CHECK (environment IN ('development', 'test', 'production')),
            name          TEXT NOT NULL,
            description   TEXT NOT NULL DEFAULT ''
        )
        """
    )
    # An earlier version also stored a (required) system-client; connections now
    # consist of name and description only.
    if "system_client" in {r["name"] for r in conn.execute("PRAGMA table_info(connections)")}:
        conn.execute("ALTER TABLE connections DROP COLUMN system_client")


def _connection_row(r: sqlite3.Row) -> dict:
    return {
        "id": r["id"],
        "environment": r["environment"],
        "name": r["name"],
        "description": r["description"],
    }


def list_connections() -> list[dict]:
    with connect() as conn:
        _ensure_connections(conn)
        rows = conn.execute("SELECT * FROM connections ORDER BY id").fetchall()
    return [_connection_row(r) for r in rows]


def create_connection(environment: str, name: str, description: str) -> dict:
    with connect() as conn:
        _ensure_connections(conn)
        cur = conn.execute(
            "INSERT INTO connections (environment, name, description) VALUES (?, ?, ?)",
            (environment, name, description),
        )
        row = conn.execute("SELECT * FROM connections WHERE id = ?", (cur.lastrowid,)).fetchone()
    return _connection_row(row)


def set_release_description(release_id: int, description: str) -> dict | None:
    with connect() as conn:
        _ensure_releases(conn)
        old = conn.execute("SELECT description FROM releases WHERE id = ?", (release_id,)).fetchone()
        if old is None:
            return None
        conn.execute("UPDATE releases SET description = ? WHERE id = ?", (description, release_id))
        if old["description"] != description:
            _log(conn, release_id, "description", f"Description changed to: {description[:200] or '(empty)'}")
        row = conn.execute("SELECT * FROM releases WHERE id = ?", (release_id,)).fetchone()
    return _release_row(row) if row else None


def list_release_log(release_id: int) -> list[dict] | None:
    """Activity log of a release, newest first (None if the release does not exist)."""
    with connect() as conn:
        _ensure_releases(conn)
        if conn.execute("SELECT 1 FROM releases WHERE id = ?", (release_id,)).fetchone() is None:
            return None
        rows = conn.execute(
            "SELECT id, logged_at, event, message FROM release_log WHERE release_id = ? ORDER BY id DESC",
            (release_id,),
        ).fetchall()
    return [
        {"id": r["id"], "loggedAt": r["logged_at"], "event": r["event"], "message": r["message"]}
        for r in rows
    ]
