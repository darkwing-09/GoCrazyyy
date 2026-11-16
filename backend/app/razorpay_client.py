import hmac, hashlib, secrets
import razorpay
from .config import get_settings

settings = get_settings()
_client = razorpay.Client(auth=(settings.razorpay_key_id, settings.razorpay_key_secret)) if settings.payments_mode == "razorpay" else None


def create_order(amount_paise: int, receipt: str, notes: dict) -> dict:
    """Returns {id, amount, currency}. Mock mode returns a fake order id."""
    if _client is None:
        return {"id": f"order_mock_{secrets.token_hex(7)}", "amount": amount_paise, "currency": "INR"}
    return _client.order.create({"amount": amount_paise, "currency": "INR", "receipt": receipt[:40], "notes": notes})


def verify_checkout_signature(order_id: str, payment_id: str, signature: str) -> bool:
    """Checkout handler signature: HMAC_SHA256(order_id|payment_id, key_secret)."""
    if _client is None:
        return signature == "mock"
    try:
        _client.utility.verify_payment_signature({
            "razorpay_order_id": order_id, "razorpay_payment_id": payment_id, "razorpay_signature": signature})
        return True
    except razorpay.errors.SignatureVerificationError:
        return False


def verify_webhook_signature(raw_body: bytes, signature: str) -> bool:
    """Webhook signature: HMAC_SHA256(raw body, webhook_secret). Never parse the body first."""
    if not settings.razorpay_webhook_secret:
        return False
    expected = hmac.new(settings.razorpay_webhook_secret.encode(), raw_body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature or "")


def fetch_payment(payment_id: str) -> dict | None:
    if _client is None:
        return None
    return _client.payment.fetch(payment_id)
