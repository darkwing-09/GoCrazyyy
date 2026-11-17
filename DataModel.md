# Data model

All amounts are integer paise. All timestamps are UTC (`DateTime(timezone=True)`; SQLite stores them naive). Production runs on Postgres (Neon via Vercel); tables are created on the first request and only the categories are seeded.

## categories
| column | type | notes |
| --- | --- | --- |
| id | int pk | |
| slug | str unique | url key, e.g. `seo-ai-visibility` |
| name | str | display name |
| icon | str | lucide icon name (kebab-case) |
| sort | int | chip order |

## listings
| column | type | notes |
| --- | --- | --- |
| id | int pk | |
| slug | str unique | from domain or handle, de-duplicated with a hex suffix |
| url | str | final URL after redirects, query and fragment stripped |
| domain | str idx | `www.` removed; one listing per domain (per handle for x.com) |
| handle | str? | X handle when listed as `@handle` |
| title, description, favicon | | fetched from the page; favicon falls back to Google s2 |
| category_id | fk | |
| contact_email | str? | from the claim form; shown only on the listing's own page (DPDP: deletable on request) |
| contact_phone | str? | WhatsApp / inquiries number; shown only on the listing's own page |
| twitter, linkedin | str? | handle or URL, public |
| location, stage | str? | e.g. "Bengaluru", "Seed"; public |
| deal_text (≤100), coupon (≤60) | str? | Deals board only |
| published | bool idx | false until the first capture |
| created_at, published_at | datetime | `published_at` breaks ties (older wins) |

## orders
Razorpay orders (or mock ids) awaiting capture.
| column | notes |
| --- | --- |
| provider_order_id unique | `order_…` from Razorpay or `order_mock_…` |
| listing_id, amount_paise, currency, board (`main`/`deals`) | |
| df_visitor_id | DataFast cookie at claim time, for attribution |
| email | optional receipt email |
| status | `created` → `paid` |

## payments (append-only ledger)
| column | notes |
| --- | --- |
| provider_payment_id unique | `pay_…`; idempotency key |
| provider_order_id | the Razorpay order |
| listing_id, amount_paise, currency | |
| board idx | `main` counts for All-time/Today/Daily/Category; `deals` for the Deals board |
| method | upi/card/netbanking/… |
| source | `webhook` / `verify` / `mock` (development test checkout) |
| datafast_sent | true once DataFast accepted the payment |
| captured_at idx | drives all board windows |

Composite index `(listing_id, board, captured_at)`.

## webhook_events
`event_id` unique (from `X-Razorpay-Event-Id`), `event`, `payload` JSON, `received_at`. Pure dedupe + audit.

## clicks
`listing_id`, `referer`, `at`. One row per `/out/{slug}` hit. Counted per listing on every board row.

## Derived values (never stored)
- `total_paise(listing, board, window)` = SUM of payments.
- `rank` = position after sorting by total desc, published_at asc.
- `take_price_paise(rank)` = see Rules.md.
