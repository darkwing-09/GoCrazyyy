"""Board queries. Every total is SUM(payments.amount_paise) over the board's window."""
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone, date
from sqlalchemy import select, func
from sqlalchemy.orm import Session, selectinload
from .models import Listing, Payment, Click, Category

IST = timezone(timedelta(hours=5, minutes=30))


def ist_day_start(d: date | None = None) -> datetime:
    d = d or datetime.now(IST).date()
    return datetime(d.year, d.month, d.day, tzinfo=IST)


def _db_time(dt: datetime | None) -> datetime | None:
    """SQLite stores naive UTC; Postgres keeps tz. Compare in naive UTC so both work."""
    if dt is None:
        return None
    return dt.astimezone(timezone.utc).replace(tzinfo=None)


def as_utc(dt: datetime | None) -> datetime | None:
    if dt is None:
        return None
    return dt.replace(tzinfo=timezone.utc) if dt.tzinfo is None else dt.astimezone(timezone.utc)


def board_window(board: str, day: date | None = None) -> tuple[datetime | None, datetime | None, str]:
    """Returns (start, end, payment_board) for a board name."""
    if board == "alltime":
        return None, None, "main"
    if board == "today":
        return ist_day_start(), None, "main"
    if board == "daily":
        s = ist_day_start(day)
        return s, s + timedelta(days=1), "main"
    if board == "deals":
        return None, None, "deals"
    raise ValueError(f"unknown board {board}")


@dataclass
class Row:
    listing: Listing
    total_paise: int
    rank: int
    clicks: int
    last_paid_at: datetime | None


def ranked(db: Session, board: str = "alltime", category_slug: str | None = None,
           day: date | None = None) -> list[Row]:
    start, end, pboard = board_window(board, day)
    q = (
        select(Payment.listing_id, func.sum(Payment.amount_paise), func.max(Payment.captured_at))
        .where(Payment.board == pboard)
    )
    if start is not None:
        q = q.where(Payment.captured_at >= _db_time(start))
    if end is not None:
        q = q.where(Payment.captured_at < _db_time(end))
    if category_slug:
        q = q.join(Listing, Listing.id == Payment.listing_id).join(Category).where(Category.slug == category_slug)
    q = q.group_by(Payment.listing_id)
    totals = {lid: (int(t or 0), last) for lid, t, last in db.execute(q).all()}
    if not totals:
        return []
    listings = db.execute(
        select(Listing).options(selectinload(Listing.category))
        .where(Listing.id.in_(totals.keys()), Listing.published.is_(True))
    ).scalars().all()
    clicks = dict(db.execute(
        select(Click.listing_id, func.count()).where(Click.listing_id.in_(totals.keys())).group_by(Click.listing_id)
    ).all())
    rows = [Row(l, totals[l.id][0], 0, int(clicks.get(l.id, 0)), as_utc(totals[l.id][1])) for l in listings]
    # Ties go to the older listing.
    rows.sort(key=lambda r: (-r.total_paise, as_utc(r.listing.published_at or r.listing.created_at)))
    for i, r in enumerate(rows, 1):
        r.rank = i
    return rows


def totals_desc(rows: list[Row]) -> list[int]:
    return [r.total_paise for r in rows]


def find_row(rows: list[Row], listing_id: int) -> Row | None:
    return next((r for r in rows if r.listing.id == listing_id), None)


def latest_activity(db: Session, limit: int = 12, category_slug: str | None = None, board: str = "main"):
    q = (
        select(Payment).options(selectinload(Payment.listing).selectinload(Listing.category))
        .where(Payment.board == board).order_by(Payment.captured_at.desc()).limit(limit)
    )
    if category_slug:
        q = q.join(Listing).join(Category).where(Category.slug == category_slug)
    return db.execute(q).scalars().all()
