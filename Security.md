# Security

## Threat model
Small public site taking payments. Assets: the ledger (rank integrity), Razorpay secrets, the DataFast key, founders' contact emails. Attackers: people trying to gain rank without paying, replaying webhooks, scraping, and generic web abuse.

## Controls in place
| Area | Control | Where |
| --- | --- | --- |
| Rank integrity | Rank is derived from the ledger only; the browser never posts an amount that is trusted without a verified Razorpay capture | `ledger.py`, `main.py` |
| Checkout tampering | Signature verified with the **stored** order id, then the payment is fetched from Razorpay and its status and amount compared to the order | `verify_payment` |
| Webhook forgery | HMAC-SHA256 over the raw body with `RAZORPAY_WEBHOOK_SECRET`, constant-time compare; rejected when the secret is unset | `razorpay_client.verify_webhook_signature` |
| Replay | `webhook_events.event_id` unique; `payments.provider_payment_id` unique; `record_capture` is a no-op on repeat | `models.py`, `ledger.py` |
| Production gating | Test checkout disabled and API docs hidden in production; claims return 503 without Razorpay keys | `config.py`, `main.py` |
| Contact privacy | Founder email/phone returned only by the single-listing endpoint, never by board lists | `listing_out` |
| Secrets | Only `RAZORPAY_KEY_ID` and the DataFast website id are exposed via `/api/meta`; secrets are read from `.env` which is gitignored | `config.py`, `.gitignore` |
| SSRF via URL resolver | Host resolved and private, loopback, link-local, reserved and multicast addresses refused, on the first request and on every redirect hop; 8 s timeout, 5 redirects, 400 KB parse cap | `metadata.py` |
| Open redirect | `/out/{slug}` redirects only to stored listing URLs, never to a query parameter | `main.py` |
| CORS | Allow-list from `FRONTEND_ORIGINS` | `main.py` |
| Input limits | Pydantic field lengths; whole rupees; ceiling; category must exist | `ClaimIn` |
| XSS | React escapes all listing text; favicons are plain `<img src>` | frontend |
| Cookies | Only DataFast's first-party analytics cookie; no auth cookies exist | |

## Not yet in place (do before public launch)
1. Rate limiting on `/api/claims`, `/api/resolve`, `/out/*`: add a Vercel Firewall rate-limit rule (in-process limits do not work on serverless).
2. A Content-Security-Policy that allows `checkout.razorpay.com`, `api.razorpay.com`, `datafa.st`, `fonts.googleapis.com` and `fonts.gstatic.com`. `vercel.json` already sets nosniff, referrer policy, frame options and permissions policy; Vercel adds HSTS.
4. Secret rotation procedure for the webhook secret (validate retries with the old secret for 24 h).
5. Admin actions (remove listing, re-categorise) need an authenticated path; today they are DB edits.
6. Backups: enable Neon point-in-time restore (the ledger is the business).

## Data protection (DPDP Act 2023)
Personal data stored: optional contact email (orders, listings), Razorpay payment ids, click referers, DataFast visitor id on orders. Deletion request: null `listings.contact_email`, `orders.email`, `orders.df_visitor_id` for the domain; keep amounts.
