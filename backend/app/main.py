import json, logging, secrets
from datetime import date, datetime, timedelta, timezone
from typing import Literal

from fastapi import FastAPI, Depends, HTTPException, Request, Header, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, Field
from sqlalchemy import select, func, text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session, selectinload

from .config import get_settings
from .db import Base, engine, get_db, SessionLocal
from .models import Category, Listing, Order, Payment, Click, WebhookEvent
from . import boards, pricing, metadata, razorpay_client as rzp, datafast
from .ledger import record_capture
from .seed import seed_categories

log = logging.getLogger("gocrazy")
settings = get_settings()
app = FastAPI(title="GoCrazy API", version="1.0.0",
              docs_url=None if settings.is_production else "/api/docs", redoc_url=None, openapi_url=None if settings.is_production else "/api/openapi.json")
app.add_middleware(CORSMiddleware, allow_origins=settings.origins, allow_methods=["*"], allow_headers=["*"])

PAGE_SIZE = 50


def init_db() -> None:
    """Runs once per cold start. Vercel's Python runtime does not reliably fire ASGI startup events."""
    Base.metadata.create_all(engine)
    with SessionLocal() as db:
        seed_categories(db)


init_db()


# ---------- serialisers ----------

def cat_out(c: Category) -> dict:
    return {"slug": c.slug, "name": c.name, "icon": c.icon}


def listing_out(r: boards.Row, board: str = "alltime", take_price: int | None = None, contacts: bool = False) -> dict:
    l = r.listing
    return {
        "rank": r.rank, "slug": l.slug, "title": l.title, "description": l.description, "url": l.url,
        "domain": l.domain, "favicon": l.favicon, "category": cat_out(l.category),
        "total_paise": r.total_paise, "clicks": r.clicks,
        "published_at": boards.as_utc(l.published_at or l.created_at).isoformat(),
        "last_paid_at": r.last_paid_at.isoformat() if r.last_paid_at else None,
        "deal_text": l.deal_text, "coupon": l.coupon if board == "deals" else None,
        "take_price_paise": take_price,
        "twitter": l.twitter, "linkedin": l.linkedin, "location": l.location, "stage": l.stage,
        # Direct contacts only on the listing's own page, never in bulk board responses.
        "contact_email": l.contact_email if contacts else None,
        "contact_phone": l.contact_phone if contacts else None,
    }


def with_prices(rows: list[boards.Row], board: str) -> list[dict]:
    pboard = "deals" if board == "deals" else "main"
    totals = boards.totals_desc(rows)
    return [listing_out(r, board, pricing.price_for_rank(totals, r.rank, pboard)) for r in rows]


def activity_out(p: Payment) -> dict:
    return {"slug": p.listing.slug, "title": p.listing.title, "favicon": p.listing.favicon,
            "amount_paise": p.amount_paise, "at": boards.as_utc(p.captured_at).isoformat(), "board": p.board,
            "category": cat_out(p.listing.category)}


# ---------- public reads ----------

@app.get("/api/meta")
def meta():
    return {"payments_mode": settings.payments_mode, "payments_available": settings.payments_mode == "razorpay" or settings.mock_payments_allowed,
            "razorpay_key_id": settings.razorpay_key_id or None,
            "datafast_website_id": settings.datafast_website_id or None,
            "datafast_domain": settings.datafast_domain or None,
            "public_stats_url": settings.datafast_public_stats_url or None,
            "pricing": {"min_new": pricing.MIN_NEW_LISTING, "take_top_bump": pricing.TAKE_TOP_BUMP,
                        "rank_bump": pricing.RANK_BUMP, "min_raise": pricing.MIN_RAISE, "step": pricing.STEP,
                        "max": pricing.MAX_AMOUNT, "min_new_deal": pricing.MIN_NEW_DEAL,
                        "take_top_bump_deal": pricing.TAKE_TOP_BUMP_DEAL},
            "business": {"name": settings.business_name, "email": settings.contact_email or None,
                         "address": settings.business_address or None, "jurisdiction": settings.jurisdiction or None},
            "launched_at": settings.launched_at or None, "deals_closes_at": settings.deals_closes_at or None}


@app.get("/api/categories")
def categories(db: Session = Depends(get_db)):
    cats = db.execute(select(Category).order_by(Category.sort)).scalars().all()
    out = []
    for c in cats:
        rows = boards.ranked(db, "alltime", c.slug)
        last = max((r.last_paid_at for r in rows if r.last_paid_at), default=None)
        out.append({**cat_out(c), "claims": sum(1 for _ in rows), "last_claim_at": last.isoformat() if last else None,
                    "top": with_prices(rows[:3], "alltime"), "take_top_paise": pricing.price_for_rank(boards.totals_desc(rows), 1)})
    hot = sorted([c for c in out if c["last_claim_at"]], key=lambda c: c["last_claim_at"], reverse=True)[:3]
    return {"categories": out, "hottest": [c["slug"] for c in hot]}


