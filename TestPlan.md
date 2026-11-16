# Test plan

## Automated (run before every push)
```bash
cd backend && uv run pytest -q          # 12 tests: pricing + API flows
cd frontend && npx tsc -b && pnpm build  # type-check + production bundle
```

`backend/tests/test_pricing.py` covers: floors, +₹100 for #1, +₹10 for other ranks, tie-break (equal amount loses), deals pricing.

`backend/tests/test_api.py` covers: sorted board and take-top price, category filter and pagination, terms and minimum validation, full claim → mock capture → idempotent repeat → raise by difference → cumulative total and product page `raise_count`, webhook bad signature rejected, good signature accepted once and deduped on replay with the listing published, `/out` redirect with utm, `/api/stats` ledger fallback.

## Manual (UI) checklist
| # | Step | Expected |
| --- | --- | --- |
| 1 | Open `/` | Hero shows `Claim #1 for − ₹X +` where X = #1 total + ₹100; rows #1–#3 tinted; sidebars on ≥1024 px |
| 2 | Press − / + | Amount steps ₹10, light sweep plays, rank in the headline updates after ~200 ms, #1 row glow brightens as amount approaches its total |
| 3 | Type a URL, pick a category, tick Terms | Claim rank button enables; helper line says which rank it lands |
| 4 | Submit (mock mode) | Dialog "Simulate successful payment" → "You're #N of M" → board refreshes with the new row |
| 5 | Submit (Razorpay test keys) | Razorpay modal opens with the amount; test UPI success → verifying → done; row appears |
| 6 | Row "claim this rank for ₹X" | Scrolls to hero, amount prefilled to X, URL input focused |
| 7 | Product page "Outrank for ₹X" | Navigates home with the amount prefilled |
| 8 | Palette picker | Each swatch recolours buttons, tabs, row tints, glow and background instantly; choice survives reload |
| 9 | Deals tab | Extra discount + coupon fields; discount counter 0/100; Claim disabled until described |
| 10 | Today tab | Countdown to midnight IST; empty state copy when no payments today |
| 11 | Categories page | Hottest 3 cards; every category with top 3 or "Take #1 for ₹X" |
| 12 | Daily page | Today marked live with countdown; past days frozen; "Show all N ranks" opens the day board |
| 13 | Search (⌘/Ctrl K or icon) | Filters by title, domain, category; Esc closes |
| 14 | 390 px wide | No horizontal scroll; chip rail scrolls; form stacks; sidebars move below the list |
| 15 | OS reduced-motion on | Background static, no entrance animations, spotlight static |
| 16 | Keyboard only | Every control reachable; visible accent focus ring |
| 17 | Webhook replay (`curl` same body twice) | Second response `duplicate: true`, total unchanged |

## Not covered yet
Frontend unit tests (none), E2E with Playwright against the mock checkout (script in TestPlan is manual), load testing of `/api/home` at >5k listings.
