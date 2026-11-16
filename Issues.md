# Issues and known gaps

| # | Severity | Issue | Where | Suggested fix |
| --- | --- | --- | --- | --- |
| 1 | high | No rate limiting on claims, resolve and click redirect | `main.py` | `slowapi` per-IP limits or proxy-level limits |
| 2 | high | URL resolver can be pointed at internal addresses (SSRF) | `metadata.py` | Resolve DNS, reject private/loopback/link-local ranges before fetching |
| 3 | med | No admin UI; removal and re-categorisation are DB edits | | Token-protected `/admin` routes |
| 4 | med | No schema migrations | `db.py` | Add Alembic before the first prod schema change |
| 5 | med | Legal pages contain placeholder business details | `Legal.tsx` | Replace before Razorpay activation |
| 6 | low | Unpaid claims leave unpublished listing rows forever | `create_claim` | Nightly cleanup of unpublished listings older than 7 days with no orders paid |
| 7 | low | Daily archive stops at 90 days | `/api/daily` | Paginate by month |
| 8 | low | `/api/categories` runs one ranking query per category (30) | `categories()` | One grouped query with category join |
| 9 | low | Fonts loaded from Google Fonts | `index.html` | Self-host via `@fontsource` |
| 10 | low | Favicons fall back to Google's s2 service | `metadata.py` | Fetch and cache icons locally |
| 11 | low | Deals board close date is hard-coded (31 Dec 2026 IST) | `Home.tsx` | Serve from config |
| 12 | info | Search is client-side over the first 50 All-time rows | `Header.tsx` | `/api/search?q=` once the board exceeds a page |
