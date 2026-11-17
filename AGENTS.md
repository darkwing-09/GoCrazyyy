# AGENTS.md

Shared instructions for AI coding agents (Codex, Cursor, Claude, Gemini). CLAUDE.md is the canonical copy; keep the two in sync.

## Map
- `backend/app/main.py` routes · `boards.py` ranking queries · `pricing.py` constants · `ledger.py` idempotent capture · `razorpay_client.py` · `datafast.py` · `metadata.py` URL resolver · `seed.py` demo data · `models.py`
- `frontend/src/pages` one file per route · `components` UI · `lib/api.ts` typed client · `lib/theme.tsx` accent palette · `index.css` tokens

## Commands
```bash
cd backend && uv run uvicorn app.main:app --reload --port 8000
cd frontend && pnpm dev
cd frontend && npx tsc -b && pnpm build
cd backend && uv run pytest        # see docs/TestPlan.md
```

## Rules of the road
1. Paise integers only. Rank = SUM of captured payments. Idempotent capture via `record_capture`.
2. Signature-verify every Razorpay callback and webhook on the raw body.
3. DataFast key is server-only.
3a. No seeded listings, no demo or placeholder copy on the site, test checkout development-only, founder contacts only on the listing page.
3b. Deploys to Vercel via `vercel.json` + `api/index.py`; keep root `requirements.txt` in sync with `backend/pyproject.toml`.
4. Dark theme only. Accent is sky blue `#38bdf8` via CSS variables. Do not add a light theme or a theme toggle.
5. Keep docs honest: when behaviour changes, update docs/API.md, docs/Rules.md and docs/Changelog.md in the same change. Docs live in `docs/` (git-ignored, local only).
6. Prefer editing `app/main.py` and the matching page over adding abstractions. This is a small product.
