# GoCrazy

The pay-to-rank leaderboard for Indian startups. A founder submits a URL, picks a category, pays in rupees through Razorpay, and the listing's rank is the sum of everything it has ever paid. Site traffic and revenue stats come from DataFast.

Functional reference: [outbid.lol](https://outbid.lol). Visual direction: near-black, one switchable neon accent, light-based motion.

## Stack

| Layer | Choice |
| --- | --- |
| Backend | Python 3.12, FastAPI, SQLAlchemy 2, SQLite (dev) or Postgres (prod) |
| Payments | Razorpay Orders + Checkout.js + signed `payment.captured` webhook |
| Analytics | DataFast tracking script, Payments API, Overview and Realtime API |
| Frontend | React 19, Vite 8, TypeScript, Tailwind v4, `motion` (framer-motion), lucide-react, react-router 7 |

## Run it locally

```bash
# backend (uv manages the venv)
cd backend
cp .env.example .env          # leave Razorpay keys blank for the mock checkout
uv run uvicorn app.main:app --reload --port 8000

# frontend
cd frontend
pnpm install
pnpm dev                       # http://localhost:5173, proxies /api, /out, /webhooks to :8000
```

The first start creates `backend/gocrazy.db` and seeds ~48 synthetic listings (flagged `is_demo`). Set `SEED_DEMO=false` to start empty.

With no Razorpay keys the claim form opens a **mock checkout** that simulates a capture. Add `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` and `RAZORPAY_WEBHOOK_SECRET` to switch to the real one.

## Where to read next

- [PRD.md](PRD.md): what we are building and why
- [Architecture.md](Architecture.md): how the pieces fit
- [API.md](API.md), [DataModel.md](DataModel.md), [Config.md](Config.md)
- [Rules.md](Rules.md): the ranking and pricing rules as implemented
- [Deployment.md](Deployment.md), [Security.md](Security.md), [TestPlan.md](TestPlan.md)
- [Plan.md](Plan.md), [Implementation.md](Implementation.md), [Progress.md](Progress.md), [Decisions.md](Decisions.md), [Issues.md](Issues.md), [Changelog.md](Changelog.md)
- [CLAUDE.md](CLAUDE.md) / [AGENTS.md](AGENTS.md): instructions for AI coding agents working here
