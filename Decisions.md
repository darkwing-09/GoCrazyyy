# Decisions (ADRs)

## ADR-001 · Rank is derived, never stored
Date 2026-11-17 · Status accepted
Context: a cached `total` column is tempting. Decision: compute SUM over the ledger on every read. Consequence: zero drift, trivially correct refunds-never policy; cost is one grouped query per board, fine below ~100k payments.

## ADR-002 · Paise integers, INR only
Status accepted. Razorpay works in paise; floats would round. Multi-currency is out of scope.

## ADR-003 · Two capture paths, one writer
Status accepted. Both the checkout verify endpoint and the webhook call `record_capture`. Whichever arrives first records; the other is a no-op. Neither path is optional: the verify path gives instant UI feedback, the webhook survives closed tabs.

## ADR-004 · Boards reset on IST, not UTC
Status accepted. outbid resets at UTC; our buyers are in India and "today" should mean their today.

## ADR-005 · Deals is a separate ledger board
Status accepted. A payment is either `main` or `deals`. Mixing them would let a deal payment count on All-time.

## ADR-006 · Mock checkout when keys are absent
Status accepted. Lets anyone run the full claim flow locally and in CI without Razorpay credentials. The dialog says it is a mock and the server refuses the mock endpoint when real keys exist.

## ADR-007 · Postgres in production, SQLite locally
Status accepted (revised 2026-11-17). Vercel has no persistent disk, so production uses Neon Postgres with a null pool; SQLite stays for local development and tests.

## ADR-008 · Site stats from DataFast, listing stats from our DB
Status accepted. Visitors/revenue are site-level marketing numbers; clicks and totals are rank-critical and must not depend on a third party.

## ADR-009 · Visual direction pinned by the brief (no concept roll)
Status accepted. The user pinned near-black, switchable neon accent, light-based motion; impeccable's direction roll was skipped and `seed: none (pinned)` recorded. Amber was excluded from the accent set per the user's standing preference.

## ADR-010 · Body face Schibsted Grotesk, mono Spline Sans Mono
Status accepted. Geist was the first pick; the design detector flagged it as overused and the craft reference lists it. Bricolage Grotesque stays as the display voice.

## ADR-011 · Vercel for frontend and API, one project
Date 2026-11-17 · Status accepted. Static build plus a Python function behind rewrites keeps everything on one domain: no CORS, the webhook and click redirect share the brand domain, and one deploy ships both.

## ADR-012 · Launch with an empty board
Status accepted. No seeded listings or payments in production; the site shows honest empty states and hides stats until DataFast reports data. Business details are configuration, not copy.

## ADR-013 · Sky-blue accent, dark theme only
Status accepted. Replaces the five-accent picker (ADR-009's palette). One brand colour, `#38bdf8`, reads more like a product than a demo.

## ADR-014 · Hero tubes background
Status accepted. The threejs-components tubes cursor effect replaces the 2D point field, scoped to the first viewport, in brand colours, with click-to-cycle curated palettes instead of random colours.

## ADR-015 · Founder contacts only on the listing page
Status accepted. Email and phone are useful to buyers on a listing page but should not be harvestable from list endpoints.

## ADR-016 · Dark theme only
Date 2026-11-17 · Status accepted. The light theme and its toggle are removed; dark is the brand. Text tokens were raised (ink-2 #d4d4dc, ink-3 #a8a8b4) so nothing reads as hidden.

## ADR-017 · Progressive claim form
Status accepted. Required fields carry `*`. Optional startup details appear automatically once the required URL and category are filled, so the first view stays short and nothing is tucked behind a toggle.

## ADR-018 · ₹9 entry, +₹10 to overtake
Date 2026-11-17 · Status accepted. A new listing (main board or Deals) costs at least ₹9. Taking any rank, including #1, costs that rank's current total plus ₹10; raising your own listing is at least ₹10. One small, uniform add-on replaces the earlier ₹99 floor and +₹100 for #1.
