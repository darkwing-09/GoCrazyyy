# Deployment (Vercel)

One Vercel project serves both halves from the same domain:

| Path | Served by |
| --- | --- |
| `/`, `/assets/*`, every page route | Static React build from `frontend/dist` |
| `/api/*`, `/out/*`, `/webhooks/*` | Python serverless function `api/index.py` (the FastAPI app in `backend/app`) |

Same origin means no CORS, the Razorpay webhook lives at `https://<domain>/webhooks/razorpay`, and outbound click tracking stays on your domain.

## 1. Database (required)
Vercel's filesystem is not persistent, so the API refuses to start on SQLite there.

1. Vercel dashboard → your project → **Storage** → **Create** → **Neon (Postgres)** → connect it to the project.
2. Neon sets `DATABASE_URL` (and `POSTGRES_URL`) automatically. Use the **pooled** connection string; the API uses a null pool on Vercel so the Neon pooler holds connections.
3. Tables and the 30 categories are created on the first request. Nothing else is seeded: the board starts empty.

## 2. Environment variables
Project → Settings → Environment Variables. Set them for **Production** (and **Preview** if you use preview deployments).

| Variable | Value |
| --- | --- |
| `DATABASE_URL` | Set by the Neon integration |
| `SITE_URL` | `https://your-domain.in` |
| `BUSINESS_NAME` | Registered business name (shown in footer, Terms, Contact) |
| `CONTACT_EMAIL` | Support address (Contact page) |
| `BUSINESS_ADDRESS` | Registered address (Contact page) |
| `JURISDICTION` | City for the governing-law clause, e.g. `Bengaluru` |
| `LAUNCHED_AT` | `YYYY-MM-DD`, shown as "since launch" on the stats strip |
| `RAZORPAY_KEY_ID` | Live key id |
| `RAZORPAY_KEY_SECRET` | Live key secret |
| `RAZORPAY_WEBHOOK_SECRET` | Secret you set on the webhook |
| `DATAFAST_API_KEY` | `df_…` website key |
| `DATAFAST_WEBSITE_ID` | `dfid_…` |
| `DATAFAST_DOMAIN` | `your-domain.in` |
| `DATAFAST_PUBLIC_STATS_URL` | Optional public dashboard link |
| `DEALS_CLOSES_AT` | Optional ISO time; shows a countdown on the Deals board |

`APP_ENV` is not needed: Vercel production and preview deployments are always treated as production. In production the test checkout is disabled; without Razorpay keys, claims return "Payments are temporarily unavailable".

## 3. Deploy
Import the repository in Vercel with the **repository root** as the project root. `vercel.json` already sets the install, build and output commands, the function and the rewrites; leave the framework preset as "Other".

```bash
# or from the CLI
npm i -g vercel
vercel link
vercel env pull backend/.env    # optional: use the same settings locally
vercel --prod
```

## 4. Razorpay
1. Dashboard → Settings → API Keys → generate **live** keys → set both env vars.
2. Dashboard → Settings → Webhooks → Add: URL `https://your-domain.in/webhooks/razorpay`, secret = `RAZORPAY_WEBHOOK_SECRET`, event `payment.captured`.
3. Activation review needs the live site with Terms, Refunds, Privacy and Contact pages: all exist, and Contact shows `CONTACT_EMAIL`, `BUSINESS_NAME` and `BUSINESS_ADDRESS`.
4. Make one live ₹99 payment. Confirm the listing appears, and that `/api/health` reports `"payments": "razorpay"`.

## 5. DataFast
1. Create the website, set its currency to INR, copy the website id and create a `df_` API key.
2. After the first visits, the header shows online/visitors-today and the stats strip appears. Both stay hidden until real numbers exist.
3. A test payment appears in DataFast's revenue view, attributed to the visitor.

## 6. After the first deploy
- `GET https://your-domain.in/api/health` → `{"ok": true, "database": true, "payments": "razorpay", "env": "production"}`.
- Vercel → Firewall → add a rate-limit rule for `/api/claims` and `/api/resolve` (for example 20 requests per minute per IP).
- Add your custom domain under Settings → Domains and update `SITE_URL`.

## Local development
```bash
cd backend && cp .env.example .env && uv run uvicorn app.main:app --reload --port 8000
cd frontend && pnpm install && pnpm dev
```
Locally the API uses SQLite and, without Razorpay keys, a test checkout that charges nothing.
