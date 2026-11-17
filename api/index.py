"""Vercel Python entrypoint. Vercel serves the ASGI `app` for every route rewritten to /api/index."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))

from app.main import app  # noqa: E402,F401
