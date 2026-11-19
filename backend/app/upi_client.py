import hashlib
import hmac
import logging
import time
import httpx
from .config import get_settings

log = logging.getLogger("gocrazy.upi")
settings = get_settings()


def _client() -> httpx.Client | None:
    if not (settings.upi_gateway_url and settings.upi_gateway_key and settings.upi_gateway_secret):
        return None
    return httpx.Client(
        base_url=settings.upi_gateway_url.rstrip("/"),
        headers={
            "X-Api-Key": settings.upi_gateway_key,
            "X-Api-Secret": settings.upi_gateway_secret,
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        timeout=15.0,
    )


def create_order(
    amount_paise: int,
    client_order_id: str,
    email: str = "",
    mobile: str = "",
    note: str = "",
) -> dict:
    """Creates a UPI payment order in upi-gateway.

    Returns dict containing:
      - id: Gateway order ID (e.g. ORD...)
      - client_order_id: Passed merchant client_order_id
      - amount_paise: Amount in paise integers
      - payment_url: Web checkout page on the gateway
      - upi_intent: Direct UPI intent link (upi://pay?...)
      - status: 'pending'
      - expires_at: ISO timestamp
    """
    client = _client()
    if client is None:
        # Fallback for mock/test environments
        fake_id = f"ORD_MOCK_{client_order_id[-12:]}"
        amt_rupees = round(amount_paise / 100, 2)
        return {
            "id": fake_id,
            "client_order_id": client_order_id,
            "amount_paise": amount_paise,
            "payment_url": None,
            "upi_intent": f"upi://pay?pa=mock@upi&pn=GoCrazy&am={amt_rupees:.2f}&tr={fake_id}",
            "status": "pending",
            "expires_at": None,
        }

    amount_rupees = round(amount_paise / 100, 2)
    payload: dict = {
        "amount": amount_rupees,
        "client_order_id": client_order_id[:64],
        "note": (note or "GoCrazy rank claim")[:50],
    }
    if email and "@" in email:
        payload["customer_email"] = email[:255]
    if mobile:
        cleaned_mobile = "".join(c for c in mobile if c.isdigit() or c == "+")
        if cleaned_mobile:
            payload["customer_mobile"] = cleaned_mobile[:20]

    with client:
        res = client.post("/api/v1/orders", json=payload)
        res.raise_for_status()
        data = res.json()
        if not data.get("success"):
            raise ValueError(f"UPI Gateway error: {data}")
        order_data = data["data"]
        return {
            "id": order_data["order_id"],
            "client_order_id": order_data.get("client_order_id", client_order_id),
            "amount_paise": int(round(float(order_data["amount"]) * 100)),
            "payment_url": order_data.get("payment_url"),
            "upi_intent": order_data.get("upi_intent"),
            "status": order_data.get("status", "pending"),
            "expires_at": order_data.get("expires_at"),
        }


def fetch_order(order_id: str) -> dict | None:
    """Retrieves order status from upi-gateway by order_id or client_order_id."""
    client = _client()
    if client is None:
        return None
    try:
        with client:
            res = client.get(f"/api/v1/orders/{order_id}")
            if res.status_code == 404:
                return None
            res.raise_for_status()
            data = res.json()
            if data.get("success"):
                return data["data"]
            return None
    except Exception as e:
        log.error("Failed to fetch UPI order %s: %s", order_id, e)
        return None


def verify_webhook_signature(
    raw_body: bytes,
    signature_header: str,
    secret: str = "",
    tolerance: int = 300,
) -> bool:
    """Verifies timestamped HMAC-SHA256 signature from upi-gateway.

    Header scheme: X-Signature: t=1700000000,v1=abcdef...
    Signed payload: {timestamp}.{raw_body}
    """
    signing_secret = secret or settings.upi_gateway_webhook_secret
    if not signature_header or not signing_secret:
        return False

    parts: dict[str, str] = {}
    for item in signature_header.split(","):
        if "=" in item:
            k, v = item.strip().split("=", 1)
            parts[k.strip()] = v.strip()

    if "t" not in parts or "v1" not in parts:
        return False

    try:
        timestamp = int(parts["t"])
    except ValueError:
        return False

    if abs(int(time.time()) - timestamp) > tolerance:
        return False

    signed_payload = f"{timestamp}.".encode("utf-8") + raw_body
    expected = hmac.new(signing_secret.encode("utf-8"), signed_payload, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, parts["v1"])
