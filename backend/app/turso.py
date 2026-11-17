"""SQLAlchemy dialect for Turso / libSQL over the HTTP (Hrana) protocol.

Turso is SQLite-compatible, so the models never change. This wraps the pure-Python
`turso_serverless` DB-API driver in a SQLite dialect. Every statement is a synchronous
HTTP round-trip committed on the Turso primary before the call returns, which suits a
serverless function on Vercel (no local file, no background sync, durable writes for the
payment ledger). Modelled on tursodatabase/pyturso's SQLAlchemy dialect.

The engine is built with a `creator`, so the SQLAlchemy URL is just the bare
`sqlite+tursohttp://` selector and the real URL + auth token come from settings.
"""
from __future__ import annotations

import sqlite3
from types import SimpleNamespace

from sqlalchemy.dialects import registry
from sqlalchemy.dialects.sqlite.pysqlite import SQLiteDialect_pysqlite

import turso_serverless

# turso_serverless is DB-API 2.0 (paramstyle "qmark") but omits a few names the SQLite
# dialect pokes at. Shim them from the stdlib sqlite3 module; the real server version is
# read live via `SELECT sqlite_version()`.
_dbapi = SimpleNamespace(
    **{n: getattr(turso_serverless, n) for n in turso_serverless.__all__},
    sqlite_version=sqlite3.sqlite_version,
    sqlite_version_info=sqlite3.sqlite_version_info,
    version=getattr(turso_serverless, "__version__", "0"),
    PARSE_DECLTYPES=sqlite3.PARSE_DECLTYPES,
    PARSE_COLNAMES=sqlite3.PARSE_COLNAMES,
    Binary=sqlite3.Binary,
)


class TursoHTTPDialect(SQLiteDialect_pysqlite):
    name = "sqlite"
    driver = "tursohttp"
    supports_statement_cache = True
    supports_native_datetime = False

    @classmethod
    def import_dbapi(cls):
        return _dbapi

    # turso does not expose sqlite_temp_master, create_function (pysqlite's REGEXP setup),
    # or PRAGMA read_uncommitted. Isolation is fixed at connect time.
    def on_connect(self):
        return None

    def get_temp_table_names(self, connection, **kw):
        return []

    def get_temp_view_names(self, connection, **kw):
        return []

    def get_isolation_level(self, dbapi_connection):
        return "SERIALIZABLE"

    def set_isolation_level(self, dbapi_connection, level):
        return None


registry.register("sqlite.tursohttp", "app.turso", "TursoHTTPDialect")


def connect(url: str, auth_token: str | None):
    return turso_serverless.connect(url, auth_token=auth_token or None)
