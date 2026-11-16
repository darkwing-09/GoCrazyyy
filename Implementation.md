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
- `Background` is a 2D canvas doing a perspective projection of ~220 points plus a radial horizon glow; pointer position moves the camera, scroll pushes the field. It skips the animation loop under reduced motion and when the tab is hidden. `#root { isolation: isolate }` keeps it beneath the page content but above the ground.
- Rows use a `.spot` pseudo-element whose radial gradient follows `--mx/--my`, set on `pointermove`.
- Tabular numerals (`.tnum`) and the mono face on every amount keep columns aligned.

## Seed data
`seed.py` creates 30 categories and ~48 listings with 1–5 cumulative payments each, plus four payments stamped today so the Today board is not empty. Every row is `is_demo=true`; `/api/stats` reports `demo: true` while any is published.

## Known shortcuts
- No migrations; `create_all` on startup.
- No admin UI.
- Fonts from Google Fonts rather than self-hosted.
- Google's favicon service for icons when the page has none.
