"""Vercel Python entrypoint. Vercel serves the ASGI `app` for every route rewritten to /api/index."""
import sys
from pathlib import Path

# Robust path resolution for Vercel Serverless runtime
current = Path(__file__).resolve()
for p in [current.parent, current.parent.parent, Path.cwd(), Path("/var/task")]:
    backend_dir = p / "backend"
    if backend_dir.is_dir() and str(backend_dir) not in sys.path:
        sys.path.insert(0, str(backend_dir))
    if (p / "app").is_dir() and str(p) not in sys.path:
        sys.path.insert(0, str(p))

from app.main import app  # noqa: E402,F401
