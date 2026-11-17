# API

Base: same origin as the site. On Vercel, `/api/*`, `/out/*` and `/webhooks/*` are rewritten to the Python function; locally the backend runs on `:8000` and Vite proxies those paths. Interactive docs are at `/api/docs` in development only. All responses are JSON; errors are `{ "detail": "message" }`. Amounts are paise.

## Public reads
| Method & path | Query | Returns |
| --- | --- | --- |
| `GET /api/meta` | | `payments_mode`, `payments_available`, `business{name,email,address,jurisdiction}`, `deals_closes_at`, `razorpay_key_id` (public), `datafast_website_id`, `datafast_domain`, `public_stats_url`, `pricing{min_new,take_top_bump,rank_bump,min_raise,step,max,min_new_deal,take_top_bump_deal}`, `launched_at` |
| `GET /api/categories` | | `categories[]` with `claims`, `last_claim_at`, `top[0..3]`, `take_top_paise`; `hottest[]` slugs |
| `GET /api/home` | `category?` | `alltime{items[≤50],total,pages,take_top_paise}`, `today{items[≤5],total}`, `deals{items[≤5],total,take_top_paise}`, `activity[≤10]` |
| `GET /api/board` | `board=alltime|today|deals|daily`, `category?`, `day?` (YYYY-MM-DD, daily only), `page?` | `items[≤50]`, `total`, `page`, `pages`, `take_top_paise`, `activity[]` |
| `GET /api/quote` | `amount_paise` (req), `category?`, `board=main|deals`, `url?` | `rank`, `min_paise`, `projected_total_paise`, `take_top_paise`, `existing{slug,title,current_rank,total_paise}?` |
| `GET /api/listing/{slug}` | | listing fields + `overall{rank,of,outrank_paise}`, `category_rank{rank,of}`, `deals_rank{rank,of,total_paise}`, `raise_count`, `first_paid_at`, `ledger[≤20]`, `also[≤5]` |
| `GET /api/daily` | | `days[]{day,live,count,revenue_paise,top[≤3]}` (newest first, ≤90), `resets_at` |
| `GET /api/stats` | | `online`, `visitors_today`, `visitors_total`, `revenue_paise`, `revenue_source` (`datafast`/`ledger`), `products`, `source`, `public_stats_url` |
| `GET /api/resolve` | `url` | `{url,handle,domain,title,description,favicon}` preview |
| `GET /out/{slug}` | | 302 to the listing URL with `utm_source=gocrazy&utm_medium=leaderboard`; logs a click |
| `GET /api/health` | | `{ok, database, payments: "razorpay"|"mock", datafast, env}`. `ok` is false when the database is unreachable. |

### Listing item shape
```json
{ "rank": 1, "slug": "kaagaz-ai", "title": "…", "description": "…", "url": "https://…", "domain": "kaagaz.ai",
  "favicon": "https://…", "category": {"slug":"ai-agents","name":"AI Agents & Infrastructure","icon":"bot"},
  "total_paise": 17116000, "clicks": 400, "published_at": "2026-10-03T16:03:05+00:00",
  "last_paid_at": "…", "deal_text": null, "coupon": null, "take_price_paise": 17126000,
  "twitter": "kaagaz_ai", "linkedin": "company/kaagaz", "location": "Bengaluru, IN", "stage": "Seed", "contact_phone": null, "contact_email": null }
```
`contact_email` and `contact_phone` are filled only by `GET /api/listing/{slug}` (the listing's own page). Every list endpoint returns them as `null`, so founder contacts cannot be scraped in bulk.

## Claims and payments
### `POST /api/claims`
```json
{ "url": "https://example.com", "category": "developer-tools", "amount_paise": 9900, "board": "main",
  "deal_text": null, "coupon": null, "email": null, "df_visitor_id": null, "accept_terms": true,
  "location": "Bengaluru, IN", "stage": "Seed", "twitter": "handle", "linkedin": "company/url", "contact_phone": "+919876543210" }
```
Returns 503 `Payments are temporarily unavailable` in production when Razorpay keys are missing. Rejects URLs that resolve to private, loopback or link-local addresses (400). Validates terms, whole rupees, ceiling, deal text (deals only), category, and the floor for that URL (₹99 new / ₹49 new deal / ₹10 raise). Resolves metadata, finds or creates the listing, creates the order.

Returns `{ order_id, amount_paise, currency, key_id, mode: "razorpay"|"mock", listing{slug,title,favicon,domain,is_new}, projected_rank, projected_total_paise }`.

### `POST /api/payments/verify`
Body: `{ razorpay_order_id, razorpay_payment_id, razorpay_signature }` from the Checkout.js handler. Verifies the signature against the stored order, fetches the payment (status captured/authorized and amount equal to the order), records the capture, posts to DataFast. Returns `{ ok, slug, title, rank, total_paise, board, of }`.

### `POST /api/payments/mock/{order_id}`
Development only: enabled when Razorpay keys are absent and the app is not in production; 404 otherwise. Simulates a capture.

### `POST /webhooks/razorpay`
Headers `X-Razorpay-Signature` (HMAC-SHA256 of the raw body with the webhook secret) and `X-Razorpay-Event-Id`. Handles `payment.captured`; other events are stored and acknowledged. Replays return `{ ok: true, duplicate: true }`.

## Pagination
50 per page. `pages = ceil(total / 50)`.
