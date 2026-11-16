# Plan

## Phase 0 · Research (done 17 Nov 2026)
outbid.lol teardown, Razorpay and DataFast API research. Captured in `GoCrazy Pay-to-Rank … Plan.md` (the original brief) and PRD.md.

## Phase 1 · MVP (done 17 Nov 2026)
Backend ledger + boards + pricing, Razorpay orders/verify/webhook, DataFast stats and payment post, full frontend (home boards, categories, product, daily, about, policy pages), palette picker, animated background, mock checkout, tests, docs.

## Phase 2 · Launch prep (next)
1. Fill legal pages with the registered business details; lawyer pass on Terms.
2. Razorpay live activation (needs the deployed site).
3. DataFast website + public stats link.
4. Deploy (Deployment.md), set `SEED_DEMO=false`, delete demo rows.
5. Rate limiting, SSRF guard, security headers (Security.md).
6. OG image per listing (`/product/{slug}` share card) so buyers can post their rank.
7. Decide the niche and write the launch post.

## Phase 3 · Growth
- Weekly email digest (top 10 + biggest climbs) per board and per category.
- Admin page (remove, re-categorise, refetch metadata) behind a token.
- Alembic migrations; Postgres.
- "Biggest climbs today" strip and a per-listing sparkline of payments.
- Embeddable badge: "#3 on GoCrazy" SVG for buyers' sites (backlink loop).

## Phase 4 · Maybe
Accounts, invoices with GST, multi-currency, sponsorship of a whole category for a day.
