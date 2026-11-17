# Changelog

## 1.0.2 · 2026-11-17
- Hero tubes are multi-colour (reference pink/green/violet palette by default; click empty hero space for three more) and the idle tube spans about 20% of the infinity loop.
- Text reads solid: brighter secondary/meta text (ink-2 #e2e2e9, ink-3 #b8b8c4, ≥9:1), body weight 450, medium-weight small text, near-opaque cards and inputs behind text, no faded or glowing text, readable disabled buttons.
- Repository hygiene: local databases and Python caches are no longer tracked.

## 1.0.1 · 2026-11-17
- Hero tubes: idle tubes are about 3× longer (≈40% of the loop) and trace a wider infinity symbol sized to the viewport; they ease back to the short cursor-follow when the pointer enters the hero. Trail length is now frame-rate independent (same on 60, 120 and 144 Hz screens, and no collapse on slow devices).
- Dark is the only theme: removed the light theme and its toggle; stale saved preferences are cleared.
- Brighter text on dark (secondary and meta text now ≥7:1), stronger hairlines, readable disabled button.
- Claim form: required fields (URL, category, Terms, and the discount on Deals) marked with `*` plus a "* Required" note.
- Startup details & contacts (location, stage, X, LinkedIn, WhatsApp) are optional and open automatically once a URL and category are entered; no toggle.

## 1.0.0 · 2026-11-17 · Production release
- Deploys to Vercel: static site plus a Python serverless API on one domain (`vercel.json`, `api/index.py`, root `requirements.txt`).
- Postgres (Neon) in production with a null pool; SQLite refused on Vercel; tables and categories created on cold start.
- No seeded listings or payments; empty states for every board; stats appear only once DataFast reports data.
- Business name, contact email, address, jurisdiction, launch date and Deals close date come from environment variables.
- Test checkout disabled in production; claims return 503 without Razorpay keys; API docs hidden in production.
- SSRF guard on the URL resolver, including redirect hops.
- Founder email and phone returned only on the listing page.
- Hero: cursor-following 3D neon tubes in brand colours, click to cycle palettes, static fallback.
- Removed placeholder copy, the demo badge, template assets and the 2,000-file dynamic icon loader; added share image, robots.txt and social meta tags.
- Health endpoint checks the database. 21 backend tests, run on SQLite and Postgres.

## 0.2.0 · 2026-11-17
- Dedicated `#38bdf8` Cyber Sky Blue theme in a single dark theme with high contrast readability.
- Startup details and founder contact information (Twitter/X, LinkedIn, Location/HQ, Stage, WhatsApp/Phone) added to claims, listing profiles, and database schema.
- Vercel full-stack deployment configuration (`vercel.json`, `api/index.py`, monorepo build setup, serverless database resolver).

## 0.1.0 · 2026-11-17
First working build.
- Boards: All-time, Today (IST), Daily archive, per-category, Deals.
- Claim flow with live rank quote, Razorpay checkout, signed idempotent webhook, mock mode for local dev.
- DataFast tracking script, payment attribution, header and footer stats.
- Pay-to-rank rules: ₹99 minimum, #1 = +₹100, other ranks +₹10, raise by difference, older listing wins ties.
- Product page with outrank price Q&A and payment history; categories page with hottest 3; daily archive.
- Dark neon UI, animated background, page transitions, reduced-motion support.
- Policy pages: Rules, FAQ, Terms, Refunds, Privacy, Contact.
- 12 backend tests; full documentation set.
