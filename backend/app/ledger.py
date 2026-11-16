"""Recording a capture is the only way a listing gains rank. Idempotent on provider_payment_id."""
from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.orm import Session
from .models import Payment, Order, Listing


def record_capture(db: Session, *, payment_id: str, order_id: str | None, amount_paise: int,
                   method: str | None, source: str, listing_id: int | None = None,
                   board: str | None = None) -> tuple[Payment, bool]:
    """Returns (payment, created). A second call with the same payment_id is a no-op."""
    existing = db.execute(select(Payment).where(Payment.provider_payment_id == payment_id)).scalar_one_or_none()
    if existing:
        return existing, False
    order = None
    if order_id:
        order = db.execute(select(Order).where(Order.provider_order_id == order_id)).scalar_one_or_none()
    if order is None and listing_id is None:
        raise ValueError(f"no order {order_id} for payment {payment_id}")
    listing_id = listing_id or order.listing_id
    board = board or (order.board if order else "main")
    pay = Payment(provider_payment_id=payment_id, provider_order_id=order_id, listing_id=listing_id,
                  amount_paise=amount_paise, board=board, method=method, source=source,
                  captured_at=datetime.now(timezone.utc))
    db.add(pay)
    if order:
        order.status = "paid"
    listing = db.get(Listing, listing_id)
    if listing and not listing.published:
        listing.published = True
        listing.published_at = pay.captured_at
    db.commit()
    db.refresh(pay)
    return pay, True
