from datetime import datetime, timezone
from sqlalchemy import String, Integer, Boolean, DateTime, ForeignKey, Text, Index, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .db import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Category(Base):
    __tablename__ = "categories"
    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(120))
    icon: Mapped[str] = mapped_column(String(40), default="sparkles")  # lucide icon name
    sort: Mapped[int] = mapped_column(Integer, default=0)
    listings: Mapped[list["Listing"]] = relationship(back_populates="category")


class Listing(Base):
    __tablename__ = "listings"
    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(160), unique=True, index=True)
    url: Mapped[str] = mapped_column(String(600))
    domain: Mapped[str] = mapped_column(String(200), index=True)
    handle: Mapped[str | None] = mapped_column(String(80), nullable=True)
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str] = mapped_column(Text, default="")
    favicon: Mapped[str | None] = mapped_column(String(600), nullable=True)
    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id"), index=True)
    contact_email: Mapped[str | None] = mapped_column(String(200), nullable=True)
    twitter: Mapped[str | None] = mapped_column(String(80), nullable=True)
    linkedin: Mapped[str | None] = mapped_column(String(250), nullable=True)
    location: Mapped[str | None] = mapped_column(String(120), nullable=True)
    stage: Mapped[str | None] = mapped_column(String(60), nullable=True)
    contact_phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    deal_text: Mapped[str | None] = mapped_column(String(100), nullable=True)
    coupon: Mapped[str | None] = mapped_column(String(60), nullable=True)
    published: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    is_demo: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    category: Mapped[Category] = relationship(back_populates="listings")
    payments: Mapped[list["Payment"]] = relationship(back_populates="listing")


class Order(Base):
    """A Razorpay order (or a mock one) waiting for capture."""
    __tablename__ = "orders"
    id: Mapped[int] = mapped_column(primary_key=True)
    provider_order_id: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    listing_id: Mapped[int] = mapped_column(ForeignKey("listings.id"), index=True)
    amount_paise: Mapped[int] = mapped_column(Integer)
    currency: Mapped[str] = mapped_column(String(3), default="INR")
    board: Mapped[str] = mapped_column(String(20), default="main")  # main | deals
    df_visitor_id: Mapped[str | None] = mapped_column(String(80), nullable=True)
    email: Mapped[str | None] = mapped_column(String(200), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="created", index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class Payment(Base):
    """Append-only ledger. Rank = SUM(amount_paise) of captured rows per listing."""
    __tablename__ = "payments"
    id: Mapped[int] = mapped_column(primary_key=True)
    provider_payment_id: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    provider_order_id: Mapped[str | None] = mapped_column(String(80), nullable=True, index=True)
    listing_id: Mapped[int] = mapped_column(ForeignKey("listings.id"), index=True)
    amount_paise: Mapped[int] = mapped_column(Integer)
    currency: Mapped[str] = mapped_column(String(3), default="INR")
    board: Mapped[str] = mapped_column(String(20), default="main", index=True)
    method: Mapped[str | None] = mapped_column(String(30), nullable=True)
    source: Mapped[str] = mapped_column(String(20), default="webhook")  # webhook | verify | mock | seed
    datafast_sent: Mapped[bool] = mapped_column(Boolean, default=False)
    captured_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, index=True)

    listing: Mapped[Listing] = relationship(back_populates="payments")


Index("ix_payments_listing_board_time", Payment.listing_id, Payment.board, Payment.captured_at)


class WebhookEvent(Base):
    __tablename__ = "webhook_events"
    id: Mapped[int] = mapped_column(primary_key=True)
    event_id: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    event: Mapped[str] = mapped_column(String(60))
    payload: Mapped[dict] = mapped_column(JSON)
    received_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class Click(Base):
    __tablename__ = "clicks"
    id: Mapped[int] = mapped_column(primary_key=True)
    listing_id: Mapped[int] = mapped_column(ForeignKey("listings.id"), index=True)
    referer: Mapped[str | None] = mapped_column(String(400), nullable=True)
    at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
