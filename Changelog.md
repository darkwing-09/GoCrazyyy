# Changelog

## 0.2.0 · 2026-11-17
- Dedicated `#38bdf8` Cyber Sky Blue theme across light and dark modes with high contrast readability.
- Startup details and founder contact information (Twitter/X, LinkedIn, Location/HQ, Stage, WhatsApp/Phone) added to claims, listing profiles, and database schema.
- Vercel full-stack deployment configuration (`vercel.json`, `api/index.py`, monorepo build setup, serverless database resolver).

## 0.1.0 · 2026-11-17
First working build.
- Boards: All-time, Today (IST), Daily archive, per-category, Deals.
- Claim flow with live rank quote, Razorpay checkout, signed idempotent webhook, mock mode for local dev.
- DataFast tracking script, payment attribution, header and footer stats.
- Pay-to-rank rules: ₹99 minimum, #1 = +₹100, other ranks +₹10, raise by difference, older listing wins ties.
- Product page with outrank price Q&A and payment history; categories page with hottest 3; daily archive.
- Dark neon UI with five switchable accents, perspective point-field background, page transitions, reduced-motion support.
- Policy pages: Rules, FAQ, Terms, Refunds, Privacy, Contact.
- 12 backend tests; full documentation set.