@app.get("/api/board")
def board(board: Literal["alltime", "today", "deals", "daily"] = "alltime", category: str | None = None,
          day: date | None = None, page: int = Query(1, ge=1), db: Session = Depends(get_db)):
    rows = boards.ranked(db, board, category, day)
    total = len(rows)
    start = (page - 1) * PAGE_SIZE
    items = with_prices(rows, board)[start:start + PAGE_SIZE]
    pboard = "deals" if board == "deals" else "main"
    return {"board": board, "category": category, "day": day.isoformat() if day else None,
            "total": total, "page": page, "pages": max(1, -(-total // PAGE_SIZE)), "items": items,
            "take_top_paise": pricing.price_for_rank(boards.totals_desc(rows), 1, pboard),
            "activity": [activity_out(p) for p in boards.latest_activity(db, 10, category, pboard)]}


@app.get("/api/home")
def home(category: str | None = None, db: Session = Depends(get_db)):
    """Everything the home / category page needs in one round-trip."""
    main = boards.ranked(db, "alltime", category)
    today = boards.ranked(db, "today", category)
    deals = boards.ranked(db, "deals", category)
    return {
        "alltime": {"items": with_prices(main, "alltime")[:PAGE_SIZE], "total": len(main),
                    "pages": max(1, -(-len(main) // PAGE_SIZE)),
                    "take_top_paise": pricing.price_for_rank(boards.totals_desc(main), 1)},
        "today": {"items": with_prices(today, "today")[:5], "total": len(today)},
        "deals": {"items": with_prices(deals, "deals")[:5], "total": len(deals),
                  "take_top_paise": pricing.price_for_rank(boards.totals_desc(deals), 1, "deals")},
        "activity": [activity_out(p) for p in boards.latest_activity(db, 10, category)],
    }


@app.get("/api/quote")
def quote(amount_paise: int = Query(..., ge=0), category: str | None = None,
          board: Literal["main", "deals"] = "main", url: str | None = None, db: Session = Depends(get_db)):
    """What rank would `amount` land, and what is the minimum for this URL."""
    rows = boards.ranked(db, "deals" if board == "deals" else "alltime", category)
    totals = boards.totals_desc(rows)
    floor = pricing.MIN_NEW_DEAL if board == "deals" else pricing.MIN_NEW_LISTING
    existing = None
    if url:
        clean, handle = metadata.normalise(url)
        dom = metadata.domain_of(clean)
        existing = db.execute(select(Listing).where(Listing.domain == dom, Listing.published.is_(True))
                              .order_by(Listing.id)).scalars().first()
        if existing and handle:
            existing = db.execute(select(Listing).where(Listing.handle == handle)).scalar_one_or_none()
    cur = boards.find_row(rows, existing.id) if existing else None
    if cur:
        floor = pricing.MIN_RAISE
        projected = cur.total_paise + amount_paise
        others = [t for i, t in enumerate(totals) if rows[i].listing.id != existing.id]
        rank = pricing.rank_for_amount(others, projected) if amount_paise >= floor else cur.rank
    else:
        projected = amount_paise
        rank = pricing.rank_for_amount(totals, amount_paise) if amount_paise >= floor else len(totals) + 1
    return {"rank": rank, "min_paise": floor, "projected_total_paise": projected,
            "take_top_paise": pricing.price_for_rank(totals, 1, board),
            "existing": {"slug": existing.slug, "title": existing.title, "current_rank": cur.rank if cur else None,
                         "total_paise": cur.total_paise if cur else 0} if existing else None}


@app.get("/api/listing/{slug}")
def listing(slug: str, db: Session = Depends(get_db)):
    l = db.execute(select(Listing).options(selectinload(Listing.category))
                   .where(Listing.slug == slug, Listing.published.is_(True))).scalar_one_or_none()
    if not l:
        raise HTTPException(404, "listing not found")
    overall = boards.ranked(db, "alltime")
    incat = boards.ranked(db, "alltime", l.category.slug)
    deals = boards.ranked(db, "deals")
    o, c, d = boards.find_row(overall, l.id), boards.find_row(incat, l.id), boards.find_row(deals, l.id)
    row = o or d
    totals = boards.totals_desc(overall)
    ledger = db.execute(select(Payment).where(Payment.listing_id == l.id).order_by(Payment.captured_at.desc())).scalars().all()
    also = [r for r in incat if r.listing.id != l.id][:5]
    return {
        **listing_out(row, "alltime", contacts=True),
        "overall": {"rank": o.rank if o else None, "of": len(overall),
                    "outrank_paise": (pricing.price_for_rank(totals, o.rank) if o else None)},
        "category_rank": {"rank": c.rank if c else None, "of": len(incat)},
        "deals_rank": {"rank": d.rank if d else None, "of": len(deals), "total_paise": d.total_paise if d else 0},
        "raise_count": len(ledger), "first_paid_at": boards.as_utc(ledger[-1].captured_at).isoformat() if ledger else None,
        "ledger": [{"amount_paise": p.amount_paise, "at": boards.as_utc(p.captured_at).isoformat(), "board": p.board} for p in ledger[:20]],
        "also": with_prices(also, "alltime") if also else [],
    }


@app.get("/api/daily")
def daily(db: Session = Depends(get_db)):
    first = db.execute(select(func.min(Payment.captured_at))).scalar()
    if not first:
        return {"days": []}
    first_day = boards.as_utc(first).astimezone(boards.IST).date()
    today = datetime.now(boards.IST).date()
    days = []
    d = today
    while d >= first_day and len(days) < 90:
        rows = boards.ranked(db, "daily", None, d)
        days.append({"day": d.isoformat(), "live": d == today, "count": len(rows),
                     "revenue_paise": sum(r.total_paise for r in rows), "top": with_prices(rows[:3], "daily")})
        d -= timedelta(days=1)
    next_midnight = boards.ist_day_start(today) + timedelta(days=1)
    return {"days": days, "resets_at": next_midnight.isoformat()}


@app.get("/api/stats")
async def stats(db: Session = Depends(get_db)):
    """Header strip + footer strip. Traffic/revenue from DataFast, product count from our DB."""
    today = datetime.now(boards.IST).date().isoformat()
    online = await datafast.realtime_visitors()
    today_ov = await datafast.overview(today, today)
    all_ov = await datafast.overview()
    products = db.execute(select(func.count(Listing.id)).where(Listing.published.is_(True))).scalar()
    ledger = db.execute(select(func.coalesce(func.sum(Payment.amount_paise), 0))).scalar()
    return {
        "source": "datafast" if all_ov is not None else "unconfigured",
        "online": online, "visitors_today": (today_ov or {}).get("visitors"),
        "visitors_total": (all_ov or {}).get("visitors"),
        "revenue_paise": int(round(float(all_ov["revenue"]) * 100)) if all_ov and all_ov.get("revenue") is not None else int(ledger),
        "revenue_source": "datafast" if all_ov and all_ov.get("revenue") is not None else "ledger",
        "products": int(products), "public_stats_url": settings.datafast_public_stats_url or None,
    }


@app.get("/api/resolve")
async def resolve(url: str):
    try:
        return await metadata.resolve(url)
    except metadata.BlockedURL as e:
        raise HTTPException(400, str(e))
    except Exception:
        raise HTTPException(400, "Could not read that URL.")


@app.get("/out/{slug}")
def out(slug: str, request: Request, db: Session = Depends(get_db)):
    l = db.execute(select(Listing).where(Listing.slug == slug)).scalar_one_or_none()
    if not l:
        raise HTTPException(404)
    db.add(Click(listing_id=l.id, referer=request.headers.get("referer")))
    db.commit()
    sep = "&" if "?" in l.url else "?"
    return RedirectResponse(f"{l.url}{sep}utm_source=gocrazy&utm_medium=leaderboard", status_code=302)


# ---------- claims and payments ----------

class ClaimIn(BaseModel):
    url: str = Field(min_length=2, max_length=600)
    category: str
    amount_paise: int = Field(ge=100)
    board: Literal["main", "deals"] = "main"
    deal_text: str | None = Field(default=None, max_length=100)
    coupon: str | None = Field(default=None, max_length=60)
    email: str | None = Field(default=None, max_length=200)
    df_visitor_id: str | None = Field(default=None, max_length=80)
    accept_terms: bool
    # Optional startup details & contacts
    twitter: str | None = Field(default=None, max_length=80)
    linkedin: str | None = Field(default=None, max_length=250)
    location: str | None = Field(default=None, max_length=120)
    stage: str | None = Field(default=None, max_length=60)
    contact_phone: str | None = Field(default=None, max_length=50)


@app.post("/api/claims")
async def create_claim(body: ClaimIn, db: Session = Depends(get_db)):
    if settings.payments_mode != "razorpay" and not settings.mock_payments_allowed:
        log.error("claim refused: Razorpay keys are not configured in production")
        raise HTTPException(503, "Payments are temporarily unavailable. Please try again shortly.")
    if not body.accept_terms:
        raise HTTPException(400, "You must accept the Terms to claim a rank.")
    if body.amount_paise % 100:
        raise HTTPException(400, "Amounts are whole rupees.")
    if body.amount_paise > pricing.MAX_AMOUNT:
        raise HTTPException(400, "That is above the per-payment ceiling.")
    if body.board == "deals" and not (body.deal_text or "").strip():
        raise HTTPException(400, "Deals must describe a discount.")
    cat = db.execute(select(Category).where(Category.slug == body.category)).scalar_one_or_none()
    if not cat:
        raise HTTPException(400, "Pick a category.")
    try:
        meta_ = await metadata.resolve(body.url)
    except metadata.BlockedURL as e:
        raise HTTPException(400, str(e))
    q = select(Listing).where(Listing.domain == meta_["domain"])
    if meta_["handle"]:
        q = q.where(Listing.handle == meta_["handle"])
    existing = db.execute(q.order_by(Listing.id)).scalars().first()
    rows = boards.ranked(db, "deals" if body.board == "deals" else "alltime")
    cur = boards.find_row(rows, existing.id) if existing else None
    floor = pricing.MIN_RAISE if cur else (pricing.MIN_NEW_DEAL if body.board == "deals" else pricing.MIN_NEW_LISTING)
    if body.amount_paise < floor:
        raise HTTPException(400, f"Minimum for this listing is ₹{floor // 100}.")
    if existing:
        listing_ = existing
        if body.board == "deals" and body.deal_text:
            listing_.deal_text, listing_.coupon = body.deal_text.strip(), (body.coupon or "").strip() or None
        if body.twitter is not None:
            listing_.twitter = body.twitter.strip() or None
        if body.linkedin is not None:
            listing_.linkedin = body.linkedin.strip() or None
        if body.location is not None:
            listing_.location = body.location.strip() or None
        if body.stage is not None:
            listing_.stage = body.stage.strip() or None
        if body.contact_phone is not None:
            listing_.contact_phone = body.contact_phone.strip() or None
        if body.email:
            listing_.contact_email = body.email.strip()
    else:
        base = meta_["handle"] or meta_["domain"].split(".")[0]
        slug = base.lower().replace(" ", "-")[:120]
        while db.execute(select(Listing).where(Listing.slug == slug)).scalar_one_or_none():
            slug = f"{base[:110]}-{secrets.token_hex(2)}"
        listing_ = Listing(
            slug=slug, url=meta_["url"], domain=meta_["domain"], handle=meta_["handle"],
            title=meta_["title"], description=meta_["description"], favicon=meta_["favicon"],
            category_id=cat.id, contact_email=body.email, published=False,
            deal_text=(body.deal_text or "").strip() or None, coupon=(body.coupon or "").strip() or None,
            twitter=(body.twitter or "").strip() or None,
            linkedin=(body.linkedin or "").strip() or None,
            location=(body.location or "").strip() or None,
            stage=(body.stage or "").strip() or None,
            contact_phone=(body.contact_phone or "").strip() or None,
        )
        db.add(listing_)
        db.flush()
    notes = {"listing_id": str(listing_.id), "slug": listing_.slug, "board": body.board,
             "df_vid": body.df_visitor_id or ""}
    order = rzp.create_order(body.amount_paise, f"gc_{listing_.id}_{secrets.token_hex(4)}", notes)
    db.add(Order(provider_order_id=order["id"], listing_id=listing_.id, amount_paise=body.amount_paise,
                 board=body.board, df_visitor_id=body.df_visitor_id, email=body.email))
    db.commit()
    projected = (cur.total_paise if cur else 0) + body.amount_paise
    others = [t for r, t in zip(rows, boards.totals_desc(rows)) if not existing or r.listing.id != existing.id]
    return {"order_id": order["id"], "amount_paise": body.amount_paise, "currency": "INR",
            "key_id": settings.razorpay_key_id or None, "mode": settings.payments_mode,
            "listing": {"slug": listing_.slug, "title": listing_.title, "favicon": listing_.favicon,
                        "domain": listing_.domain, "is_new": existing is None},
            "projected_rank": pricing.rank_for_amount(others, projected), "projected_total_paise": projected}


class VerifyIn(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


def _after_capture(db: Session, pay: Payment, order: Order | None):
    """Post to DataFast once per payment. Safe to call again; it skips when already sent."""
    if pay.datafast_sent:
        return
    renewal = db.execute(select(func.count(Payment.id)).where(Payment.listing_id == pay.listing_id)).scalar() > 1
    return {"amount_paise": pay.amount_paise, "transaction_id": pay.provider_payment_id,
            "visitor_id": order.df_visitor_id if order else None, "email": order.email if order else None,
            "renewal": bool(renewal)}


async def _send_datafast(db: Session, pay: Payment, order: Order | None):
    args = _after_capture(db, pay, order)
    if args and await datafast.post_payment(**args):
        pay.datafast_sent = True
        db.commit()


def _result(db: Session, pay: Payment) -> dict:
    l = db.get(Listing, pay.listing_id)
    rows = boards.ranked(db, "deals" if pay.board == "deals" else "alltime")
    r = boards.find_row(rows, l.id)
    return {"ok": True, "slug": l.slug, "title": l.title, "rank": r.rank if r else None,
            "total_paise": r.total_paise if r else pay.amount_paise, "board": pay.board, "of": len(rows)}


@app.post("/api/payments/verify")
async def verify_payment(body: VerifyIn, db: Session = Depends(get_db)):
    """Called from the Razorpay checkout handler. Uses the order we stored, never the one the browser claims."""
    order = db.execute(select(Order).where(Order.provider_order_id == body.razorpay_order_id)).scalar_one_or_none()
    if not order:
        raise HTTPException(404, "unknown order")
    if not rzp.verify_checkout_signature(order.provider_order_id, body.razorpay_payment_id, body.razorpay_signature):
        raise HTTPException(400, "payment signature did not verify")
    amount, method = order.amount_paise, None
    fetched = rzp.fetch_payment(body.razorpay_payment_id)
    if fetched:
        if fetched.get("status") not in ("captured", "authorized") or int(fetched.get("amount", 0)) != order.amount_paise:
            raise HTTPException(400, "payment is not captured for the order amount")
        amount, method = int(fetched["amount"]), fetched.get("method")
    pay, _ = record_capture(db, payment_id=body.razorpay_payment_id, order_id=order.provider_order_id,
                            amount_paise=amount, method=method, source="verify")
    await _send_datafast(db, pay, order)
    return _result(db, pay)


@app.post("/api/payments/mock/{order_id}")
async def mock_capture(order_id: str, db: Session = Depends(get_db)):
    """Local development only: simulates Razorpay capturing the order. Disabled in production."""
    if not settings.mock_payments_allowed:
        raise HTTPException(404)
    order = db.execute(select(Order).where(Order.provider_order_id == order_id)).scalar_one_or_none()
    if not order:
        raise HTTPException(404, "unknown order")
    pay, _ = record_capture(db, payment_id=f"pay_mock_{order_id[-12:]}", order_id=order_id,
                            amount_paise=order.amount_paise, method="mock", source="mock")
    await _send_datafast(db, pay, order)
    return _result(db, pay)


@app.post("/webhooks/razorpay")
async def razorpay_webhook(request: Request, db: Session = Depends(get_db),
                           x_razorpay_signature: str = Header(default=""),
                           x_razorpay_event_id: str = Header(default="")):
    raw = await request.body()
    if not rzp.verify_webhook_signature(raw, x_razorpay_signature):
        raise HTTPException(400, "bad signature")
    evt = json.loads(raw)
    event_id = x_razorpay_event_id or f"{evt.get('event')}:{evt.get('created_at')}"
    if db.execute(select(WebhookEvent).where(WebhookEvent.event_id == event_id)).scalar_one_or_none():
        return {"ok": True, "duplicate": True}
    db.add(WebhookEvent(event_id=event_id, event=evt.get("event", ""), payload=evt))
    db.commit()
    if evt.get("event") == "payment.captured":
        p = evt["payload"]["payment"]["entity"]
        try:
            pay, created = record_capture(db, payment_id=p["id"], order_id=p.get("order_id"),
                                          amount_paise=int(p["amount"]), method=p.get("method"), source="webhook")
        except ValueError as e:
            log.error("webhook: %s", e)
            return {"ok": False, "reason": str(e)}
        order = db.execute(select(Order).where(Order.provider_order_id == p.get("order_id"))).scalar_one_or_none()
        await _send_datafast(db, pay, order)
    return {"ok": True}


@app.get("/api/health")
def health(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        db_ok = True
    except SQLAlchemyError:
        db_ok = False
    return {"ok": db_ok, "database": db_ok, "payments": settings.payments_mode,
            "datafast": bool(settings.datafast_api_key), "env": "production" if settings.is_production else "development"}
