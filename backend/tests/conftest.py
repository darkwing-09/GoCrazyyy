import os, pytest

os.environ.update({
    "APP_ENV": "development",
    "DATABASE_URL": os.getenv("TEST_DATABASE_URL", "sqlite:///./test_gocrazy.db"),
    "RAZORPAY_KEY_ID": "", "RAZORPAY_KEY_SECRET": "", "RAZORPAY_WEBHOOK_SECRET": "whsec_test",
    "DATAFAST_API_KEY": "",
})
os.environ.pop("VERCEL", None)
os.environ.pop("VERCEL_ENV", None)

from fastapi.testclient import TestClient  # noqa: E402
from app.main import app  # noqa: E402
from app.db import Base, engine, SessionLocal  # noqa: E402
from app.seed import seed_categories  # noqa: E402
from app import metadata  # noqa: E402


async def _fake_resolve(raw: str) -> dict:
    """Offline stand-in for the page fetcher; keeps the real normalisation and SSRF rules."""
    url, handle = metadata.normalise(raw)
    if "localhost" in url or "127.0.0.1" in url or "169.254." in url:
        raise metadata.BlockedURL("That URL is not publicly reachable.")
    dom = metadata.domain_of(url)
    return {"url": url, "handle": handle, "domain": dom, "title": dom.split(".")[0].title(),
            "description": f"{dom} description", "favicon": None}


@pytest.fixture(scope="session")
def client():
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    with SessionLocal() as db:
        seed_categories(db)
    metadata.resolve = _fake_resolve
    with TestClient(app) as c:
        yield c
    Base.metadata.drop_all(engine)
    for f in ("test_gocrazy.db", "test_gocrazy.db-wal", "test_gocrazy.db-shm"):
        try:
            os.remove(f)
        except OSError:
            pass


def claim_and_pay(client, url: str, amount_paise: int, category: str = "developer-tools", **extra) -> dict:
    r = client.post("/api/claims", json={"url": url, "category": category, "amount_paise": amount_paise,
                                         "accept_terms": True, **extra})
    assert r.status_code == 200, r.text
    paid = client.post(f"/api/payments/mock/{r.json()['order_id']}")
    assert paid.status_code == 200, paid.text
    return paid.json()
