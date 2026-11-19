import hashlib
import hmac
import json
import time
from sqlalchemy import select
from app.db import SessionLocal
from app.models import Listing, Order
from app.upi_client import verify_webhook_signature


def test_upi_webhook_signature_verification():
    secret = "whsec_test_secret_12345"
    body = b'{"event":"order.paid","data":{"order_id":"ORD123"}}'
    now = int(time.time())

    signed_payload = f"{now}.".encode("utf-8") + body
    sig = hmac.new(secret.encode("utf-8"), signed_payload, hashlib.sha256).hexdigest()
    header = f"t={now},v1={sig}"

    # Valid
    assert verify_webhook_signature(body, header, secret=secret) is True
    # Tampered body
    assert verify_webhook_signature(b'{"tampered":true}', header, secret=secret) is False
    # Expired timestamp (older than 300s)
    old_signed = f"{now - 350}.".encode("utf-8") + body
    old_sig = hmac.new(secret.encode("utf-8"), old_signed, hashlib.sha256).hexdigest()
    assert verify_webhook_signature(body, f"t={now - 350},v1={old_sig}", secret=secret) is False
    # Malformed header
    assert verify_webhook_signature(body, "invalid_header", secret=secret) is False


def test_upi_webhook_endpoint_records_capture(client, monkeypatch):
    from app.main import settings

    secret = "test_webhook_sec"
    monkeypatch.setattr(settings, "upi_gateway_webhook_secret", secret)
    monkeypatch.setattr(settings, "upi_gateway_url", "https://upi.example.com")
    monkeypatch.setattr(settings, "upi_gateway_key", "test_key")
    monkeypatch.setattr(settings, "upi_gateway_secret", "test_sec")
    monkeypatch.setattr(settings, "payment_provider", "upi")

    def mock_create_order(amount_paise, client_order_id, email="", mobile="", note=""):
        return {
            "id": f"ORD_{client_order_id}",
            "client_order_id": client_order_id,
            "amount_paise": amount_paise,
            "payment_url": f"https://upi.example.com/pay/ORD_{client_order_id}",
            "upi_intent": f"upi://pay?pa=test@upi&am={amount_paise/100:.2f}&tr=ORD_{client_order_id}",
            "status": "pending",
            "expires_at": None,
        }

    monkeypatch.setattr("app.upi_client.create_order", mock_create_order)

    # Create a claim first
    res = client.post(
        "/api/claims",
        json={
            "url": "https://upitest.in",
            "category": "analytics",
            "amount_paise": 1900,
            "accept_terms": True,
            "email": "upi@test.in",
        },
    ).json()

    order_id = res["order_id"]

    # Send webhook
    now = int(time.time())
    payload = {
        "event_id": f"evt_upi_{order_id}",
        "event": "order.paid",
        "data": {
            "order_id": order_id,
            "client_order_id": f"gc_{order_id}",
            "amount": "19.00",
            "status": "paid",
            "utr": "UTR123456789012",
        },
    }
    raw = json.dumps(payload).encode("utf-8")
    signed_payload = f"{now}.".encode("utf-8") + raw
    sig = hmac.new(secret.encode("utf-8"), signed_payload, hashlib.sha256).hexdigest()
    headers = {
        "X-Signature": f"t={now},v1={sig}",
        "X-Event-Id": f"evt_upi_{order_id}",
        "Content-Type": "application/json",
    }

    # First delivery
    wh_res = client.post("/webhooks/upi", content=raw, headers=headers)
    assert wh_res.status_code == 200
    assert wh_res.json() == {"ok": True}

    # Duplicate delivery
    wh_dup = client.post("/webhooks/upi", content=raw, headers=headers)
    assert wh_dup.json()["duplicate"] is True

    # Check status endpoint
    status_res = client.get(f"/api/payments/status/{order_id}").json()
    assert status_res["paid"] is True
    assert status_res["total_paise"] == 1900

    # Verify listing is published in DB
    with SessionLocal() as db:
        order = db.execute(select(Order).where(Order.provider_order_id == order_id)).scalar_one()
        listing = db.get(Listing, order.listing_id)
        assert listing.published is True
