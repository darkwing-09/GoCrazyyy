from sqlalchemy import create_engine, event
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from sqlalchemy.pool import NullPool
from .config import get_settings

settings = get_settings()
url = settings.sqlalchemy_url
is_turso = settings.is_turso or "libsql" in url or "turso.io" in url
is_sqlite = url.startswith("sqlite") and not is_turso

if is_sqlite and settings.is_serverless:
    raise RuntimeError("Local SQLite cannot be used on Vercel; filesystem is ephemeral. Configure Turso (TURSO_DATABASE_URL + TURSO_AUTH_TOKEN) or Postgres.")

engine_kwargs: dict = {"pool_pre_ping": True}
if is_turso:
    connect_args: dict = {}
    token = settings.turso_auth_token.strip()
    if token:
        connect_args["auth_token"] = token
    if connect_args:
        engine_kwargs["connect_args"] = connect_args
    if settings.is_serverless:
        engine_kwargs["poolclass"] = NullPool
elif is_sqlite:
    engine_kwargs["connect_args"] = {"check_same_thread": False}
elif settings.is_serverless:
    # Each serverless instance is short-lived; let the Neon pooler hold connections.
    engine_kwargs["poolclass"] = NullPool

engine = create_engine(url, **engine_kwargs)

if is_sqlite:
    @event.listens_for(engine, "connect")
    def _sqlite_pragmas(dbapi_conn, _):
        cur = dbapi_conn.cursor()
        cur.execute("PRAGMA journal_mode=WAL")
        cur.execute("PRAGMA foreign_keys=ON")
        cur.close()

SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
