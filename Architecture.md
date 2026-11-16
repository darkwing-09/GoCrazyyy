# Architecture

```
browser ──► Vite/React SPA ──► /api/*  ──► FastAPI ──► SQLite | Postgres
   │              │                          │
   │              └─ /out/{slug} (302 + utm) ─┤  clicks table
   │                                         ├─► Razorpay Orders API (create order)
   │  Razorpay Checkout.js (modal) ──────────┤
   │        handler → POST /api/payments/verify (signature) ──► ledger
   │  Razorpay → POST /webhooks/razorpay (HMAC raw body, event-id dedupe) ──► ledger
   │                                         └─► DataFast /payments (per capture)
   └─ datafa.st/js/script.js (visitor cookie)      DataFast /analytics/{realtime,overview} ← /api/stats (60 s cache)
```

## Backend (`backend/app`)
| Module | Responsibility |
| --- | --- |
| `config.py` | Settings from env; `payments_mode` is `razorpay` when keys exist, else `mock`. |
| `db.py` | Engine, session, SQLite pragmas (WAL, foreign keys). |
| `models.py` | `Category`, `Listing`, `Order`, `Payment` (append-only ledger), `WebhookEvent`, `Click`. |
| `pricing.py` | Paise constants and the two pure functions `price_for_rank`, `rank_for_amount`. |
| `boards.py` | `ranked(db, board, category, day)` → rows with totals, rank, clicks. Windows: all-time, today (IST), daily (IST day), deals. |
| `ledger.py` | `record_capture` — the only writer of payments; idempotent; publishes the listing on first capture. |
| `razorpay_client.py` | Order creation, checkout signature verify, webhook HMAC verify, payment fetch. Mock implementations when unconfigured. |
| `datafast.py` | Cached GET for realtime/overview; POST payment with `transaction_id` = Razorpay payment id. |
| `metadata.py` | URL/@handle normalisation, query stripping, redirect resolution, OG title/description/favicon. |
| `seed.py` | 30 categories and ~48 synthetic listings for an empty DB. |
| `main.py` | All routes (see API.md). |

Rank is never stored. Every board is `SELECT listing_id, SUM(amount_paise) FROM payments WHERE board=? AND captured_at IN window GROUP BY listing_id`, sorted by total desc then `published_at` asc (older wins ties). At a few thousand listings this is milliseconds; add a materialised view only if it stops being.

## Payment flow
1. `POST /api/claims` resolves the URL, finds or creates the listing (unpublished), validates the amount against the floor for that listing, creates a Razorpay order with `notes={listing_id, slug, board, df_vid}` and stores an `Order` row.
2. The browser opens Checkout.js with `order_id`. On success the handler posts the three Razorpay fields to `/api/payments/verify`, which verifies the signature against the **stored** order id, fetches the payment to confirm status and amount, then calls `record_capture`.
3. Razorpay also sends `payment.captured` to `/webhooks/razorpay`. The raw body is HMAC-verified, the event id is deduped in `webhook_events`, then `record_capture` runs. Whichever path arrives first wins; the second is a no-op.
4. After any new capture the server posts the payment to DataFast with the visitor id from the order. `datafast_sent` is set on success; failures are logged and retried on the next capture path.

## Frontend (`frontend/src`)
- `App.tsx` mounts `ThemeProvider` (accent + reduced motion), `AppDataProvider` (meta, categories, stats polled every 60 s, DataFast script injection), the canvas `Background`, `Header`, routed `Pages` inside `AnimatePresence`, and `Footer`.
- The board family (`/`, `/today`, `/deals`, `/category/:slug[/today|/deals]`) renders one `Home` page keyed as a single route so tab and category switches animate content, not the whole shell.
- `ClaimHero` owns the stepper, live quote (debounced `/api/quote`), claim submission, Razorpay checkout and the mock dialog. Rows call `prefill()` on it via a ref for "claim this rank for ₹X".
- Styling is Tailwind v4 with tokens declared once in `index.css`; the accent is three OKLCH channels on `:root`, so switching it is three CSS variable writes.

## Time
Boards reset at midnight IST. The DB stores UTC; SQLite drops tzinfo, so `boards._db_time` and `boards.as_utc` normalise both directions.
