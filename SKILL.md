---
name: gocrazy
description: Work on the GoCrazy pay-to-rank leaderboard (FastAPI + React). Use when adding boards, changing pricing, touching the Razorpay or DataFast integrations, or styling the neon UI.
---

# GoCrazy skill

## Before changing anything
1. Read CLAUDE.md (invariants) and the file you are touching. Architecture.md explains the shape.
2. Run the baseline: `cd backend && uv run pytest -q` and `cd frontend && npx tsc -b`.

## Recipes
**Change a price rule** → edit `backend/app/pricing.py` only; the UI reads `/api/meta`. Update Rules.md and the `/rules` page copy if the wording changes. Add a test in `tests/test_pricing.py`.

**Add a board** → add a window in `boards.board_window`, a `Literal` value in `/api/board`, a tab in `BoardTabs.tsx` and a route in `App.tsx`. Decide whether it reads `main` or `deals` payments.

**Add a category** → append to `seed.CATEGORIES` (slug, name, lucide icon) and add the icon to `CATEGORY_ICONS` in `frontend/src/components/Icon.tsx`. Existing databases pick it up on the next cold start (`seed_categories` inserts missing slugs).

**Touch payments** → never bypass `ledger.record_capture`. Verify signatures on raw bytes. Run `test_api.py::test_webhook_rejects_bad_signature_and_accepts_good`.

**Touch stats** → DataFast calls live in `datafast.py` and are cached; keep failures silent and fall back to the ledger.

**Style** → tokens in `index.css`; accent via `var(--accent)` or the `-12/-20/-40` alphas; motion through `motion/react` with the `[0.16,1,0.3,1]` ease and `useTheme().reducedMotion`. Run the impeccable detector on the dev server after UI edits.

## Verify
Screenshot at 1440 and 390 with Playwright (script pattern in TestPlan.md), check console for React warnings, run tests.
