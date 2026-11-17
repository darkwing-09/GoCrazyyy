import hmac, hashlib, json
from sqlalchemy import select
from app.db import SessionLocal
from app.models import Order, Listing
from app import seed
from tests.conftest import claim_and_pay


def test_starts_empty_with_categories_only(client):
    d = client.get("/api/home").json()
    assert d["alltime"]["items"] == [] and d["alltime"]["take_top_paise"] == 9900
    cats = client.get("/api/categories").json()["categories"]
    assert len(cats) == len(seed.CATEGORIES)


def test_claim_requires_terms_and_minimum(client):
    r = client.post("/api/claims", json={"url": "example.com", "category": "developer-tools", "amount_paise": 9900, "accept_terms": False})
    assert r.status_code == 400
    r = client.post("/api/claims", json={"url": "example.com", "category": "developer-tools", "amount_paise": 500, "accept_terms": True})
    assert r.status_code == 400 and "Minimum" in r.json()["detail"]


def test_private_urls_are_refused(client):
    r = client.post("/api/claims", json={"url": "http://169.254.169.254/latest", "category": "developer-tools", "amount_paise": 9900, "accept_terms": True})
    assert r.status_code == 400 and "publicly" in r.json()["detail"]


def test_claim_capture_is_idempotent_and_cumulative(client):
    r = client.post("/api/claims", json={"url": "https://example.com/?ref=abc", "category": "developer-tools", "amount_paise": 9900, "accept_terms": True,
                                         "email": "founder@example.com", "contact_phone": "+91 98765 43210", "location": "Pune", "stage": "Seed"})
    c = r.json()
    assert c["mode"] == "mock" and c["listing"]["domain"] == "example.com" and c["listing"]["is_new"]
    p1 = client.post(f"/api/payments/mock/{c['order_id']}").json()
    p2 = client.post(f"/api/payments/mock/{c['order_id']}").json()
    assert p1["total_paise"] == 9900 and p2["total_paise"] == 9900  # second capture is a no-op
    q = client.get("/api/quote?amount_paise=1000&url=example.com").json()
    assert q["existing"]["slug"] == p1["slug"] and q["min_paise"] == 1000
    p3 = claim_and_pay(client, "example.com", 2000)
    assert p3["total_paise"] == 11900
    prod = client.get(f"/api/listing/{p1['slug']}").json()
    assert prod["raise_count"] == 2 and prod["total_paise"] == 11900
    assert prod["contact_email"] == "founder@example.com" and prod["location"] == "Pune"


def test_board_ranks_sorted_and_contacts_not_exposed_in_lists(client):
    claim_and_pay(client, "bigspender.in", 50_000, "marketing")
    claim_and_pay(client, "midspender.in", 20_000, "marketing")
    d = client.get("/api/home").json()
    items = d["alltime"]["items"]
    totals = [i["total_paise"] for i in items]
    assert totals == sorted(totals, reverse=True) and items[0]["rank"] == 1
    assert d["alltime"]["take_top_paise"] == totals[0] + 100_00
    assert all(i["contact_email"] is None and i["contact_phone"] is None for i in items)
    cat = client.get("/api/board?board=alltime&category=marketing").json()
    assert [i["category"]["slug"] for i in cat["items"]] == ["marketing", "marketing"]


def test_today_and_daily_boards_see_new_payments(client):
    assert client.get("/api/board?board=today").json()["total"] >= 3
    days = client.get("/api/daily").json()["days"]
    assert days[0]["live"] is True and days[0]["count"] >= 3


def test_webhook_rejects_bad_signature_and_accepts_good_once(client):
    assert client.post("/webhooks/razorpay", content=b"{}", headers={"X-Razorpay-Signature": "nope"}).status_code == 400
    r = client.post("/api/claims", json={"url": "webhooked.in", "category": "analytics", "amount_paise": 9900, "accept_terms": True}).json()
    with SessionLocal() as db:
        order = db.execute(select(Order).where(Order.provider_order_id == r["order_id"])).scalar_one()
        lid = order.listing_id
    body = json.dumps({"event": "payment.captured", "created_at": 1, "payload": {"payment": {"entity": {
        "id": "pay_webhook_1", "order_id": r["order_id"], "amount": 9900, "currency": "INR", "method": "upi", "status": "captured"}}}}).encode()
    sig = hmac.new(b"whsec_test", body, hashlib.sha256).hexdigest()
    h = {"X-Razorpay-Signature": sig, "X-Razorpay-Event-Id": "evt_1", "Content-Type": "application/json"}
    assert client.post("/webhooks/razorpay", content=body, headers=h).json() == {"ok": True}
    assert client.post("/webhooks/razorpay", content=body, headers=h).json()["duplicate"] is True
    with SessionLocal() as db:
        assert db.get(Listing, lid).published is True


def test_click_redirect_adds_utm(client):
    slug = client.get("/api/home").json()["alltime"]["items"][0]["slug"]
    r = client.get(f"/out/{slug}", follow_redirects=False)
    assert r.status_code == 302 and "utm_source=gocrazy" in r.headers["location"]


def test_stats_and_meta(client):
    s = client.get("/api/stats").json()
    assert s["source"] == "unconfigured" and s["revenue_source"] == "ledger" and s["products"] >= 4
    m = client.get("/api/meta").json()
    assert m["payments_available"] is True and m["business"]["name"]
    assert client.get("/api/health").json()["database"] is True


def test_production_refuses_mock_payments(client, monkeypatch):
    from app.main import settings
    monkeypatch.setenv("VERCEL_ENV", "production")
    assert settings.is_production and not settings.mock_payments_allowed
    r = client.post("/api/claims", json={"url": "prod.in", "category": "analytics", "amount_paise": 9900, "accept_terms": True})
    assert r.status_code == 503
    assert client.post("/api/payments/mock/order_mock_x").status_code == 404
    assert client.get("/api/meta").json()["payments_available"] is False
