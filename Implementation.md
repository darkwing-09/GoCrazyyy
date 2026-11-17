# Implementation notes

How the main pieces were built, with the non-obvious bits called out.

## Ledger and ranking
- `Payment` rows are never updated or deleted; `record_capture` inserts once per `provider_payment_id`.
- `boards.ranked()` runs one grouped SUM query per board request, then loads the listings and click counts in two more queries. Rows are sorted in Python so the tie rule (older `published_at` wins) is explicit.
- Prices for every row (`take_price_paise`) are computed from the sorted totals via `pricing.price_for_rank`.
- The quote endpoint (`/api/quote`) projects where an amount lands, excluding the listing's own current total when it is a raise.

## Razorpay
- Orders carry `notes` with the listing id and the DataFast visitor id so the webhook alone has everything it needs.
- The checkout handler path verifies the signature using the stored order id, then re-fetches the payment from Razorpay to compare amount and status before recording. This protects against a tampered `amount` or a replayed signature from a different order.
- The webhook path hashes the raw body. FastAPI's `await request.body()` gives the exact bytes.
- Mock mode (no keys): orders get `order_mock_…` ids and `/api/payments/mock/{order}` records the capture. The UI shows a clearly labelled mock dialog.

## DataFast
- Script injection happens at runtime from `/api/meta` so the public ids live in one place (`backend/.env`).
- Payment posts use the Razorpay payment id as `transaction_id`; retries are therefore safe on DataFast's side too.
- Stats are cached per endpoint with a TTL; failures return the last good value, never an error page.

## Frontend
- One `Home` component serves six routes (board × category). React Router keeps them under one `AnimatePresence` key so the shell does not re-animate on tab switch; only the data changes.
- `ClaimHero` exposes `prefill()` through a ref so rows and the product page can set the amount without prop drilling.
- The accent is `oklch(L C H)` split into three variables; `ThemeProvider` writes them on `:root` and persists the id in `localStorage`. Every accent use in CSS derives from those three numbers (`--accent-12/20/40`, `--accent-glow`).
- `Background` lazy-loads the threejs-components `tubes1` cursor effect (WebGL2/WebGPU with bloom) into the first viewport only. Tubes follow the cursor; when the pointer is elsewhere they trace an infinity loop (x = cos 0.9t, y = sin 1.8t, sized to 34% of the viewport width) with long trails: 260–340 points per tube and a fixed 9.1 ms lag per point (4.4 ms while following), applied each frame as f = dt / (lag + dt) so length does not depend on refresh rate. A click on empty hero space cycles four on-brand palettes. The library pauses itself off-screen and on hidden tabs; pixel ratio is capped at 1.5. Reduced motion or no WebGL leaves a static accent glow.
- The claim form marks required fields with `*` and reveals the optional startup-details fieldset once `url` and `category` are set (`detailsOpen` in `ClaimHero`).
- Category icons come from a static map of 30 lucide icons (`Icon.tsx`); the dynamic loader produced ~2,000 chunks.
- Rows use a `.spot` pseudo-element whose radial gradient follows `--mx/--my`, set on `pointermove`.
- Tabular numerals (`.tnum`) and the mono face on every amount keep columns aligned.

## Data
Only the 30 categories are seeded, idempotently, on each cold start (`seed.seed_categories`). Listings and payments come only from real claims. The local test checkout records payments with `source='mock'` and is disabled in production.

## Vercel
`api/index.py` puts `backend/` on `sys.path` and exposes the FastAPI `app`. The database is initialised at import (the Python runtime does not reliably fire ASGI startup events). On Vercel the engine uses `NullPool`; SQLite is refused.

## Known shortcuts
- No migrations; `create_all` on cold start.
- No admin UI.
- Fonts from Google Fonts rather than self-hosted.
- Google's favicon service for icons when the page has none.
