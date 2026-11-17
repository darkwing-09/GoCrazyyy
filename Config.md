# Configuration

The API reads settings from environment variables (locally from `backend/.env`; on Vercel from Project → Settings → Environment Variables). The frontend has no env file: it reads public values from `GET /api/meta`.

| Variable | Default | Purpose |
| --- | --- | --- |
| `APP_ENV` | `development` | `production` disables the test checkout and hides the API docs. Vercel production/preview deployments are always production. |
| `DATABASE_URL` / `POSTGRES_URL` | `sqlite:///./gocrazy.db` | SQLAlchemy URL. `postgres://` and `postgresql://` are converted to the psycopg driver. SQLite is refused on Vercel. |
| `SITE_URL` | `http://localhost:5173` | Public origin; also added to the CORS allow-list. |
| `FRONTEND_ORIGINS` | localhost:5173 | Extra CORS origins, comma separated (only needed if the frontend runs on another origin). |
| `BUSINESS_NAME` | `GoCrazy` | Footer copyright, Terms, Contact. |
| `CONTACT_EMAIL` | empty | Contact page email. The section is hidden when empty. |
| `BUSINESS_ADDRESS` | empty | Contact page address. |
| `JURISDICTION` | empty | City named in the governing-law clause. |
| `LAUNCHED_AT` | empty | `YYYY-MM-DD`; "since launch" on the stats strip. |
| `DEALS_CLOSES_AT` | empty | ISO timestamp; Deals board countdown. Hidden when empty. |
| `RAZORPAY_KEY_ID` | empty | Public key id, sent to the browser for Checkout. |
| `RAZORPAY_KEY_SECRET` | empty | Server only. With both keys set, payments use Razorpay. |
| `RAZORPAY_WEBHOOK_SECRET` | empty | Server only. Webhooks are rejected while empty. |
| `DATAFAST_API_KEY` | empty | `df_` website key or `dft_` account token. Server only. |
| `DATAFAST_WEBSITE_ID` | empty | `dfid_…`; required with a `dft_` token and used for the tracking script. |
| `DATAFAST_DOMAIN` | empty | Tracking script `data-domain`. |
| `DATAFAST_PUBLIC_STATS_URL` | empty | Public dashboard link ("Live stats" in the footer). |
| `STATS_CACHE_SECONDS` | `60` | Cache for DataFast overview calls (realtime uses 30 s). |

## Behaviour by environment
| | Development | Production |
| --- | --- | --- |
| No Razorpay keys | Test checkout, no money charged | Claims return 503 "Payments are temporarily unavailable" |
| `/api/docs` | Available | 404 |
| Database | SQLite file | Postgres (required on Vercel) |
| DataFast unset | Stats strip and header counts hidden | Same |

Pricing lives in code, not env: `backend/app/pricing.py`, served to the UI through `/api/meta`.
