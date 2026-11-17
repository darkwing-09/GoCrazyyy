# Issues and known gaps

| # | Severity | Issue | Where | Suggested fix |
| --- | --- | --- | --- | --- |
| 1 | high | No rate limiting on claims, resolve and click redirect | Vercel | Vercel Firewall rate-limit rule (see Deployment.md) |
| 3 | med | No admin UI; removal and re-categorisation are DB edits | | Token-protected `/admin` routes |
| 4 | med | No schema migrations | `db.py` | Add Alembic before the first prod schema change |
| 5 | med | Business details must be set before Razorpay activation | Vercel env | Set `BUSINESS_NAME`, `CONTACT_EMAIL`, `BUSINESS_ADDRESS`, `JURISDICTION` |
| 6 | low | Unpaid claims leave unpublished listing rows forever | `create_claim` | Nightly cleanup of unpublished listings older than 7 days with no orders paid |
| 7 | low | Daily archive stops at 90 days | `/api/daily` | Paginate by month |
| 8 | low | `/api/categories` runs one ranking query per category (30) | `categories()` | One grouped query with category join |
| 9 | low | Fonts loaded from Google Fonts | `index.html` | Self-host via `@fontsource` |
| 10 | low | Favicons fall back to Google's s2 service | `metadata.py` | Fetch and cache icons locally |
| 12 | info | Search is client-side over the first 50 All-time rows | `Header.tsx` | `/api/search?q=` once the board exceeds a page |
| 13 | low | Hero tubes chunk is ~210 kB gzip | `Background.tsx` | Loaded lazily after first paint; drop `count` further or disable on low-end devices if needed |
| 14 | info | Terms, Privacy and Refund copy should be reviewed by a lawyer before launch | `Legal.tsx` | |
