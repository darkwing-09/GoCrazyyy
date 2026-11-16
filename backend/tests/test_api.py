import hmac, hashlib, json
from sqlalchemy import select
from app.db import SessionLocal
from app.models import Order, Listing


def test_home_ranks_are_sorted(client):
    d = client.get("/api/home").json()
    totals = [i["total_paise"] for i in d["alltime"]["items"]]
    assert totals == sorted(totals, reverse=True)
    assert d["alltime"]["items"][0]["rank"] == 1
    assert d["alltime"]["take_top_paise"] == totals[0] + 100_00


def test_board_pagination_and_category(client):
    d = client.get("/api/board?board=alltime&category=ai-agents").json()
    assert all(i["category"]["slug"] == "ai-agents" for i in d["items"])
    assert d["pages"] >= 1


def test_claim_requires_terms_and_minimum(client):
    r = client.post("/api/claims", json={"url": "example.com", "category": "developer-tools", "amount_paise": 9900, "accept_terms": False})
    assert r.status_code == 400
    r = client.post("/api/claims", json={"url": "example.com", "category": "developer-tools", "amount_paise": 500, "accept_terms": True})
    assert r.status_code == 400 and "Minimum" in r.json()["detail"]


def test_claim_mock_capture_is_idempotent_and_cumulative(client):
    r = client.post("/api/claims", json={"url": "https://example.com/?ref=abc", "category": "developer-tools", "amount_paise": 9900, "accept_terms": True})
    assert r.status_code == 200, r.text
    c = r.json()
    assert c["mode"] == "mock" and c["listing"]["domain"] == "example.com" and c["listing"]["is_new"]
    p1 = client.post(f"/api/payments/mock/{c['order_id']}").json()
    p2 = client.post(f"/api/payments/mock/{c['order_id']}").json()
    assert p1["total_paise"] == 9900 and p2["total_paise"] == 9900  # second capture is a no-op
    # Raise: only the difference, min ₹10, totals accumulate.
    q = client.get("/api/quote?amount_paise=1000&url=example.com").json()
    assert q["existing"]["slug"] == p1["slug"] and q["min_paise"] == 1000
    r2 = client.post("/api/claims", json={"url": "example.com", "category": "developer-tools", "amount_paise": 2000, "accept_terms": True}).json()
    assert r2["listing"]["is_new"] is False and r2["projected_total_paise"] == 9900 + 2000
    p3 = client.post(f"/api/payments/mock/{r2['order_id']}").json()
    assert p3["total_paise"] == 11900
    prod = client.get(f"/api/listing/{p1['slug']}").json()
    assert prod["raise_count"] == 2 and prod["total_paise"] == 11900


def test_webhook_rejects_bad_signature_and_accepts_good(client):
    r = client.post("/webhooks/razorpay", content=b"{}", headers={"X-Razorpay-Signature": "nope"})
    assert r.status_code == 400
    with SessionLocal() as db:
        order = db.execute(select(Order).where(Order.status == "created")).scalars().first()
        if order is None:
            lst = db.execute(select(Listing)).scalars().first()
            order = Order(provider_order_id="order_test_1", listing_id=lst.id, amount_paise=5000)
            db.add(order); db.commit(); db.refresh(order)
        oid, lid, amt = order.provider_order_id, order.listing_id, order.amount_paise
    body = json.dumps({"event": "payment.captured", "created_at": 1, "payload": {"payment": {"entity": {
        "id": "pay_webhook_1", "order_id": oid, "amount": amt, "currency": "INR", "method": "upi", "status": "captured"}}}}).encode()
    sig = hmac.new(b"whsec_test", body, hashlib.sha256).hexdigest()
    h = {"X-Razorpay-Signature": sig, "X-Razorpay-Event-Id": "evt_1", "Content-Type": "application/json"}
    assert client.post("/webhooks/razorpay", content=body, headers=h).json() == {"ok": True}
    assert client.post("/webhooks/razorpay", content=body, headers=h).json()["duplicate"] is True
    with SessionLocal() as db:
        l = db.get(Listing, lid)
        assert l.published is True


def test_click_redirect_adds_utm(client):
    slug = client.get("/api/home").json()["alltime"]["items"][0]["slug"]
    r = client.get(f"/out/{slug}", follow_redirects=False)
    assert r.status_code == 302 and "utm_source=gocrazy" in r.headers["location"]


def test_stats_without_datafast_falls_back_to_ledger(client):
    s = client.get("/api/stats").json()
    assert s["source"] == "unconfigured" and s["revenue_source"] == "ledger" and s["products"] > 0
