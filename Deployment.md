# Deployment

Any Linux box or PaaS works. The reference layout is either a unified monorepo on **Vercel** (Vite SPA + Serverless Python FastAPI) or one VM / PaaS (Railway, Render, Fly) with Postgres.

## Deploying on Vercel (Unified Frontend + Backend)

GoCrazy is configured as a single Vercel deployment:
- **Frontend**: Vite React SPA static export from `frontend/dist` with SPA fallback.
- **Backend**: FastAPI Serverless Function running on `@vercel/python` via `api/index.py`.
- **Routing**: Handled via root `vercel.json` (`/api/*`, `/out/*`, `/webhooks/*` rewrite to Python, all other paths rewrite to `/index.html`).

### 1. Database Requirement on Vercel
Vercel serverless functions are stateless. For production data persistence:
- Connect a hosted PostgreSQL database (free tier on **Neon.tech**, **Supabase**, or **Vercel Postgres**).
- Set `DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require` in your Vercel Project Environment Variables.
- *(Note: If no `DATABASE_URL` is set, GoCrazy falls back to `/tmp/gocrazy.db` for ephemeral preview/demo instances).*

### 2. Environment Variables in Vercel
Add these in **Vercel Dashboard → Project Settings → Environment Variables**:
- `DATABASE_URL`: PostgreSQL connection string (Neon / Supabase).
- `SITE_URL`: `https://your-app.vercel.app`
- `RAZORPAY_KEY_ID`: Your Razorpay Key ID (optional, runs in mock mode if unset).
- `RAZORPAY_KEY_SECRET`: Your Razorpay Key Secret.
- `RAZORPAY_WEBHOOK_SECRET`: Webhook secret matching `https://your-app.vercel.app/webhooks/razorpay`.
- `SEED_DEMO`: `true` (for initial demo startups) or `false` (for clean production).

### 3. Deploy via GitHub / GitLab
1. Push your repository to GitHub.
2. In Vercel, click **"Add New..." → Project**.
3. Import the repository.
4. Leave Root Directory as `./` (Root).
5. Vercel automatically detects `vercel.json` and builds both frontend and Python backend!
6. Click **Deploy**.

### 4. Deploy via Vercel CLI
```bash
npm install -g vercel
vercel login
vercel --prod
```

## Build
```bash
cd frontend && pnpm install --frozen-lockfile && pnpm build     # → frontend/dist
cd backend  && uv sync --no-dev
```

## Run
```bash
cd backend && uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 2
```
Serve `frontend/dist` as static files with SPA fallback and proxy `/api`, `/out`, `/webhooks` to `:8000`.

### Caddy example
```
gocrazy.in {
  encode zstd gzip
  handle /api/* { reverse_proxy 127.0.0.1:8000 }
  handle /out/* { reverse_proxy 127.0.0.1:8000 }
  handle /webhooks/* { reverse_proxy 127.0.0.1:8000 }
  handle { root * /srv/gocrazy/frontend/dist; try_files {path} /index.html; file_server }
}
```

### systemd unit (backend)
```
[Service]
WorkingDirectory=/srv/gocrazy/backend
EnvironmentFile=/srv/gocrazy/backend/.env
ExecStart=/root/.local/bin/uv run uvicorn app.main:app --host 127.0.0.1 --port 8000 --workers 2
Restart=always
```

## Database
- Dev: SQLite file next to the backend. Fine for launch at low volume (WAL mode is on). Back it up with `sqlite3 gocrazy.db ".backup backup.db"` nightly.
- Prod: Postgres. `uv add "psycopg[binary]"`, set `DATABASE_URL=postgresql+psycopg://…`. Tables are created on startup (`create_all`); add Alembic before the first schema change in production.
- Set `SEED_DEMO=false` in production, or wipe demo rows: `DELETE FROM payments WHERE listing_id IN (SELECT id FROM listings WHERE is_demo); DELETE FROM clicks …; DELETE FROM listings WHERE is_demo;`.

## Razorpay go-live checklist
1. Live keys in `.env`; webhook pointed at `https://gocrazy.in/webhooks/razorpay` with `payment.captured`.
2. Terms, Refunds, Privacy, Contact pages filled with the registered business name, address, email.
3. Test a ₹99 live payment, confirm the row appears and the webhook event lands in `webhook_events`.

## DataFast checklist
1. Website created, currency INR, `DATAFAST_*` set.
2. Confirm `/api/stats` returns `source: datafast` after the first visit.
3. Confirm a test payment appears in the DataFast Revenue tab with the right visitor.

## Observability
Uvicorn access logs plus `logging` warnings from `datafast` and `gocrazy` loggers. Add Sentry (`sentry-sdk[fastapi]`) before launch if you want stack traces.
