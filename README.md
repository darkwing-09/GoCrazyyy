# GoCrazy

The pay-to-rank leaderboard for Indian startups. A founder submits a URL or @handle, picks a category and pays in rupees through Razorpay. A listing's rank is the sum of everything it has ever paid. Site traffic is measured independently by DataFast.

## Stack

| Layer | Choice |
| --- | --- |
| Hosting | Vercel: static React build plus a Python serverless function, one domain |
| Backend | Python 3.12, FastAPI, SQLAlchemy 2 |
| Database | Postgres (Neon) in production, SQLite locally |
| Payments | Razorpay Orders, Checkout.js, signed idempotent `payment.captured` webhook |
| Analytics | DataFast tracking script, Payments API, Overview and Realtime APIs |
| Frontend | React 19, Vite 8, TypeScript, Tailwind v4, `motion`, lucide-react, react-router 7, threejs-components (hero tubes) |

## Run locally

```bash
# API (uv manages the virtualenv)
cd backend
cp .env.example .env
uv run uvicorn app.main:app --reload --port 8000

# Web
cd frontend
pnpm install
pnpm dev            # http://localhost:5173, proxies /api, /out and /webhooks to :8000
```

The database starts empty apart from the 30 categories. Without Razorpay keys, local claims use a test checkout that charges nothing; in production that path is disabled.

## Test

```bash
cd backend && uv run pytest -q                                   # SQLite
TEST_DATABASE_URL=postgresql://… uv run pytest -q                 # Postgres
cd frontend && pnpm build                                         # type-check and production build
```

## Deploy

See [Deployment.md](Deployment.md): connect Neon Postgres, set the environment variables, import the repository into Vercel, and point the Razorpay webhook at `/webhooks/razorpay`.

## Documentation

- [PRD.md](PRD.md): what we are building and why
- [Architecture.md](Architecture.md): how the pieces fit
- [API.md](API.md), [DataModel.md](DataModel.md), [Config.md](Config.md)
- [Rules.md](Rules.md): ranking and pricing rules as implemented
- [Deployment.md](Deployment.md), [Security.md](Security.md), [TestPlan.md](TestPlan.md)
- [Plan.md](Plan.md), [Implementation.md](Implementation.md), [Progress.md](Progress.md), [Decisions.md](Decisions.md), [Issues.md](Issues.md), [Changelog.md](Changelog.md)
- [CLAUDE.md](CLAUDE.md) and [AGENTS.md](AGENTS.md): instructions for coding agents
