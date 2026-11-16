# CLAUDE.md

Instructions for Claude Code (and any agent) working in this repo. Read AGENTS.md too; it is the same contract for other tools.

## What this is
GoCrazy: pay-to-rank leaderboard for Indian startups. FastAPI backend in `backend/app`, React + Vite frontend in `frontend/src`. See README.md for how to run it and Architecture.md for the shape.

## Non-negotiables
- Money is integer paise everywhere in the backend. Never store floats. Display with `rupees()` from `frontend/src/lib/format.ts`.
- Rank is derived: `SUM(payments.amount_paise)` per listing over the board's window. Never cache a rank or total on the listing row.
- A payment enters the ledger only through `app/ledger.py:record_capture`, which is idempotent on `provider_payment_id`. Both the checkout verify endpoint and the webhook call it.
- Verify Razorpay signatures with the raw request body. Never parse first.
- The DataFast API key stays server-side. The frontend only ever sees the public website id.
- Pricing constants live in `app/pricing.py` and are served via `/api/meta`; the frontend never hard-codes rupee amounts except as fallbacks.
- Every placement is a paid advertisement and is labelled as such in the UI. Do not remove the label.

## Frontend conventions
- Design tokens are CSS variables in `src/index.css`; the accent is `oklch(var(--accent-l) var(--accent-c) var(--accent-h))` and is switched by `ThemeProvider`. Never hard-code the accent colour.
- Motion: `motion/react`. One grammar: rise + unblur with `[0.16, 1, 0.3, 1]`. Respect `useTheme().reducedMotion`.
- Icons: lucide only, `strokeWidth={1.75}`. No emoji as icons.
- Fonts: Bricolage Grotesque (display, class `display`), Geist (body), Geist Mono (amounts, class `tnum`).
- Path alias `@/` maps to `frontend/src`.
- Run `npx tsc -b` before claiming the frontend compiles.

## Backend conventions
- SQLAlchemy 2 typed models in `app/models.py`. Timestamps are UTC; SQLite stores them naive, so compare through `boards._db_time` and output through `boards.as_utc`.
- Board windows are IST days (`boards.IST`).
- New routes go in `app/main.py` until it needs splitting into routers.

## Design workflow
This project uses the impeccable skill. PRODUCT.md holds product truth; `.impeccable/briefs/home.md` holds the direction contract; DESIGN.md (when present) holds the token system. Refinements keep the committed world; do not re-roll the direction.

## Do not
- Do not commit `backend/.env`, `backend/gocrazy.db`, or anything under `.impeccable/review`.
- Do not add a second payment provider or a login system without an ADR in Decisions.md.
