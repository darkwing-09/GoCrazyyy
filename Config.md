# Configuration

Backend settings are read from `backend/.env` (copy `backend/.env.example`). The frontend needs no env file; it learns public ids from `GET /api/meta`.

| Variable | Default | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | `sqlite:///./gocrazy.db` | SQLAlchemy URL. Postgres: `postgresql+psycopg://user:pass@host/db` (add `psycopg[binary]` to deps). |
| `SITE_URL` | `http://localhost:5173` | Public site origin, used in receipts and links. |
| `FRONTEND_ORIGINS` | `http://localhost:5173,http://127.0.0.1:5173` | CORS allow-list, comma separated. |
| `RAZORPAY_KEY_ID` | empty | Public key id. Shown to the browser via `/api/meta`. |
| `RAZORPAY_KEY_SECRET` | empty | Server only. When both key values are set, `payments_mode=razorpay`; otherwise `mock`. |
| `RAZORPAY_WEBHOOK_SECRET` | empty | Server only. Webhook signatures are rejected when this is empty. |
| `DATAFAST_API_KEY` | empty | `df_…` website key (preferred) or `dft_…` account token. Server only. |
| `DATAFAST_WEBSITE_ID` | empty | `dfid_…`; required with a `dft_` token; also injected into the tracking script. |
| `DATAFAST_DOMAIN` | empty | Root domain for the tracking script's `data-domain`. |
| `DATAFAST_PUBLIC_STATS_URL` | empty | Public share link from the DataFast dashboard; rendered as "Live stats". |
| `STATS_CACHE_SECONDS` | `60` | Cache TTL for `/api/stats` upstream calls (realtime uses 30 s). |
| `SEED_DEMO` | `true` | Seed categories and demo listings into an empty database on startup. |

Pricing constants are code, not env: `backend/app/pricing.py`. Change them there and the UI follows via `/api/meta`.

## Razorpay dashboard
1. Settings → API Keys → generate test keys; paste into `.env`.
2. Settings → Webhooks → Add: URL `https://<api-host>/webhooks/razorpay`, secret = `RAZORPAY_WEBHOOK_SECRET`, events `payment.captured`.
3. Activation needs the live site with Terms, Refund, Privacy and Contact pages (all present under `/terms`, `/refunds`, `/privacy`, `/contact`; fill in the real business name, address and email in `frontend/src/pages/Legal.tsx`).

## DataFast dashboard
1. Add the website; copy the Website ID (`dfid_…`) and the domain.
2. Settings → API keys → create a website key (`df_…`).
3. Settings → General → set currency to INR. Optionally enable the public dashboard share and paste the link as `DATAFAST_PUBLIC_STATS_URL`.
4. DataFast ignores `localhost`, so the header strip shows "live" without numbers in development.
