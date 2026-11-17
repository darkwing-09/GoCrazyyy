from sqlalchemy import create_engine, event
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from sqlalchemy.pool import NullPool
from .config import get_settings

settings = get_settings()
url = settings.sqlalchemy_url
is_sqlite = url.startswith("sqlite")

if is_sqlite and settings.is_serverless:
    raise RuntimeError("DATABASE_URL must point to Postgres on Vercel; the filesystem is not persistent.")

engine_kwargs: dict = {"pool_pre_ping": True}
if is_sqlite:
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
