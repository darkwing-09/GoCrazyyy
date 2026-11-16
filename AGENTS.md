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
cd backend && uv run pytest        # see TestPlan.md
```

## Rules of the road
1. Paise integers only. Rank = SUM of captured payments. Idempotent capture via `record_capture`.
2. Signature-verify every Razorpay callback and webhook on the raw body.
3. DataFast key is server-only.
4. Accent colour comes from CSS variables; never hard-code it.
5. Keep docs honest: when behaviour changes, update API.md, Rules.md and Changelog.md in the same change.
6. Prefer editing `app/main.py` and the matching page over adding abstractions. This is a small product.
